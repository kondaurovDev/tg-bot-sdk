# sendGame

Use this method to send a game

[Telegram docs](https://core.telegram.org/bots/api#sendgame)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` | Yes | Unique identifier for the target chat Games can&#39;t be sent to channel direct messages chats and channel chats. |
| game_short_name | `string` | Yes | Short name of the game, serves as the unique identifier for the game Set up your games via @BotFather. |
| business_connection_id | `string` | No | Unique identifier of the business connection on behalf of which the message will be sent |
| message_thread_id | `number` | No | Unique identifier for the target message thread (topic) of the forum; for forum supergroups only |
| disable_notification | `boolean` | No | Sends the message silently Users will receive a notification with no sound. |
| protect_content | `boolean` | No | Protects the contents of the sent message from forwarding and saving |
| allow_paid_broadcast | `boolean` | No | Pass True to allow up to 1000 messages per second, ignoring broadcasting limits for a fee of 0.1 Telegram Stars per message The relevant Stars will be withdrawn from the bot&#39;s balance |
| message_effect_id | `string` | No | Unique identifier of the message effect to be added to the message; for private chats only |
| reply_parameters | [`ReplyParameters`](../types/reply-parameters.md) | No | Description of the message to reply to |
| reply_markup | [`InlineKeyboardMarkup`](../types/inline-keyboard-markup.md) | No | A JSON-serialized object for an inline keyboard If empty, one &#39;Play game_title&#39; button will be shown If not empty, the first button must launch the game. |

## Return type

[`Message`](../types/message.md)
