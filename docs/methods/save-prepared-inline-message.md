# savePreparedInlineMessage

Stores a message that can be sent by a user of a Mini App

[Telegram docs](https://core.telegram.org/bots/api#savepreparedinlinemessage)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | `number` | Yes | Unique identifier of the target user that can use the prepared message |
| result | [`InlineQueryResult`](../types/inline-query-result.md) | Yes | A JSON-serialized object describing the message to be sent |
| allow_user_chats | `boolean` | No | Pass True if the message can be sent to private chats with users |
| allow_bot_chats | `boolean` | No | Pass True if the message can be sent to private chats with bots |
| allow_group_chats | `boolean` | No | Pass True if the message can be sent to group and supergroup chats |
| allow_channel_chats | `boolean` | No | Pass True if the message can be sent to channel chats |

## Return type

[`PreparedInlineMessage`](../types/prepared-inline-message.md)
