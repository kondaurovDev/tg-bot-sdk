/**
 * @module entity
 *
 * Extraction of individual entities (types and methods) from HTML nodes.
 *
 * Parses an H4 heading and its sibling nodes from the Telegram documentation
 * page, extracting entity name, description, return type, and field definitions
 * from TABLE or UL elements.
 *
 * Key exports:
 * - {@link ExtractedEntity} — raw entity extracted from an H4 node
 * - {@link ExtractedType} — a type definition (e.g. `User`, `Chat`)
 * - {@link ExtractedMethod} — an API method (e.g. `sendMessage`, `getUpdates`)
 * - {@link removeHtmlTags} — utility reused by the OpenAPI writer
 */
import { Array, Data, Either, Match, Option, pipe } from "effect"
import he from "he"

import type { HtmlElement } from "~/types"
import { collectWarning } from "~/warnings"
import { returnTypeOverrides, typeAliasOverrides } from "~/scrape/overrides"
import {
  NormalType,
  EntityFields,
  isComplexType,
  startsWithUpperCase,
  INITIALING_MINI_APPS
} from "~/scrape/type-system"
import {
  array,
  parsePseudoType,
  type SpecType,
  union
} from "~/scrape/type"

// ── ExtractEntityError ──

type ExtractEntityErrorCode = [
  "UnexpectedValue",
  "NoTitle",
  "NoDescription",
  "NoColumn",
  "EmptyList",
  "NoTypes",
  "NoMethods",
  "TypeDefinition:StopTagEncountered",
  "TypeDefinition:TooManySteps",
  "TypeDefinition:NotFound",
  "TypeDefinition:NoSiblings",
  "Description:NotFound",
  "Description:Empty",
  "Description:TooManyReturns",
  "Description:NoReturnTypes",
  "Method:ReturnTypeNotFound"
][number]

interface ErrorDetails {
  entityName?: string
  columnName?: "name" | "type" | "description" | "required"
  sentenceWithReturn?: string
}

export class ExtractEntityError extends Data.TaggedError("ExtractTypeError")<{
  error: ExtractEntityErrorCode
  details?: ErrorDetails | undefined
}> {
  static make(error: ExtractEntityErrorCode, details?: ErrorDetails) {
    return new ExtractEntityError({ error, details })
  }

  static left(...input: Parameters<typeof ExtractEntityError.make>) {
    return Either.left(ExtractEntityError.make(...input))
  }
}

// ── Constants ──

const type_node_set = new Set(["TABLE", "UL"])
const new_entity_tag_set = new Set([...type_node_set, "H4"])

const optional_field_label = "Optional"

// ── findTypeNode ──

const MAX_STEPS = 10

const findTypeNode = (
  node: HtmlElement
): Either.Either<HtmlElement, ExtractEntityError> => {
  let current = node.nextElementSibling

  for (let step = 1; step <= MAX_STEPS; step++) {
    if (!current) return ExtractEntityError.left("TypeDefinition:NoSiblings")
    if (current.tagName == "H4")
      return ExtractEntityError.left("TypeDefinition:StopTagEncountered")
    if (type_node_set.has(current.tagName)) return Either.right(current)
    current = current.nextElementSibling
  }

  return ExtractEntityError.left("TypeDefinition:NotFound")
}

// ── Description extraction ──

const description_split_regex = /(?:\.\s+)|(?:\.<br>)/g
const contains_letters_regex = /\w{1,}/
const type_tags_regex = /\w+(?=<\/(a|em)>)/g
const html_tags_regex = /<\/?[^>]+>/g

const isReturnSentence = (_: string) =>
  _.startsWith("On success") ||
  _.endsWith("is returned") ||
  _.startsWith("Returns ")

export const removeHtmlTags = (input: string) =>
  he.decode(input.replaceAll(html_tags_regex, ""))

/** Split HTML by sentence boundaries, keeping only non-empty parts with letters. */
const splitHtmlToSentences = (html: string): string[] => {
  const result: string[] = []
  for (const part of html.split(description_split_regex)) {
    if (part && contains_letters_regex.test(part)) result.push(part)
  }
  return result
}

/** Walk siblings until a stop-tag, collecting HTML sentences. */
const collectSiblingsSentences = (node: HtmlElement): string[] => {
  const sentences: string[] = []
  let current: HtmlElement | null = node.nextElementSibling

  while (current && !new_entity_tag_set.has(current.tagName)) {
    sentences.push(...splitHtmlToSentences(current.innerHTML))
    current = current.nextElementSibling
  }

  return sentences
}

/** Extract candidate return types from a single HTML sentence. */
const extractReturnTypes = (
  htmlLine: string,
  plainLine: string
): SpecType[] =>
  pipe(
    Array.fromIterable(htmlLine.matchAll(type_tags_regex)),
    Array.filterMap((_) => {
      const originName = _[0]
      if (!isComplexType(originName)) return Option.none()
      const parsed = parsePseudoType(originName)
      if (!parsed) return Option.none()
      const isArray = plainLine
        .toLowerCase()
        .includes(`an array of ${originName.toLowerCase()}`)
      return Option.some(isArray ? array(parsed) : parsed)
    })
  )

const dedupeSpecTypes = (types: SpecType[]): SpecType[] => {
  const seen = new Set<string>()
  const out: SpecType[] = []
  for (const t of types) {
    const key = JSON.stringify(t)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(t)
  }
  return out
}

/** Classify HTML sentences into description lines and return types. */
const extractEntityDescription = (
  node: HtmlElement,
  entityName: string
): Either.Either<
  ExtractedEntityShape["entityDescription"],
  ExtractEntityError
> => {
  const sentences = collectSiblingsSentences(node)
  const returnTypeOverridden = returnTypeOverrides[entityName]

  const lines: string[] = []
  const returnTypes: SpecType[] = []

  for (const htmlLine of sentences) {
    const plainLine = removeHtmlTags(htmlLine)

    if (!returnTypeOverridden && isReturnSentence(plainLine)) {
      const parsed = extractReturnTypes(htmlLine, plainLine)
      if (Array.isNonEmptyArray(parsed)) {
        returnTypes.push(...parsed)
        continue
      }
    }

    lines.push(plainLine)
  }

  if (Array.isNonEmptyArray(lines) && lines[0].length != 0) {
    if (returnTypeOverridden) {
      return Either.right({ lines, returns: returnTypeOverridden })
    }
    const deduped = dedupeSpecTypes(returnTypes)
    if (deduped.length === 1) {
      return Either.right({ lines, returns: deduped[0] })
    }
    if (deduped.length > 1) {
      return Either.right({
        lines,
        returns: union(
          deduped[0],
          deduped[1],
          ...deduped.slice(2)
        )
      })
    }
    return Either.right({ lines, returns: undefined })
  } else if (returnTypes.length == 0 && !startsWithUpperCase(entityName)) {
    collectWarning({
      kind: "no-return-type",
      entityName,
      reason: "no return type detected in description"
    })
  }

  return ExtractEntityError.left("Description:Empty", { entityName })
}

export const extractFieldDescription = (input: HtmlElement) =>
  splitHtmlToSentences(input.innerHTML).map((line) =>
    removeHtmlTags(replaceImgWithAlt(line))
  )

function replaceImgWithAlt(text: string): string {
  const imgTagRegex = /<img[^>]*alt="([^"]*)"[^>]*>/g
  return text.replace(imgTagRegex, "$1")
}

// ── Type extraction ──

const extractType = (
  node: HtmlElement,
  entityName: string
): Either.Either<ExtractedEntityShape["type"], ExtractEntityError> =>
  pipe(
    Match.value(node.tagName),
    Match.when("TABLE", () => extractFromTable(node, entityName)),
    Match.when("UL", () => extractFromList(node)),
    Match.orElse(() => ExtractEntityError.left("NoTypes"))
  )

const extractFromList = (node: HtmlElement) => {
  const oneOf: string[] = []

  const nodes = node.querySelectorAll("li")

  for (const node of nodes) {
    oneOf.push(node.text)
  }

  if (Array.isNonEmptyArray(oneOf)) {
    const members = oneOf.map((name) => parsePseudoType(name)).filter(
      (t): t is SpecType => t !== null
    )
    if (members.length === 1) {
      return Either.right(NormalType.fromSpec(members[0]))
    }
    if (Array.isNonEmptyArray(members) && members.length >= 2) {
      return Either.right(
        NormalType.fromSpec(
          union(members[0], members[1], ...members.slice(2))
        )
      )
    }
  }

  return ExtractEntityError.left("NoTypes")
}

const extractFromTable = (node: HtmlElement, entityName: string) => {
  const fields = new EntityFields({ fields: [] })

  const rows = node.querySelectorAll("tbody tr")

  for (const row of rows) {
    const all = row.querySelectorAll("td")

    let fieldName = all.at(0)?.childNodes.at(0)?.text?.trim()
    if (!fieldName)
      return ExtractEntityError.left("NoColumn", {
        columnName: "name",
        entityName
      })
    let pseudoType = all.at(1)?.text
    if (!pseudoType)
      return ExtractEntityError.left("NoColumn", {
        columnName: "type",
        entityName
      })
    if (pseudoType == "Function") {
      const returnType =
        entityName == INITIALING_MINI_APPS ? "void" : entityName
      pseudoType = fieldName.endsWith("()") ? `() => ${returnType}` : "unknown"
      const parenIndex = fieldName.indexOf("(")
      if (parenIndex !== -1) fieldName = fieldName.substring(0, parenIndex)
    }
    const descriptionNode = all.at(all.length - 1) // description is the last column
    if (!descriptionNode)
      return ExtractEntityError.left("NoColumn", {
        columnName: "description",
        entityName
      })

    const description = extractFieldDescription(descriptionNode)

    let required = false

    if (all.length == 3) {
      const isOptional = description[0]?.includes(optional_field_label) ?? false
      if (isOptional) description.shift()
      required = isOptional == false
    } else {
      const isRequired = all.at(2)?.text
      if (!isRequired)
        return ExtractEntityError.left("NoColumn", {
          columnName: "required",
          entityName
        })
      if (isRequired != optional_field_label && isRequired != "Yes") {
        return ExtractEntityError.left("UnexpectedValue", {
          columnName: "required",
          entityName
        })
      }
      required = isRequired != optional_field_label
    }

    const normalType = NormalType.makeFrom({
      entityName,
      fieldName,
      pseudoType,
      description
    })

    if (Either.isLeft(normalType)) {
      collectWarning({
        kind: "field-dropped",
        entityName,
        fieldName,
        reason: `${normalType.left.error}: ${normalType.left.details.typeName ?? pseudoType}`
      })
      continue
    }

    fields.fields.push({
      name: fieldName,
      description,
      required,
      type: normalType.right
    })
  }

  fields.fields.sort((a, b) => (b.required ? 1 : 0) - (a.required ? 1 : 0))

  return Either.right(fields)
}

// ── Entity factory ──

const extractFromNode = (
  node: HtmlElement
): Either.Either<ExtractedEntityShape, ExtractEntityError> => {
  const entityName = node.lastChild?.text?.trim()

  if (!entityName) return ExtractEntityError.left("NoTitle")

  const entityDescription = extractEntityDescription(node, entityName)

  if (entityDescription._tag == "Left")
    return Either.left(entityDescription.left)

  const detailsNode = findTypeNode(node)

  if (Either.isLeft(detailsNode)) {
    if (detailsNode.left.error == "TypeDefinition:StopTagEncountered") {
      const overridden = typeAliasOverrides[entityName]
      return Either.right({
        entityName,
        entityDescription: entityDescription.right,
        type: NormalType.fromSpec(
          overridden ?? { kind: "raw", ts: "never" }
        )
      })
    }
    return Either.left({
      ...detailsNode.left,
      details: {
        entityName: entityName
      }
    })
  }

  const type = extractType(detailsNode.right, entityName)

  if (type._tag == "Left") return Either.left(type.left)

  return Either.right({
    entityName,
    entityDescription: entityDescription.right,
    type: type.right
  })
}

// ── ExtractedEntity ──

export interface ExtractedEntityShape {
  entityName: string
  entityDescription: {
    lines: string[]
    returns: SpecType | undefined
  }
  type: NormalType | EntityFields
  groupName?: string
}

export class ExtractedEntity extends Data.TaggedClass(
  "ExtractedEntity"
)<ExtractedEntityShape> {
  static makeFrom(node: HtmlElement) {
    return extractFromNode(node).pipe(
      Either.andThen((_) => new ExtractedEntity(_))
    )
  }
}

// ── ExtractedMethod ──

export interface ExtractedMethodShape {
  methodName: string
  returnType: NormalType
  methodDescription: string[]
  parameters: EntityFields | undefined
  groupName?: string
}

const makeMethodFrom = (
  entity: ExtractedEntityShape
): Either.Either<ExtractedMethodShape, ExtractEntityError> => {
  let parameters: ExtractedMethodShape["parameters"] | undefined

  if (entity.type._tag == "EntityFields") parameters = entity.type

  const returnType = entity.entityDescription.returns

  if (!returnType)
    return ExtractEntityError.left("Method:ReturnTypeNotFound", entity)

  return Either.right({
    methodName: entity.entityName,
    methodDescription: entity.entityDescription.lines,
    returnType: NormalType.fromSpec(returnType),
    parameters,
    ...(entity.groupName ? { groupName: entity.groupName } : undefined)
  })
}

export class ExtractedMethod extends Data.TaggedClass(
  "ExtractedMethod"
)<ExtractedMethodShape> {
  static makeFrom(input: ExtractedEntityShape) {
    return pipe(
      makeMethodFrom(input),
      Either.andThen((_) => new ExtractedMethod(_))
    )
  }
}

// ── ExtractedType ──

export interface ExtractedTypeShape {
  typeName: string
  description: string[]
  type: ExtractedEntityShape["type"]
}

export class ExtractedType extends Data.TaggedClass(
  "ExtractedType"
)<ExtractedTypeShape> {
  static makeFrom(entity: ExtractedEntityShape) {
    return new ExtractedType({
      typeName: entity.entityName,
      description: entity.entityDescription.lines,
      type: entity.type
    })
  }
}
