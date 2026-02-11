# InputStoryContentVideo

Describes a video to post as a story.

[Telegram docs](https://core.telegram.org/bots/api#inputstorycontentvideo)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"video"` | Yes | Type of the content, must be video |
| video | `string` | Yes | The video to post as a story The video must be of the size 720x1280, streamable, encoded with H.265 codec, with key frames added each second in the MPEG4 format, and must not exceed 30 MB The video can&#39;t be reused and can only be uploaded as a new file, so you can pass “attach://&lt;file_attach_name&gt;” if the video was uploaded using multipart/form-data under &lt;file_attach_name&gt; More information on Sending Files » |
| duration | `number` | No | Precise duration of the video in seconds; 0-60 |
| cover_frame_timestamp | `number` | No | Timestamp in seconds of the frame that will be used as the static cover for the story Defaults to 0.0. |
| is_animation | `boolean` | No | Pass True if the video has no sound |
