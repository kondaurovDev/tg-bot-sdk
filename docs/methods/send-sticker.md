# sendSticker

Use this method to send static .WEBP, animated .TGS, or video .WEBM stickers

[Telegram docs](https://core.telegram.org/bots/api#sendsticker)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| sticker | [`InputFile`](../types/input-file.md) \| `string` | Yes | Sticker to send Pass a file_id as String to send a file that exists on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get a .WEBP sticker from the Internet, or upload a new .WEBP, .TGS, or .WEBM sticker using multipart/form-data More information on Sending Files » Video and animated stickers can&#39;t be sent via an HTTP URL. |
| business_connection_id | `string` | No | Unique identifier of the business connection on behalf of which the message will be sent |
| message_thread_id | `number` | No | Unique identifier for the target message thread (topic) of the forum; for forum supergroups only |
| direct_messages_topic_id | `number` | No | Identifier of the direct messages topic to which the message will be sent; required if the message is sent to a direct messages chat |
| emoji | `string` | No | Emoji associated with the sticker; only for just uploaded stickers |
| disable_notification | `boolean` | No | Sends the message silently Users will receive a notification with no sound. |
| protect_content | `boolean` | No | Protects the contents of the sent message from forwarding and saving |
| allow_paid_broadcast | `boolean` | No | Pass True to allow up to 1000 messages per second, ignoring broadcasting limits for a fee of 0.1 Telegram Stars per message The relevant Stars will be withdrawn from the bot&#39;s balance |
| message_effect_id | `string` | No | Unique identifier of the message effect to be added to the message; for private chats only |
| suggested_post_parameters | [`SuggestedPostParameters`](../types/suggested-post-parameters.md) | No | A JSON-serialized object containing the parameters of the suggested post to send; for direct messages chats only If the message is sent as a reply to another suggested post, then that suggested post is automatically declined. |
| reply_parameters | [`ReplyParameters`](../types/reply-parameters.md) | No | Description of the message to reply to |
| reply_markup | [`InlineKeyboardMarkup`](../types/inline-keyboard-markup.md) \| [`ReplyKeyboardMarkup`](../types/reply-keyboard-markup.md) \| [`ReplyKeyboardRemove`](../types/reply-keyboard-remove.md) \| [`ForceReply`](../types/force-reply.md) | No | Additional interface options A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user |

## Return type

[`Message`](../types/message.md)
