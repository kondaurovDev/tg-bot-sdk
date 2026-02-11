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

import type { HtmlElement } from "~/types"
import { returnTypeOverrides, typeAliasOverrides } from "~/scrape/overrides"
import {
  NormalType,
  type NormalTypeShape,
  EntityFields,
  type EntityField,
  mapPseudoTypeToTsType,
  isComplexType,
  startsWithUpperCase,
  type ExtractedEntityField,
  INITIALING_MINI_APPS
} from "~/scrape/type-system"

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

const findTypeNode = (
  node: HtmlElement
): Either.Either<HtmlElement, ExtractEntityError> => {
  let resultNode = node.nextElementSibling
  const run = true
  let step = 1

  while (run) {
    if (resultNode?.tagName == "H4")
      return ExtractEntityError.left("TypeDefinition:StopTagEncountered")
    if (step > 10) return ExtractEntityError.left("TypeDefinition:NotFound")
    if (!resultNode) return ExtractEntityError.left("TypeDefinition:NoSiblings")
    if (type_node_set.has(resultNode?.tagName)) {
      return Either.right(resultNode)
    }
    resultNode = resultNode?.nextElementSibling
    step++
  }

  return ExtractEntityError.left("TypeDefinition:NotFound")
}

// ── Description extraction ──

const description_split_regex = /(\.\s{1,})|(\.<br>)/g
const contains_letters_regex = /\w{1,}/
const type_tags_regex = /\w+(?=<\/(a|em)>)/g
const html_tags_regex = /<\/?[^>]+>/g

const isReturnSentence = (_: string) =>
  _.startsWith("On success") ||
  _.endsWith("is returned") ||
  _.startsWith("Returns ")

export const removeHtmlTags = (input: string) =>
  input.replaceAll(html_tags_regex, "")

/** Walk siblings until a stop-tag, collecting HTML sentences. */
const collectSiblingsSentences = (node: HtmlElement): string[] => {
  const sentences: string[] = []
  let currentNode: HtmlElement | null = node.nextElementSibling

  while (currentNode) {
    if (!currentNode || new_entity_tag_set.has(currentNode.tagName)) break

    for (const part of currentNode.innerHTML.split(description_split_regex)) {
      if (part && contains_letters_regex.test(part)) sentences.push(part)
    }

    currentNode = currentNode.nextElementSibling
  }

  return sentences
}

/** Extract return type names from a single HTML sentence. */
const extractReturnTypeNames = (htmlLine: string, plainLine: string) =>
  pipe(
    Array.fromIterable(htmlLine.matchAll(type_tags_regex)),
    Array.filterMap((_) => {
      const originName = _[0]
      if (!isComplexType(originName)) return Option.none()
      const name = mapPseudoTypeToTsType(originName)
      const isArray = plainLine
        .toLowerCase()
        .includes(`an array of ${name.toLowerCase()}`)
      return Option.some(`${name}${isArray ? "[]" : ""}`)
    })
  )

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
  const returnTypes: string[] = []

  for (const htmlLine of sentences) {
    const plainLine = removeHtmlTags(htmlLine)

    if (!returnTypeOverridden && isReturnSentence(plainLine)) {
      const typeNames = extractReturnTypeNames(htmlLine, plainLine)
      if (Array.isNonEmptyArray(typeNames)) {
        returnTypes.push(...typeNames)
        continue
      }
    }

    lines.push(plainLine)
  }

  if (Array.isNonEmptyArray(lines) && lines[0].length != 0) {
    if (returnTypeOverridden) {
      return Either.right({
        lines,
        returns: { typeNames: returnTypeOverridden }
      })
    } else if (Array.isNonEmptyArray(returnTypes)) {
      return Either.right({
        lines,
        returns: { typeNames: Array.dedupe(returnTypes) }
      })
    } else {
      return Either.right({ lines, returns: undefined })
    }
  } else if (returnTypes.length == 0 && !startsWithUpperCase(entityName)) {
    console.warn("No return type found for", {
      entityName
    })
  }

  return ExtractEntityError.left("Description:Empty", { entityName })
}

export const extractFieldDescription = (input: HtmlElement) => {
  const splitted = input.innerHTML.split(description_split_regex)

  const result = [] as string[]

  for (const line of splitted) {
    if (!line || !contains_letters_regex.test(line)) continue

    result.push(removeHtmlTags(replaceImgWithAlt(line)))
  }

  return result
}

function replaceImgWithAlt(text: string): string {
  const imgTagRegex = /<img[^>]*alt="([^"]*)"[^>]*>/g
  return text.replace(imgTagRegex, "$1").replaceAll("&quot;", '"')
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
    return Either.right(new NormalType({ typeNames: oneOf }))
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
      fieldName = fieldName.substring(0, fieldName.indexOf("("))
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
      const isOptional = description[0].includes(optional_field_label)
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
      console.warn(normalType.left)
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
        type: new NormalType({
          typeNames: [overridden?.tsType ?? "never"]
        })
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
    returns: NormalTypeShape | undefined
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
    returnType: new NormalType({ typeNames: returnType.typeNames }),
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
