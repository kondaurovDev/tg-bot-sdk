# sendChecklist

Use this method to send a checklist on behalf of a connected business account

[Telegram docs](https://core.telegram.org/bots/api#sendchecklist)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection on behalf of which the message will be sent |
| chat_id | `number` | Yes | Unique identifier for the target chat |
| checklist | [`InputChecklist`](../types/input-checklist.md) | Yes | A JSON-serialized object for the checklist to send |
| disable_notification | `boolean` | No | Sends the message silently Users will receive a notification with no sound. |
| protect_content | `boolean` | No | Protects the contents of the sent message from forwarding and saving |
| message_effect_id | `string` | No | Unique identifier of the message effect to be added to the message |
| reply_parameters | [`ReplyParameters`](../types/reply-parameters.md) | No | A JSON-serialized object for description of the message to reply to |
| reply_markup | [`InlineKeyboardMarkup`](../types/inline-keyboard-markup.md) | No | A JSON-serialized object for an inline keyboard |

## Return type

[`Message`](../types/message.md)
