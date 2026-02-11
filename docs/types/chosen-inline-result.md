# ChosenInlineResult

Represents a result of an inline query that was chosen by the user and sent to their chat partner.

[Telegram docs](https://core.telegram.org/bots/api#choseninlineresult)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| result_id | `string` | Yes | The unique identifier for the result that was chosen |
| from | [`User`](user.md) | Yes | The user that chose the result |
| query | `string` | Yes | The query that was used to obtain the result |
| location | [`Location`](location.md) | No | Sender location, only for bots that require user location |
| inline_message_id | `string` | No | Identifier of the sent inline message Available only if there is an inline keyboard attached to the message Will be also received in callback queries and can be used to edit the message. |
