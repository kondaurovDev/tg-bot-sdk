# sendPaidMedia

Use this method to send paid media

[Telegram docs](https://core.telegram.org/bots/api#sendpaidmedia)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) If the chat is a channel, all Telegram Star proceeds from this media will be credited to the chat&#39;s balance Otherwise, they will be credited to the bot&#39;s balance. |
| star_count | `number` | Yes | The number of Telegram Stars that must be paid to buy access to the media; 1-10000 |
| media | [`InputPaidMedia`](../types/input-paid-media.md)[] | Yes | A JSON-serialized array describing the media to be sent; up to 10 items |
| business_connection_id | `string` | No | Unique identifier of the business connection on behalf of which the message will be sent |
| message_thread_id | `number` | No | Unique identifier for the target message thread (topic) of the forum; for forum supergroups only |
| direct_messages_topic_id | `number` | No | Identifier of the direct messages topic to which the message will be sent; required if the message is sent to a direct messages chat |
| payload | `string` | No | Bot-defined paid media payload, 0-128 bytes This will not be displayed to the user, use it for your internal processes. |
| caption | `string` | No | Media caption, 0-1024 characters after entities parsing |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the media caption See formatting options for more details. |
| caption_entities | [`MessageEntity`](../types/message-entity.md)[] | No | A JSON-serialized list of special entities that appear in the caption, which can be specified instead of parse_mode |
| show_caption_above_media | `boolean` | No | Pass True, if the caption must be shown above the message media |
| disable_notification | `boolean` | No | Sends the message silently Users will receive a notification with no sound. |
| protect_content | `boolean` | No | Protects the contents of the sent message from forwarding and saving |
| allow_paid_broadcast | `boolean` | No | Pass True to allow up to 1000 messages per second, ignoring broadcasting limits for a fee of 0.1 Telegram Stars per message The relevant Stars will be withdrawn from the bot&#39;s balance |
| suggested_post_parameters | [`SuggestedPostParameters`](../types/suggested-post-parameters.md) | No | A JSON-serialized object containing the parameters of the suggested post to send; for direct messages chats only If the message is sent as a reply to another suggested post, then that suggested post is automatically declined. |
| reply_parameters | [`ReplyParameters`](../types/reply-parameters.md) | No | Description of the message to reply to |
| reply_markup | [`InlineKeyboardMarkup`](../types/inline-keyboard-markup.md) \| [`ReplyKeyboardMarkup`](../types/reply-keyboard-markup.md) \| [`ReplyKeyboardRemove`](../types/reply-keyboard-remove.md) \| [`ForceReply`](../types/force-reply.md) | No | Additional interface options A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user |

## Return type

[`Message`](../types/message.md)
