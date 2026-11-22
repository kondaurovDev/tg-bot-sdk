/**
 * @module known-drift
 * Differences between the real API and the spec that are known and accepted,
 * each with its reason. An issue listed here is reported but does not fail
 * the run; everything else does.
 *
 * Two things end up here:
 *
 * - A field Telegram ships before documenting it. When a run fails on an
 *   `unknown-field`, check the changelog first: a new Bot API version means
 *   regenerating the types (the `bot-api-update` skill), and only a field that
 *   is really undocumented belongs here. Remove the entry once the docs catch up.
 * - A field the docs renamed or replaced and the server still sends for old
 *   clients. The types follow the docs, so it stays out of them on purpose.
 */
import type { IssueKind } from "./validate"

export interface KnownDrift {
  readonly kind: IssueKind
  /** The issue's `where`: `Type.field`, or `methodName()` for a result itself. */
  readonly where: string
  readonly reason: string
}

export const knownDrift: readonly KnownDrift[] = [
  {
    kind: "unknown-field",
    where: "Sticker.thumb",
    reason: "Renamed to thumbnail in Bot API 6.6; the old name is still sent"
  },
  {
    kind: "unknown-field",
    where: "StickerSet.contains_masks",
    reason: "Replaced by sticker_type in Bot API 6.2; still sent"
  },
  {
    kind: "unknown-field",
    where: "Message.forward_from",
    reason: "Replaced by forward_origin in Bot API 7.0; still sent"
  },
  {
    kind: "unknown-field",
    where: "Message.forward_date",
    reason: "Replaced by forward_origin in Bot API 7.0; still sent"
  },
  {
    kind: "unknown-field",
    where: "ChatFullInfo.can_send_gift",
    reason: "Replaced by accepted_gift_types in Bot API 9.0; still sent"
  }
]
