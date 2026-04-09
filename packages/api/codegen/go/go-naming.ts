/**
 * @module go-naming
 *
 * Naming convention converters for Go code generation.
 * Handles snake_case → PascalCase with Go acronym rules (ID, URL, HTTP, etc.).
 */

const goAcronyms: Record<string, string> = {
  id: "ID",
  url: "URL",
  http: "HTTP",
  https: "HTTPS",
  json: "JSON",
  html: "HTML",
  api: "API",
  ip: "IP",
  uri: "URI",
  tcp: "TCP",
  udp: "UDP",
  tls: "TLS",
  ssl: "SSL",
  css: "CSS",
  sql: "SQL",
  png: "PNG",
  jpg: "JPG",
  gif: "GIF",
  svg: "SVG",
  pdf: "PDF",
  utf: "UTF",
  xml: "XML",
  ios: "IOS",
}

const capitalize = (s: string) =>
  s.length === 0 ? s : s[0].toUpperCase() + s.slice(1)

export const snakeToPascal = (snake: string): string =>
  snake
    .split("_")
    .map((part) => goAcronyms[part.toLowerCase()] ?? capitalize(part))
    .join("")

export const camelToPascal = (camel: string): string =>
  camel.length === 0 ? camel : camel[0].toUpperCase() + camel.slice(1)

export const snakeToCamel = (snake: string): string => {
  const parts = snake.split("_")
  return [
    parts[0],
    ...parts.slice(1).map((p) => goAcronyms[p.toLowerCase()] ?? capitalize(p))
  ].join("")
}
