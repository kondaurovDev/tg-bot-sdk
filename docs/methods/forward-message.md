# forwardMessage

Use this method to forward messages of any kind Service messages and messages with protected content can&#39;t be forwarded

[Telegram docs](https://core.telegram.org/bots/api#forwardmessage)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| from_chat_id | `number` \| `string` | Yes | Unique identifier for the chat where the original message was sent (or channel username in the format @channelusername) |
| message_id | `number` | Yes | Message identifier in the chat specified in from_chat_id |
| message_thread_id | `number` | No | Unique identifier for the target message thread (topic) of the forum; for forum supergroups only |
| direct_messages_topic_id | `number` | No | Identifier of the direct messages topic to which the message will be forwarded; required if the message is forwarded to a direct messages chat |
| video_start_timestamp | `number` | No | New start timestamp for the forwarded video in the message |
| disable_notification | `boolean` | No | Sends the message silently Users will receive a notification with no sound. |
| protect_content | `boolean` | No | Protects the contents of the forwarded message from forwarding and saving |
| suggested_post_parameters | [`SuggestedPostParameters`](../types/suggested-post-parameters.md) | No | A JSON-serialized object containing the parameters of the suggested post to send; for direct messages chats only |

## Return type

[`Message`](../types/message.md)
