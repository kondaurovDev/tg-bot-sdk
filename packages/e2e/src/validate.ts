/**
 * @module validate
 * Checks a value Telegram returned against the spec the types are generated
 * from. Nothing here knows a method or a type by name: the spec drives it, so
 * a new Bot API version is covered the moment the spec is regenerated.
 *
 * An issue never quotes the response (no ids, names or texts), only where in
 * the spec and in the response it was found: the report is safe in a public
 * CI log.
 */
import { isInterface, type BotApiSpec, type SpecDecl, type SpecField, type SpecType } from "./spec"

export type IssueKind =
  /** A field the spec requires did not come: the type promises what is not there. */
  | "missing-field"
  /** A value of another type than the spec says. */
  | "wrong-type"
  /** A field the spec does not know: the docs (or the scraper) are behind the API. */
  | "unknown-field"
  /** A string outside the values the spec lists for the field. */
  | "unknown-enum-value"
  /** A union member the spec does not list, by its discriminator. */
  | "unknown-variant"

export interface Issue {
  readonly kind: IssueKind
  /** Place in the spec, stable from response to response: `User.first_name`. */
  readonly where: string
  /** Place in this response: `result.chat.first_name`. */
  readonly path: string
  readonly message: string
}

export const formatIssue = (issue: Issue): string =>
  `[${issue.kind}] ${issue.where}: ${issue.message} (at ${issue.path})`

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const typeName = (value: unknown): string => {
  if (value === null) return "null"
  if (Array.isArray(value)) return "array"
  if (typeof value === "number") return Number.isInteger(value) ? "integer" : "float"
  return typeof value
}

const describeType = (type: SpecType): string => {
  switch (type.kind) {
    case "primitive":
    case "ref":
      return type.name
    case "array":
      return `array of ${describeType(type.element)}`
    case "union":
      return type.members.map(describeType).join(" | ")
    case "enum":
      return type.values.map((v) => `"${v}"`).join(" | ")
    case "object":
      return "object"
    case "raw":
      return type.ts
  }
}

/** Camel-case name of a Bot API method, as the spec and the HTTP path spell it. */
export const methodNameOf = (method: string): string =>
  method.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())

export interface Validator {
  /** Issues of `value` against `type`; `where` names the spec place of the value itself. */
  readonly check: (type: SpecType, value: unknown, where: string, path?: string) => Issue[]
  /** Issues of a method's result; the method in snake_case or camelCase. */
  readonly checkResult: (method: string, result: unknown) => Issue[]
  /** Refs that point at no declaration: a broken spec, not a broken response. */
  readonly danglingRefs: () => string[]
}

export const makeValidator = (spec: BotApiSpec): Validator => {
  const decls = new Map<string, SpecDecl>(spec.types.map((decl) => [decl.name, decl]))
  const methods = new Map(spec.methods.map((method) => [method.name, method]))

  /** Whether `value` is the kind of thing `type` describes, looking no deeper. */
  const fits = (type: SpecType, value: unknown): boolean => {
    switch (type.kind) {
      case "primitive":
        if (type.name === "integer") return Number.isInteger(value)
        if (type.name === "float") return typeof value === "number"
        if (type.name === "bytes") return false
        return typeof value === type.name
      case "enum":
        return typeof value === "string"
      case "array":
        return Array.isArray(value)
      case "object":
        return isRecord(value)
      case "union":
        return type.members.some((member) => fits(member, value))
      case "ref": {
        const decl = decls.get(type.name)
        if (!decl) return false
        return isInterface(decl) ? isRecord(value) : fits(decl.type, value)
      }
      case "raw":
        return true
    }
  }

  const checkFields = (
    fields: readonly SpecField[],
    value: Record<string, unknown>,
    owner: string,
    path: string
  ): Issue[] => {
    const issues: Issue[] = []
    const known = new Set<string>()
    for (const field of fields) {
      known.add(field.name)
      const where = `${owner}.${field.name}`
      if (!(field.name in value)) {
        if (field.required) {
          issues.push({
            kind: "missing-field",
            where,
            path: `${path}.${field.name}`,
            message: `required ${describeType(field.type)} is absent`
          })
        }
        continue
      }
      issues.push(...check(field.type, value[field.name], where, `${path}.${field.name}`))
    }
    for (const key of Object.keys(value)) {
      if (known.has(key)) continue
      issues.push({
        kind: "unknown-field",
        where: `${owner}.${key}`,
        path: `${path}.${key}`,
        message: `the spec has no such field (it holds ${typeName(value[key])})`
      })
    }
    return issues
  }

  /** The member a discriminated union's value belongs to, by its tag. */
  const variantOf = (
    members: readonly SpecType[],
    discriminator: string,
    tag: unknown
  ): SpecType | undefined =>
    members.find((member) => {
      if (member.kind !== "ref") return false
      const decl = decls.get(member.name)
      if (!decl || !isInterface(decl)) return false
      const field = decl.fields.find((f) => f.name === discriminator)
      return field?.type.kind === "enum" && field.type.values.some((v) => v === tag)
    })

  const check = (type: SpecType, value: unknown, where: string, path = "result"): Issue[] => {
    if (!fits(type, value)) {
      return [
        {
          kind: "wrong-type",
          where,
          path,
          message: `expected ${describeType(type)}, got ${typeName(value)}`
        }
      ]
    }

    switch (type.kind) {
      case "primitive":
      case "raw":
        return []
      case "enum":
        return type.values.some((v) => v === value)
          ? []
          : [
              {
                kind: "unknown-enum-value",
                where,
                path,
                message: `"${String(value)}" is not one of ${describeType(type)}`
              }
            ]
      case "array":
        return Array.isArray(value)
          ? value.flatMap((item, i) => check(type.element, item, where, `${path}[${i}]`))
          : []
      case "object":
        return isRecord(value) ? checkFields(type.fields, value, where, path) : []
      case "ref": {
        const decl = decls.get(type.name)
        if (!decl) return []
        if (!isInterface(decl)) return check(decl.type, value, type.name, path)
        return isRecord(value) ? checkFields(decl.fields, value, type.name, path) : []
      }
      case "union": {
        if (type.discriminator !== undefined && isRecord(value)) {
          const tag = value[type.discriminator]
          const variant = variantOf(type.members, type.discriminator, tag)
          if (variant) return check(variant, value, where, path)
          return [
            {
              kind: "unknown-variant",
              where: `${where}.${type.discriminator}`,
              path: `${path}.${type.discriminator}`,
              message: `"${String(tag)}" names none of ${describeType(type)}`
            }
          ]
        }
        // No tag to go by: the member the value fits best is the one to report on
        let best: Issue[] | undefined
        for (const member of type.members) {
          if (!fits(member, value)) continue
          const issues = check(member, value, where, path)
          if (issues.length === 0) return []
          if (!best || issues.length < best.length) best = issues
        }
        return best ?? []
      }
    }
  }

  const checkResult = (method: string, result: unknown): Issue[] => {
    const name = methodNameOf(method)
    const decl = methods.get(name)
    if (!decl) throw new Error(`The spec has no method "${name}"`)
    return check(decl.return, result, `${name}()`)
  }

  const danglingRefs = (): string[] => {
    const dangling = new Set<string>()
    const visit = (type: SpecType, from: string): void => {
      switch (type.kind) {
        case "ref":
          if (!decls.has(type.name)) dangling.add(`${from} -> ${type.name}`)
          return
        case "array":
          return visit(type.element, from)
        case "union":
          return type.members.forEach((member) => visit(member, from))
        case "object":
          return type.fields.forEach((field) => visit(field.type, `${from}.${field.name}`))
        default:
          return
      }
    }
    for (const decl of spec.types) {
      if (isInterface(decl)) {
        decl.fields.forEach((field) => visit(field.type, `${decl.name}.${field.name}`))
      } else visit(decl.type, decl.name)
    }
    for (const method of spec.methods) {
      visit(method.return, `${method.name}()`)
      method.parameters.forEach((p) => visit(p.type, `${method.name}(${p.name})`))
    }
    return [...dangling]
  }

  return { check, checkResult, danglingRefs }
}
