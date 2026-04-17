/**
 * @module page
 *
 * HTML page models for Telegram documentation.
 *
 * {@link DocPage} represents the main Bot API docs page
 * (`https://core.telegram.org/bots/api`).
 * {@link WebAppPage} represents the Mini Apps docs page
 * (`https://core.telegram.org/bots/webapps`).
 *
 * Both expose `getEntity`, `getType`, and `getLatestVersion` for locating
 * entities by anchor name in the parsed HTML tree.
 */
import { Either, pipe } from "effect"

import { HtmlElement, parseStringToHtml, HtmlPageDocumentation } from "~/types"
import {
  ExtractedEntity,
  ExtractedType,
  ExtractedMethod,
  ExtractEntityError
} from "~/scrape/entity"

type ToAnchor = (name: string) => string

const findEntityByAnchor = (
  node: HtmlElement,
  name: string,
  toAnchor: ToAnchor
) =>
  pipe(
    Either.fromNullable(
      node.querySelector(`a.anchor[name="${toAnchor(name)}"]`),
      () =>
        ExtractEntityError.make("TypeDefinition:NotFound", {
          entityName: name
        })
    ),
    Either.andThen((_) => ExtractedEntity.makeFrom(_.parentNode))
  )

const getLatestVersion = (node: HtmlElement) =>
  Either.fromNullable(
    node
      .querySelectorAll("p > strong")
      .find((el) => /^Bot API \d/.test(el.text))
      ?.text?.split(" ")
      .at(-1),
    () => new Error("Html node with latest API version not found")
  )

abstract class BasePage implements HtmlPageDocumentation {
  constructor(
    readonly node: HtmlElement,
    private readonly toAnchor: ToAnchor
  ) {}

  getEntity(name: string) {
    return findEntityByAnchor(this.node, name, this.toAnchor)
  }

  getType(name: string) {
    return pipe(this.getEntity(name), Either.andThen(ExtractedType.makeFrom))
  }

  getLatestVersion() {
    return getLatestVersion(this.node)
  }
}

// ── DocPage ──

const botApiAnchor: ToAnchor = (name) => name.toLowerCase()

export class DocPage extends BasePage {
  static fromHtmlString(html: string) {
    return parseStringToHtml(html).pipe(
      Either.andThen((node) => new DocPage(node))
    )
  }

  private constructor(node: HtmlElement) {
    super(node, botApiAnchor)
  }

  getMethod(name: string) {
    return pipe(this.getEntity(name), Either.andThen(ExtractedMethod.makeFrom))
  }
}

// ── WebAppPage ──

const webAppAnchor: ToAnchor = (name) =>
  name.toLowerCase().replaceAll(" ", "-")

export class WebAppPage extends BasePage {
  static fromHtmlString(html: string) {
    return parseStringToHtml(html).pipe(
      Either.andThen((node) => new WebAppPage(node))
    )
  }

  private constructor(node: HtmlElement) {
    super(node, webAppAnchor)
  }

  getWebApp() {
    return this.getEntity("initializing mini apps")
  }
}
