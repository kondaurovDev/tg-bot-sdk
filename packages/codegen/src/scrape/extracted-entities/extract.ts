import { Either, String } from "effect"

import type { ExtractEntityError } from "~/scrape/extracted-entity/errors"
import type { DocPageError } from "~/scrape/doc-page/errors"
import { isComplexType } from "~/scrape/types"
import type { ExtractedEntitiesShape } from "./_model"
import { ExtractedEntitiesError } from "./errors"
import type { HtmlPageDocumentation } from "~/types"
import { ExtractedType } from "../extracted-type/_model"

const method_type_name_regex = /^\w+$/

type ExtractError = ExtractEntityError | ExtractedEntitiesError | DocPageError

export const extractEntities = (
  page: HtmlPageDocumentation
): Either.Either<ExtractedEntitiesShape, ExtractError> => {
  const result: ExtractedEntitiesShape = {
    methods: [],
    types: []
  }

  const nodes = page.node.querySelectorAll("h3, h4")

  if (nodes.length == 0)
    return Either.left(ExtractedEntitiesError.make("NodesNotFound"))

  let currentGroup: string | undefined

  for (const node of nodes) {
    const title = node.childNodes.at(1)?.text

    if (node.tagName == "H3") {
      currentGroup = node.childNodes.at(1)?.text
      continue
    }

    if (!currentGroup)
      return Either.left(ExtractedEntitiesError.make("GroupNameNotDefined"))

    if (!title || !method_type_name_regex.test(title)) continue

    if (isComplexType(title)) {
      const type = page.getType(title)
      if (type._tag == "Left") return Either.left(type.left)
      result.types.push(type.right)
      continue
    }

    const method = page.getMethod(title)

    if (method._tag == "Left") return Either.left(method.left)

    result.methods.push({
      ...method.right,
      groupName: makeGroupName(currentGroup)
    })
  }

  result.methods.sort((a, b) => a.methodName.localeCompare(b.methodName))
  result.types.sort((a, b) => a.typeName.localeCompare(b.typeName))

  return Either.right(result)
}

export const extractWebAppEntities = (
  page: HtmlPageDocumentation
): Either.Either<ExtractedType[], ExtractError> => {
  const result: ExtractedType[] = []

  const nodes = page.node.querySelectorAll("h4")

  if (nodes.length == 0)
    return Either.left(ExtractedEntitiesError.make("NodesNotFound"))

  for (const node of nodes) {
    // Try different child node positions to find the title
    // childNodes.at(2) is needed for webapp HTML structure
    const title =
      node.childNodes.at(2)?.text?.trim() ||
      node.childNodes.at(1)?.text?.trim()

    if (!title || !method_type_name_regex.test(title)) continue

    if (isComplexType(title)) {
      const type = page.getType(title)
      if (type._tag == "Left") return Either.left(type.left)
      result.push(type.right)
      continue
    }
  }

  result.sort((a, b) => a.typeName.localeCompare(b.typeName))

  return Either.right(result)
}

const makeGroupName = (input: string) =>
  String.snakeToKebab(input.toLowerCase().replaceAll(" ", "_"))
