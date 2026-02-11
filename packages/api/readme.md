[![NPM Version](https://img.shields.io/npm/v/%40effect-ak%2Ftg-bot-api)](https://www.npmjs.com/package/@effect-ak/tg-bot-api)
![Telegram Bot API](https://img.shields.io/badge/BotApi-9.3-blue?link=)
![Telegram WebApp](https://img.shields.io/badge/Telegram.WebApp-9.1-blue?link=)

## Highlights:

- **Complete and Up-to-Date Telegram Bot API**: The entire API is generated from [the official documentation](https://core.telegram.org/bots/api) using a [code generator](./codegen/main.ts), ensuring this client remains in sync and supports every method and type provided by the **Telegram Bot API**.
- **[Types for Webapps](#webapps-typings)** Types that describe `Telegram.WebApp`. Created by [code generator](./codegen/main.ts) as well.
- **Type Mapping**: Types from the documentation are converted to TypeScript types:
  - `Integer` → `number`
  - `True` → `boolean`
  - `String or Number` → `string | number`
  - Enumerated types, such as `"Type of the chat can be either "private", "group", "supergroup" or "channel""`, are converted to a standard union of literal types `"private" | "group" | "supergroup" | "channel"`
  - And more...

## Webapps typings

Telegram provides a big [html](https://core.telegram.org/bots/webapps) page that describes `Telegram.WebApp`

```typescript
import type { WebApp } from "@effect-ak/tg-bot-client/webapp"

interface Telegram {
  WebApp: TgWebApp
}

declare const Telegram: Telegram

const saveData = () => {
  Telegram.WebApp.CloudStorage.setItem("key1", "some data", (error) => {
    if (error == null) {
      console.log("Saved!")
    }
  })
}
```

## Code generation

Scrapes the official Telegram documentation HTML and generates:

- **TypeScript types** for Bot API and Mini Apps (`src/specification/`)
- **Markdown docs** with method/type reference pages (`docs/`)

### Pipeline

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

2. **Parse** — `DocPage` / `WebAppPage` parse the HTML into a DOM tree (`node-html-parser`). Each entity is located by its `<a class="anchor">` tag.

3. **Extract entities** — for every `<h4>` heading on the page the extraction pipeline deterministically converts HTML into typed structures. See [Extraction semantics](#extraction-semantics) below for the full details.

4. **Generate TypeScript** — `BotApiCodeWriterService` and `WebAppCodeWriterService` use `ts-morph` to emit `.ts` files with interfaces, type aliases, and method signatures.

5. **Generate Markdown** — `MarkdownWriterService` converts the same extracted data into browsable `.md` files with cross-linked types.

### Usage

```bash
# generate everything (Bot API types + docs + Mini Apps types)
pnpm gen

# or individually
pnpm gen:bot:api
pnpm gen:webapp:api
```

### Tests

```bash
pnpm test
```

Tests use cached HTML fixtures from `input/` — no network requests during test runs after the first download.

## Extraction semantics

The Telegram Bot API documentation page (`core.telegram.org/bots/api`) is a single long HTML page with a regular, predictable structure. Every type and method is defined as a sequence of sibling HTML elements under its heading. The codegen exploits this regularity to extract everything deterministically, without any heuristic guessing.

### Page layout: H3 groups and H4 entities

```
<h3>Getting updates</h3>           ← group name (section header)
  <h4><a class="anchor" name="getUpdates"/>getUpdates</h4>   ← entity
    <p>...</p>                      ← description paragraph(s)
    <table>...</table>              ← field definitions (or <ul> for union types)
  <h4><a class="anchor" name="update"/>Update</h4>
    <p>...</p>
    <table>...</table>
```

The batch extractor (`entities.ts`) walks all `<h3>` and `<h4>` nodes in document order:
- **`<h3>`** sets the current section group (e.g. "Getting updates", "Available types").
- **`<h4>`** is an individual entity — a type or a method.

### Locating a single entity

Every `<h4>` heading contains an `<a class="anchor" name="...">` child. This gives a stable, lowercase slug for the entity (e.g. `name="sendmessage"`). To look up a specific entity, `DocPage.getEntity()` does:

```ts
this.node.querySelector(`a.anchor[name="${name.toLowerCase()}"]`)
```

then extracts from the anchor's parent `<h4>` node.

### Type vs Method — first character case

There is no HTML attribute that distinguishes a type from a method. Instead, Telegram consistently uses:

- **Uppercase first letter** → Type definition (e.g. `User`, `Chat`, `Message`)
- **Lowercase first letter** → API method (e.g. `sendMessage`, `getUpdates`, `setWebhook`)

The `isComplexType` / `startsWithUpperCase` helper makes this check. It is the single decision point: uppercase entities are extracted as `ExtractedType`, lowercase as `ExtractedMethod`.

### Entity structure: walking siblings from H4

Starting from the `<h4>` node, the extractor walks `nextElementSibling` to collect:

1. **`<p>` paragraphs** — entity description, and (for methods) the return type sentence.
2. **`<table>`** — field/parameter definitions → produces `EntityFields` (an object type with named properties).
3. **`<ul>`** — union type members → produces `NormalType` (a union `A | B | C`).

The walk stops when it hits another `<h4>` (next entity), a `<table>`, or a `<ul>`. A safety limit of 10 sibling steps prevents runaway walks on malformed HTML.

### Description and return type extraction

Description `<p>` paragraphs are split on `. ` (period + space) or `.<br>` into individual sentences. Each sentence is stripped of HTML tags to get plain text.

For **methods**, return type sentences are identified by three patterns:

| Pattern | Example |
|---------|---------|
| Starts with `"On success"` | "On success, a Message object is returned" |
| Starts with `"Returns "` | "Returns an Array of Update objects" |
| Ends with `"is returned"` | "The sent Message is returned" |

Type names are extracted from `<a>` and `<em>` tags inside these sentences using the regex `/\w+(?=<\/(a\|em)>)/g` — this matches the word just before a closing `</a>` or `</em>` tag. Only uppercase-initial names pass (primitives like "true" are skipped).

Array return types are detected by checking for `"an array of <TypeName>"` (case-insensitive) in the plain text.

### Table parsing: 3-column vs 4-column

Telegram uses two table layouts:

**4-column tables** (method parameters):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| chat_id | Integer or String | Yes | Unique identifier... |
| text | String | Yes | Text of the message... |
| parse_mode | String | Optional | Mode for parsing... |

Columns: `name` (0), `type` (1), `required` (2), `description` (3).
Column 2 is either `"Yes"` or `"Optional"`.

**3-column tables** (type fields):

| Field | Type | Description |
|-------|------|-------------|
| message_id | Integer | Unique message identifier... |
| from | User | Optional. Sender of the message... |

Columns: `name` (0), `type` (1), `description` (2).
There is no explicit "Required" column — instead, optional fields have their description start with `"Optional."`. The extractor checks:

```ts
if (all.length == 3) {
  const isOptional = description[0].includes("Optional")
  required = !isOptional
}
```

Required fields are sorted before optional ones in the output.

### Union types from `<ul>` lists

Some types are defined not by a table but by a bulleted list:

```html
<h4>ChatMemberStatus</h4>
<p>This object represents ...</p>
<ul>
  <li>ChatMemberOwner</li>
  <li>ChatMemberAdministrator</li>
  <li>ChatMemberMember</li>
  ...
</ul>
```

Each `<li>` text becomes one arm of the TypeScript union:

```ts
type ChatMemberStatus = ChatMemberOwner | ChatMemberAdministrator | ChatMemberMember | ...
```

### Pseudo-type mapping

Telegram uses its own type names (pseudo-types). The mapping is straightforward:

| Telegram pseudo-type | TypeScript |
|---------------------|------------|
| `String` | `string` |
| `Integer`, `Int` | `number` |
| `Float` | `number` |
| `Boolean`, `True`, `False` | `boolean` |
| `Array of X` | `X[]` |
| `X or Y` | `X \| Y` |
| `InputFile` | `{ file_content: Uint8Array, file_name: string }` |

Nested arrays (`Array of Array of PhotoSize`) are handled by counting `Array of` occurrences and appending the matching number of `[]` brackets.

### Enum extraction from descriptions

Some `String` fields actually represent a finite set of values. The descriptions contain natural-language hints:

> Type of the emoji, currently one of "dice", "darts", "bowling", "basketball", "football", "slot_machine"

The extractor looks for **indicator keywords**: `"must be"`, `"always"`, `"one of"`, `"can be"`. When found, it extracts quoted values using a regex that handles both straight quotes (`"`) and Unicode curly quotes (`\u201C`/`\u201D`), which appear in different parts of the Telegram docs.

These are emitted as string literal unions:

```ts
emoji: "dice" | "darts" | "bowling" | "basketball" | "football" | "slot_machine"
```

The `parse_mode` field is a special case — it is always overridden to `"HTML" | "MarkdownV2"` regardless of the description text.

### The `Function` pseudo-type (Mini Apps)

The Mini Apps documentation uses `Function` as a pseudo-type for callable fields. When the table says:

| Field | Type | Description |
|-------|------|-------------|
| sendData() | Function | ... |
| isVersionAtLeast() | Function | ... |

The extractor detects `pseudoType == "Function"` and converts:
- Fields ending with `()` → function signatures (return type derived from the entity name)
- The field name is trimmed to remove the `()` suffix

Since the documentation doesn't specify parameter types for these functions, most webapp methods have **manual type overrides** in `typeOverrides` (see `type-system.ts`).

### Manual overrides

Some types cannot be inferred from the HTML structure alone. Three override mechanisms handle these:

1. **`typeOverrides`** — per-entity, per-field type replacements. Used extensively for Mini Apps methods (callbacks, complex parameter types) and a few Bot API fields like `allowed_updates` and `sendChatAction.action`.

2. **`typeAliasOverrides`** — for types that have no `<table>` or `<ul>` (e.g. `InputFile`). When `findTypeNode` hits the next `<h4>` without finding a type definition, the override provides the TypeScript type.

3. **`returnTypeOverrides`** — for methods whose return type sentence is ambiguous or missing (e.g. `sendMediaGroup` returns `Message[]`).

## Module map

```
codegen/
├── main.ts              entry point, reads MODULE_NAME env var
├── runtime.ts           Effect runtimes (DI wiring)
├── types.ts             shared type aliases (HtmlElement, TsSourceFile)
│
├── scrape/
│   ├── type-system.ts   type representation & conversion (NormalType, EntityFields)
│   ├── entity.ts        single-entity extraction from HTML nodes
│   ├── page.ts          DocPage & WebAppPage — HTML page models
│   └── entities.ts      batch extraction — walks full page, collects all types & methods
│
└── service/
    ├── index.ts          barrel re-exports
    ├── page-provider.ts  fetches & caches documentation HTML
    ├── code-writers.ts   ts-morph TypeScript code generation
    └── markdown.ts       markdown docs generation
```
