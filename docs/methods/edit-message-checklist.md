# editMessageChecklist

Use this method to edit a checklist on behalf of a connected business account

[Telegram docs](https://core.telegram.org/bots/api#editmessagechecklist)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection on behalf of which the message will be sent |
| chat_id | `number` | Yes | Unique identifier for the target chat |
| message_id | `number` | Yes | Unique identifier for the target message |
| checklist | [`InputChecklist`](../types/input-checklist.md) | Yes | A JSON-serialized object for the new checklist |
| reply_markup | [`InlineKeyboardMarkup`](../types/inline-keyboard-markup.md) | No | A JSON-serialized object for the new inline keyboard for the message |

## Return type

[`Message`](../types/message.md)
