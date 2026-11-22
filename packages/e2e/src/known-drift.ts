/**
 * @module known-drift
 * Differences between the real API and the spec that are known and accepted,
 * each with its reason. An issue listed here is reported but does not fail
 * the run; everything else does.
 *
 * Telegram sometimes ships a field before documenting it. When a run fails on
 * an `unknown-field`, check the changelog first: a new Bot API version means
 * regenerating the types (the `bot-api-update` skill), and only a field that
 * is really undocumented belongs here. Remove an entry once the docs catch up.
 */
import type { IssueKind } from "./validate"

export interface KnownDrift {
  readonly kind: IssueKind
  /** The issue's `where`: `Type.field`, or `methodName()` for a result itself. */
  readonly where: string
  readonly reason: string
}

export const knownDrift: readonly KnownDrift[] = []
