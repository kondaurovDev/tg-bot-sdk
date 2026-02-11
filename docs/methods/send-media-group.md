# sendMediaGroup

Use this method to send a group of photos, videos, documents or audios as an album Documents and audio files can be only grouped in an album with messages of the same type On success, an array of Message objects that were sent is returned.

[Telegram docs](https://core.telegram.org/bots/api#sendmediagroup)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| media | `(T.InputMediaAudio | T.InputMediaDocument | T.InputMediaPhoto | T.InputMediaVideo)[]` | Yes | A JSON-serialized array describing messages to be sent, must include 2-10 items |
| business_connection_id | `string` | No | Unique identifier of the business connection on behalf of which the message will be sent |
| message_thread_id | `number` | No | Unique identifier for the target message thread (topic) of the forum; for forum supergroups only |
| direct_messages_topic_id | `number` | No | Identifier of the direct messages topic to which the messages will be sent; required if the messages are sent to a direct messages chat |
| disable_notification | `boolean` | No | Sends messages silently Users will receive a notification with no sound. |
| protect_content | `boolean` | No | Protects the contents of the sent messages from forwarding and saving |
| allow_paid_broadcast | `boolean` | No | Pass True to allow up to 1000 messages per second, ignoring broadcasting limits for a fee of 0.1 Telegram Stars per message The relevant Stars will be withdrawn from the bot&#39;s balance |
| message_effect_id | `string` | No | Unique identifier of the message effect to be added to the message; for private chats only |
| reply_parameters | [`ReplyParameters`](../types/reply-parameters.md) | No | Description of the message to reply to |

## Return type

[`Message`](../types/message.md)[]
