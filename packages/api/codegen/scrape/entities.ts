/**
 * @module entities
 *
 * Batch extraction — walks an entire documentation page and collects all
 * types and methods into a single result.
 *
 * {@link ExtractedEntities} processes the Bot API page (H3 groups + H4 items).
 * {@link ExtractedWebApp} processes the Mini Apps page (webapp fields + related types).
 */
import { Data, Either, String } from "effect"

import type { HtmlPageDocumentation } from "~/types"
import { isComplexType, type EntityField } from "~/scrape/type-system"
import {
  ExtractEntityError,
  type ExtractedEntityShape,
  ExtractedType,
  type ExtractedMethod
} from "~/scrape/entity"
import { type DocPageError, DocPage, WebAppPage } from "~/scrape/page"

// ── ExtractedEntitiesError ──

type ExtractedEntitiesErrorCode = ["NodesNotFound", "GroupNameNotDefined"][number]

export class ExtractedEntitiesError extends Data.TaggedError("NodesNotFound")<{
  error: ExtractedEntitiesErrorCode
  details?: string
}> {
  static make(error: ExtractedEntitiesErrorCode) {
    return new ExtractedEntitiesError({ error })
  }
}

// ── Entity extraction ──

const method_type_name_regex = /^\w+$/

type ExtractError = ExtractEntityError | ExtractedEntitiesError | DocPageError

type TitleExtractor = (node: import("~/types").HtmlElement) => string | undefined

const extractTypesFromPage = (
  page: HtmlPageDocumentation,
  getTitle: TitleExtractor
): Either.Either<ExtractedType[], ExtractError> => {
  const nodes = page.node.querySelectorAll("h4")

  if (nodes.length == 0)
    return Either.left(ExtractedEntitiesError.make("NodesNotFound"))

  const result: ExtractedType[] = []

  for (const node of nodes) {
    const title = getTitle(node)
    if (!title || !method_type_name_regex.test(title)) continue
    if (!isComplexType(title)) continue

    const type = page.getType(title)
    if (type._tag == "Left") return Either.left(type.left)
    result.push(type.right)
  }

  result.sort((a, b) => a.typeName.localeCompare(b.typeName))
  return Either.right(result)
}

const botApiTitle: TitleExtractor = (node) =>
  node.childNodes.at(1)?.text

// childNodes.at(2) is needed for webapp HTML structure
const webAppTitle: TitleExtractor = (node) =>
  node.childNodes.at(2)?.text?.trim() ||
  node.childNodes.at(1)?.text?.trim()

const extractEntities = (
  page: DocPage
): Either.Either<ExtractedEntitiesShape, ExtractError> => {
  const types = extractTypesFromPage(page, botApiTitle)
  if (Either.isLeft(types)) return Either.left(types.left)

  const nodes = page.node.querySelectorAll("h3, h4")

  if (nodes.length == 0)
    return Either.left(ExtractedEntitiesError.make("NodesNotFound"))

  const methods: ExtractedMethod[] = []
  let currentGroup: string | undefined

  for (const node of nodes) {
    const title = node.childNodes.at(1)?.text

    if (node.tagName == "H3") {
      currentGroup = title
      continue
    }

    if (!currentGroup)
      return Either.left(ExtractedEntitiesError.make("GroupNameNotDefined"))

    if (!title || !method_type_name_regex.test(title)) continue
    if (isComplexType(title)) continue

    const method = page.getMethod(title)

    if (method._tag == "Left") return Either.left(method.left)

    methods.push({
      ...method.right,
      groupName: makeGroupName(currentGroup)
    })
  }

  methods.sort((a, b) => a.methodName.localeCompare(b.methodName))

  return Either.right({ types: types.right, methods })
}

const makeGroupName = (input: string) =>
  String.snakeToKebab(input.toLowerCase().replaceAll(" ", "_"))

// ── ExtractedEntities ──

export interface ExtractedEntitiesShape {
  methods: ExtractedMethod[]
  types: ExtractedType[]
}

export const extractBotApiEntities = (page: DocPage) =>
  extractEntities(page)

// ── ExtractedWebApp ──

export interface ExtractedWebAppShape {
  webapp: ExtractedEntityShape
  fields: EntityField[]
  types: ExtractedType[]
}

const extractFromPage = (page: WebAppPage) => {
  const tgWebEvent = page.getWebApp()

  if (tgWebEvent._tag == "Left") return Either.left(tgWebEvent.left)

  if (tgWebEvent.right.type._tag != "EntityFields") {
    return ExtractEntityError.left("TypeDefinition:NotFound", {
      entityName: "WebApp"
    })
  }

  const types = extractTypesFromPage(page, webAppTitle)

  if (types._tag == "Left") {
    return Either.left(types)
  }

  return Either.right(
    new ExtractedWebApp({
      webapp: tgWebEvent.right,
      fields: tgWebEvent.right.type.fields,
      types: types.right
    })
  )
}

export class ExtractedWebApp extends Data.TaggedClass(
  "ExtractedWebApp"
)<ExtractedWebAppShape> {
  static make(page: WebAppPage) {
    return extractFromPage(page)
  }
}
