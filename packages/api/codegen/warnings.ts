/**
 * @module warnings
 *
 * Module-level collector for non-fatal scraper events (e.g. fields dropped
 * because their type could not be inferred). Call {@link collectWarning}
 * from deep inside the scraper, then {@link consumeWarnings} from the
 * generator entry point to surface a single summary at the end of the run.
 */

export interface GenerationWarning {
  kind: "field-dropped" | "no-return-type"
  entityName: string
  fieldName?: string
  reason: string
}

const warnings: GenerationWarning[] = []

export const collectWarning = (w: GenerationWarning) => {
  warnings.push(w)
}

export const consumeWarnings = (): GenerationWarning[] => warnings.splice(0)

export const formatWarnings = (items: GenerationWarning[]): string => {
  if (items.length === 0) return ""
  const lines = [`⚠ ${items.length} scraper warning(s):`]
  for (const w of items) {
    const where = w.fieldName ? `${w.entityName}.${w.fieldName}` : w.entityName
    lines.push(`  • [${w.kind}] ${where} — ${w.reason}`)
  }
  return lines.join("\n")
}
