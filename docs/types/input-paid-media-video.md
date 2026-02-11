# InputPaidMediaVideo

The paid media to send is a video.

[Telegram docs](https://core.telegram.org/bots/api#inputpaidmediavideo)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"video"` | Yes | Type of the media, must be video |
| media | `string` | Yes | File to send Pass a file_id to send a file that exists on the Telegram servers (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or pass “attach://&lt;file_attach_name&gt;” to upload a new one using multipart/form-data under &lt;file_attach_name&gt; name More information on Sending Files » |
| thumbnail | `string` | No | Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side The thumbnail should be in JPEG format and less than 200 kB in size A thumbnail&#39;s width and height should not exceed 320 Ignored if the file is not uploaded using multipart/form-data Thumbnails can&#39;t be reused and can be only uploaded as a new file, so you can pass “attach://&lt;file_attach_name&gt;” if the thumbnail was uploaded using multipart/form-data under &lt;file_attach_name&gt; More information on Sending Files » |
| cover | `string` | No | Cover for the video in the message Pass a file_id to send a file that exists on the Telegram servers (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or pass “attach://&lt;file_attach_name&gt;” to upload a new one using multipart/form-data under &lt;file_attach_name&gt; name More information on Sending Files » |
| start_timestamp | `number` | No | Start timestamp for the video in the message |
| width | `number` | No | Video width |
| height | `number` | No | Video height |
| duration | `number` | No | Video duration in seconds |
| supports_streaming | `boolean` | No | Pass True if the uploaded video is suitable for streaming |
