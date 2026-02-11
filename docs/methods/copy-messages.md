# copyMessages

Use this method to copy messages of any kind If some of the specified messages can&#39;t be found or copied, they are skipped Service messages, paid media messages, giveaway messages, giveaway winners messages, and invoice messages can&#39;t be copied A quiz poll can be copied only if the value of the field correct_option_id is known to the bot The method is analogous to the method forwardMessages, but the copied messages don&#39;t have a link to the original message Album grouping is kept for copied messages

[Telegram docs](https://core.telegram.org/bots/api#copymessages)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| from_chat_id | `number` \| `string` | Yes | Unique identifier for the chat where the original messages were sent (or channel username in the format @channelusername) |
| message_ids | `number[]` | Yes | A JSON-serialized list of 1-100 identifiers of messages in the chat from_chat_id to copy The identifiers must be specified in a strictly increasing order. |
| message_thread_id | `number` | No | Unique identifier for the target message thread (topic) of the forum; for forum supergroups only |
| direct_messages_topic_id | `number` | No | Identifier of the direct messages topic to which the messages will be sent; required if the messages are sent to a direct messages chat |
| disable_notification | `boolean` | No | Sends the messages silently Users will receive a notification with no sound. |
| protect_content | `boolean` | No | Protects the contents of the sent messages from forwarding and saving |
| remove_caption | `boolean` | No | Pass True to copy the messages without their captions |

## Return type

[`MessageId`](../types/message-id.md)[]
