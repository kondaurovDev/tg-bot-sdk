/**
 * @module examples
 * The bots the playground offers. Their sources live in `examples/` as
 * ordinary TypeScript — typechecked with the package — and come in as
 * strings through Vite's `?raw`.
 */
import command from "../examples/command.ts?raw"
import dice from "../examples/dice.ts?raw"
import echo from "../examples/echo.ts?raw"
import empty from "../examples/empty.ts?raw"
import file from "../examples/file.ts?raw"
import inline from "../examples/inline.ts?raw"
import rich from "../examples/rich.ts?raw"
import screens from "../examples/screens.ts?raw"
import stream from "../examples/stream.ts?raw"
import widget from "../examples/widget.ts?raw"

export interface Example {
  /** The file name; also the key of the visitor's saved edits. */
  file: string
  label: string
  group: string
  hint: string
  code: string
}

export const EXAMPLES: readonly Example[] = [
  {
    file: "empty.ts",
    label: "Hello, world",
    group: "Basics",
    hint: "The smallest possible bot",
    code: empty
  },
  {
    file: "echo.ts",
    label: "Echo & reactions",
    group: "Basics",
    hint: "Multiple actions per handler, message reactions",
    code: echo
  },
  {
    file: "command.ts",
    label: "Commands",
    group: "Basics",
    hint: "Guarded handlers, HTML parse mode",
    code: command
  },
  {
    file: "screens.ts",
    label: "Screens: menu",
    group: "UI & navigation",
    hint: "defineScreens — inline-keyboard navigation as data",
    code: screens
  },
  {
    file: "rich.ts",
    label: "Rich messages",
    group: "UI & navigation",
    hint: "Blocks: headings, tables, code, styled buttons",
    code: rich
  },
  {
    file: "widget.ts",
    label: "Widget: tic-tac-toe",
    group: "UI & navigation",
    hint: "HTML widget in a message, requests to the bot (Bot API 10.4)",
    code: widget
  },
  {
    file: "inline.ts",
    label: "Inline mode",
    group: "UI & navigation",
    hint: "@bot query → results → sent via the bot",
    code: inline
  },
  {
    file: "stream.ts",
    label: "Streaming replies",
    group: "AI",
    hint: "ctx.stream — live drafts like an LLM bot",
    code: stream
  },
  {
    file: "file.ts",
    label: "Files",
    group: "Media & fun",
    hint: "Documents both ways, getFile round-trip",
    code: file
  },
  {
    file: "dice.ts",
    label: "Dice casino",
    group: "Media & fun",
    hint: "Chat actions, dice, callback buttons",
    code: dice
  }
]

export const DEFAULT_EXAMPLE = "empty.ts"

export const findExample = (file: string): Example | undefined =>
  EXAMPLES.find((example) => example.file === file)
