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
 * Both expose `getEntity`, `getType`, and `getMethod` for locating
 * entities by anchor name in the parsed HTML tree.
 */
import { Data, Either, pipe } from "effect"

import { HtmlElement, parseStringToHtml, HtmlPageDocumentation } from "~/types"
import {
  ExtractedEntity,
  ExtractedType,
  ExtractedMethod,
  ExtractEntityError
} from "~/scrape/entity"

// ── Shared helpers ──

const findEntityByAnchor = (
  node: HtmlElement,
  name: string,
  toAnchor: (name: string) => string
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

const getTypeFromEntity = (
  node: HtmlElement,
  name: string,
  toAnchor: (name: string) => string
) =>
  pipe(
    findEntityByAnchor(node, name, toAnchor),
    Either.andThen(ExtractedType.makeFrom)
  )

// ── DocPageError ──

type DocPageErrorCode = "EntityNoFound"

interface DocPageErrorDetails {
  entityName?: string
}

export class DocPageError extends Data.TaggedError("DocPageError")<{
  error: DocPageErrorCode
  details?: DocPageErrorDetails | undefined
}> {
  static make(error: DocPageErrorCode, details?: DocPageErrorDetails) {
    return new DocPageError({ error, details })
  }
}

// ── DocPage ──

const botApiAnchor = (name: string) => name.toLowerCase()

export class DocPage
  extends Data.Class<{
    node: HtmlElement
  }>
  implements HtmlPageDocumentation
{
  static fromHtmlString(html: string) {
    return parseStringToHtml(html).pipe(
      Either.andThen((node) => new DocPage({ node }))
    )
  }

  getEntity(name: string) {
    return findEntityByAnchor(this.node, name, botApiAnchor)
  }

  getType(name: string) {
    return getTypeFromEntity(this.node, name, botApiAnchor)
  }

  getMethod(name: string) {
    return pipe(this.getEntity(name), Either.andThen(ExtractedMethod.makeFrom))
  }

  getLatestVersion() {
    return Either.fromNullable(
      this.node.querySelector("p > strong")?.text?.split(" ").at(-1),
      () => new Error("Html node with latest API version not found")
    )
  }
}

// ── WebAppPage ──

const webAppAnchor = (name: string) =>
  name.toLowerCase().replaceAll(" ", "-")

export class WebAppPage
  extends Data.Class<{
    node: HtmlElement
  }>
  implements HtmlPageDocumentation
{
  static fromHtmlString(html: string) {
    return parseStringToHtml(html).pipe(
      Either.andThen((node) => new WebAppPage({ node }))
    )
  }

  getEntity(name: string) {
    return findEntityByAnchor(this.node, name, webAppAnchor)
  }

  getType(name: string) {
    return getTypeFromEntity(this.node, name, webAppAnchor)
  }

  getWebApp() {
    return this.getEntity("initializing mini apps")
  }
}
