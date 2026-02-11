# SuggestedPostDeclined

Describes a service message about the rejection of a suggested post.

[Telegram docs](https://core.telegram.org/bots/api#suggestedpostdeclined)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| suggested_post_message | [`Message`](message.md) | No | Message containing the suggested post Note that the Message object in this field will not contain the reply_to_message field even if it itself is a reply. |
| comment | `string` | No | Comment with which the post was declined |
