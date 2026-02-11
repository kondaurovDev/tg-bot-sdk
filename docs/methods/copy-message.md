# copyMessage

Use this method to copy messages of any kind Service messages, paid media messages, giveaway messages, giveaway winners messages, and invoice messages can&#39;t be copied A quiz poll can be copied only if the value of the field correct_option_id is known to the bot The method is analogous to the method forwardMessage, but the copied message doesn&#39;t have a link to the original message

[Telegram docs](https://core.telegram.org/bots/api#copymessage)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| from_chat_id | `number` \| `string` | Yes | Unique identifier for the chat where the original message was sent (or channel username in the format @channelusername) |
| message_id | `number` | Yes | Message identifier in the chat specified in from_chat_id |
| message_thread_id | `number` | No | Unique identifier for the target message thread (topic) of the forum; for forum supergroups only |
| direct_messages_topic_id | `number` | No | Identifier of the direct messages topic to which the message will be sent; required if the message is sent to a direct messages chat |
| video_start_timestamp | `number` | No | New start timestamp for the copied video in the message |
| caption | `string` | No | New caption for media, 0-1024 characters after entities parsing If not specified, the original caption is kept |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the new caption See formatting options for more details. |
| caption_entities | [`MessageEntity`](../types/message-entity.md)[] | No | A JSON-serialized list of special entities that appear in the new caption, which can be specified instead of parse_mode |
| show_caption_above_media | `boolean` | No | Pass True, if the caption must be shown above the message media Ignored if a new caption isn&#39;t specified. |
| disable_notification | `boolean` | No | Sends the message silently Users will receive a notification with no sound. |
| protect_content | `boolean` | No | Protects the contents of the sent message from forwarding and saving |
| allow_paid_broadcast | `boolean` | No | Pass True to allow up to 1000 messages per second, ignoring broadcasting limits for a fee of 0.1 Telegram Stars per message The relevant Stars will be withdrawn from the bot&#39;s balance |
| suggested_post_parameters | [`SuggestedPostParameters`](../types/suggested-post-parameters.md) | No | A JSON-serialized object containing the parameters of the suggested post to send; for direct messages chats only If the message is sent as a reply to another suggested post, then that suggested post is automatically declined. |
| reply_parameters | [`ReplyParameters`](../types/reply-parameters.md) | No | Description of the message to reply to |
| reply_markup | [`InlineKeyboardMarkup`](../types/inline-keyboard-markup.md) \| [`ReplyKeyboardMarkup`](../types/reply-keyboard-markup.md) \| [`ReplyKeyboardRemove`](../types/reply-keyboard-remove.md) \| [`ForceReply`](../types/force-reply.md) | No | Additional interface options A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user |

## Return type

[`MessageId`](../types/message-id.md)
