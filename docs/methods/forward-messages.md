# forwardMessages

Use this method to forward multiple messages of any kind If some of the specified messages can&#39;t be found or forwarded, they are skipped Service messages and messages with protected content can&#39;t be forwarded Album grouping is kept for forwarded messages

[Telegram docs](https://core.telegram.org/bots/api#forwardmessages)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| from_chat_id | `number` \| `string` | Yes | Unique identifier for the chat where the original messages were sent (or channel username in the format @channelusername) |
| message_ids | `number[]` | Yes | A JSON-serialized list of 1-100 identifiers of messages in the chat from_chat_id to forward The identifiers must be specified in a strictly increasing order. |
| message_thread_id | `number` | No | Unique identifier for the target message thread (topic) of the forum; for forum supergroups only |
| direct_messages_topic_id | `number` | No | Identifier of the direct messages topic to which the messages will be forwarded; required if the messages are forwarded to a direct messages chat |
| disable_notification | `boolean` | No | Sends the messages silently Users will receive a notification with no sound. |
| protect_content | `boolean` | No | Protects the contents of the forwarded messages from forwarding and saving |

## Return type

[`MessageId`](../types/message-id.md)[]
