# sendVideoNote

As of v.4.0, Telegram clients support rounded square MPEG4 videos of up to 1 minute long Use this method to send video messages

[Telegram docs](https://core.telegram.org/bots/api#sendvideonote)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| video_note | [`InputFile`](../types/input-file.md) \| `string` | Yes | Video note to send Pass a file_id as String to send a video note that exists on the Telegram servers (recommended) or upload a new video using multipart/form-data More information on Sending Files » Sending video notes by a URL is currently unsupported |
| business_connection_id | `string` | No | Unique identifier of the business connection on behalf of which the message will be sent |
| message_thread_id | `number` | No | Unique identifier for the target message thread (topic) of the forum; for forum supergroups only |
| direct_messages_topic_id | `number` | No | Identifier of the direct messages topic to which the message will be sent; required if the message is sent to a direct messages chat |
| duration | `number` | No | Duration of sent video in seconds |
| length | `number` | No | Video width and height, i.e diameter of the video message |
| thumbnail | [`InputFile`](../types/input-file.md) \| `string` | No | Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side The thumbnail should be in JPEG format and less than 200 kB in size A thumbnail&#39;s width and height should not exceed 320 Ignored if the file is not uploaded using multipart/form-data Thumbnails can&#39;t be reused and can be only uploaded as a new file, so you can pass “attach://&lt;file_attach_name&gt;” if the thumbnail was uploaded using multipart/form-data under &lt;file_attach_name&gt; More information on Sending Files » |
| disable_notification | `boolean` | No | Sends the message silently Users will receive a notification with no sound. |
| protect_content | `boolean` | No | Protects the contents of the sent message from forwarding and saving |
| allow_paid_broadcast | `boolean` | No | Pass True to allow up to 1000 messages per second, ignoring broadcasting limits for a fee of 0.1 Telegram Stars per message The relevant Stars will be withdrawn from the bot&#39;s balance |
| message_effect_id | `string` | No | Unique identifier of the message effect to be added to the message; for private chats only |
| suggested_post_parameters | [`SuggestedPostParameters`](../types/suggested-post-parameters.md) | No | A JSON-serialized object containing the parameters of the suggested post to send; for direct messages chats only If the message is sent as a reply to another suggested post, then that suggested post is automatically declined. |
| reply_parameters | [`ReplyParameters`](../types/reply-parameters.md) | No | Description of the message to reply to |
| reply_markup | [`InlineKeyboardMarkup`](../types/inline-keyboard-markup.md) \| [`ReplyKeyboardMarkup`](../types/reply-keyboard-markup.md) \| [`ReplyKeyboardRemove`](../types/reply-keyboard-remove.md) \| [`ForceReply`](../types/force-reply.md) | No | Additional interface options A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user |

## Return type

[`Message`](../types/message.md)
