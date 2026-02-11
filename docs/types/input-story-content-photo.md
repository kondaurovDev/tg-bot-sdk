# InputStoryContentPhoto

Describes a photo to post as a story.

[Telegram docs](https://core.telegram.org/bots/api#inputstorycontentphoto)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"photo"` | Yes | Type of the content, must be photo |
| photo | `string` | Yes | The photo to post as a story The photo must be of the size 1080x1920 and must not exceed 10 MB The photo can&#39;t be reused and can only be uploaded as a new file, so you can pass “attach://&lt;file_attach_name&gt;” if the photo was uploaded using multipart/form-data under &lt;file_attach_name&gt; More information on Sending Files » |
