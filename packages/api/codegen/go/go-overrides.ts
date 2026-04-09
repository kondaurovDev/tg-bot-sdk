/**
 * @module go-overrides
 *
 * Go-specific type overrides for cases where the standard mapping
 * from NormalType to Go types is insufficient.
 */

export const goTypeAliasOverrides: Record<string, string> = {
  InputFile: "InputFile",
}

export const goEmptyStructTypes = new Set([
  "CallbackGame",
  "ForumTopicClosed",
  "ForumTopicReopened",
  "GeneralForumTopicHidden",
  "GeneralForumTopicUnhidden",
  "VideoChatStarted",
])

// Fields where chat_id accepts both int64 and string
export const intOrStringFields = new Set([
  "chat_id",
  "sender_chat_id",
])
