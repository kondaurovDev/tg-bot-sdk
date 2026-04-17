---
title: How it works
description: How the code generator scrapes Telegram's HTML and produces TypeScript types
---

One code generator handles both [Bot API types](/api-types/bot-api/) and [Mini App types](/api-types/webapp/). It scrapes two official Telegram HTML pages and produces TypeScript types and Markdown docs from each.

## Shared Pipeline

Both pages go through the same pipeline:

```
core.telegram.org/bots/api          core.telegram.org/bots/webapps
            |                                    |
       fetch & cache                        fetch & cache
       (input/api.html)                     (input/webapp.html)
            |                                    |
            v                                    v
        DocPage                             WebAppPage
            |                                    |
     ┌──────┴──────┐                             |
     v             v                             v
 ExtractedType  ExtractedMethod           ExtractedWebApp
     |             |                       |          |
     v             v                       v          v
  types.ts      api.ts                 webapp.ts   (types)
     |             |
     └──────┬──────┘
            v
     docs/ (markdown)
```

1. **Fetch** — `PageProviderService` downloads HTML from `core.telegram.org` and caches it locally in `input/`.
2. **Parse** — HTML is parsed into a DOM tree using `node-html-parser`. Each entity is located by its `<a class="anchor">` tag.
3. **Extract** — the extraction pipeline walks the DOM and deterministically converts HTML into typed structures.
4. **Generate TypeScript** — a string-based emitter + prettier emits `.ts` files.
5. **Generate Markdown** — extracted data is converted into browsable `.md` files with cross-linked types.

```bash
# generate everything
pnpm gen

# or individually
pnpm gen:bot:api
pnpm gen:webapp:api
```

## Bot API Extraction

The Bot API documentation (`core.telegram.org/bots/api`) is a single long HTML page with a regular structure. The extractor (`DocPage`) exploits this regularity.

### Page Layout

```html
<h3>Getting updates</h3>           <!-- group name -->
  <h4><a class="anchor" name="getUpdates"/>getUpdates</h4>
    <p>...</p>                      <!-- description -->
    <table>...</table>              <!-- field definitions -->
  <h4><a class="anchor" name="update"/>Update</h4>
    <p>...</p>
    <table>...</table>
```

- **`<h3>`** sets the current section group (e.g. "Getting updates", "Available types")
- **`<h4>`** is an individual entity — a type or a method

### Type vs Method

There is no HTML attribute that distinguishes a type from a method. Telegram consistently uses:

- **Uppercase first letter** → Type (e.g. `User`, `Chat`, `Message`)
- **Lowercase first letter** → Method (e.g. `sendMessage`, `getUpdates`)

### Entity Extraction

Starting from each `<h4>`, the extractor walks siblings to collect:

1. **`<p>` paragraphs** — description and (for methods) the return type sentence
2. **`<table>`** — field/parameter definitions
3. **`<ul>`** — union type members → `ChatMemberOwner | ChatMemberAdministrator | ...`

**Return type** is detected by patterns like `"On success"`, `"Returns "`, or `"is returned"`.

**4-column tables** (methods) have an explicit Required column. **3-column tables** (types) mark optional fields with `"Optional."` in the description.

### Type Mapping

Telegram pseudo-types are mapped to TypeScript:

| Telegram | TypeScript |
|----------|------------|
| `String` | `string` |
| `Integer`, `Int` | `number` |
| `Float` | `number` |
| `Boolean`, `True`, `False` | `boolean` |
| `Array of X` | `X[]` |
| `X or Y` | `X \| Y` |
| `InputFile` | `{ file_content: Uint8Array, file_name: string }` |

### Enum Extraction

Some `String` fields represent enums. Descriptions with hints like `"one of"`, `"must be"`, `"always"` trigger string literal union extraction:

```ts
emoji: "dice" | "darts" | "bowling" | "basketball" | "football" | "slot_machine"
```

## Mini App Extraction

The Mini Apps documentation (`core.telegram.org/bots/webapps`) uses the same HTML structure with `<h4>` headings, but has key differences that `WebAppPage` handles.

### The `Function` Pseudo-Type

The Mini Apps docs use `Function` as a type for callable fields. The extractor detects this and converts fields ending with `()` into function signatures.

### Manual Overrides

Since the Mini Apps docs don't specify parameter types for most functions, webapp methods rely heavily on **manual type overrides** in `typeOverrides` to produce correct TypeScript signatures.

## Override Mechanisms

Both Bot API and Mini App extraction support three override mechanisms for cases that can't be inferred from the HTML:

1. **`typeOverrides`** — per-entity, per-field type replacements
2. **`typeAliasOverrides`** — for types that have no `<table>` or `<ul>` (e.g. `InputFile`)
3. **`returnTypeOverrides`** — for methods whose return type is ambiguous (e.g. `sendMediaGroup` → `Message[]`)

## Module Map

```
codegen/
├── main.ts              entry point
├── runtime.ts           Effect runtimes (DI wiring)
├── types.ts             shared type aliases
│
├── scrape/
│   ├── type-system.ts   type representation & conversion
│   ├── entity.ts        single-entity extraction from HTML
│   ├── page.ts          DocPage & WebAppPage — HTML page models
│   └── entities.ts      batch extraction — walks full page
│
└── service/
    ├── page-provider.ts  fetches & caches HTML
    ├── code-writers.ts   emitter-backed TypeScript generation
    ├── emitter.ts        string-based TS emitter + prettier
    └── markdown.ts       markdown docs generation
```
