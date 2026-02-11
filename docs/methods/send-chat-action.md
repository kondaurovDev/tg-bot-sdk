# sendChatAction

Use this method when you need to tell the user that something is happening on the bot&#39;s side The status is set for 5 seconds or less (when a message arrives from your bot, Telegram clients clear its typing status) 
Example: The ImageBot needs some time to process a request and upload the image Instead of sending a text message along the lines of “Retrieving image, please wait…”, the bot may use sendChatAction with action = upload_photo The user will see a “sending photo” status for the bot.
 We only recommend using this method when a response from the bot will take a noticeable amount of time to arrive.

[Telegram docs](https://core.telegram.org/bots/api#sendchataction)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername) Channel chats and channel direct messages chats aren&#39;t supported. |
| action | `
        "typing" | "upload_photo" | "record_video" | "upload_video" | "record_voice" | "upload_voice" |
        "upload_document" | "choose_sticker" | "find_location" | "record_video_note" | "upload_video_note"
      ` | Yes | Type of action to broadcast Choose one, depending on what the user is about to receive: typing for text messages, upload_photo for photos, record_video or upload_video for videos, record_voice or upload_voice for voice notes, upload_document for general files, choose_sticker for stickers, find_location for location data, record_video_note or upload_video_note for video notes. |
| business_connection_id | `string` | No | Unique identifier of the business connection on behalf of which the action will be sent |
| message_thread_id | `number` | No | Unique identifier for the target message thread; for supergroups only |

## Return type

`boolean`
