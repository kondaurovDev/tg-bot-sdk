# stopPoll

Use this method to stop a poll which was sent by the bot

[Telegram docs](https://core.telegram.org/bots/api#stoppoll)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| message_id | `number` | Yes | Identifier of the original message with the poll |
| business_connection_id | `string` | No | Unique identifier of the business connection on behalf of which the message to be edited was sent |
| reply_markup | [`InlineKeyboardMarkup`](../types/inline-keyboard-markup.md) | No | A JSON-serialized object for a new message inline keyboard. |

## Return type

[`Poll`](../types/poll.md)
