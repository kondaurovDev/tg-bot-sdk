# InputProfilePhotoAnimated

An animated profile photo in the MPEG4 format.

[Telegram docs](https://core.telegram.org/bots/api#inputprofilephotoanimated)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"animated"` | Yes | Type of the profile photo, must be animated |
| animation | `string` | Yes | The animated profile photo Profile photos can&#39;t be reused and can only be uploaded as a new file, so you can pass “attach://&lt;file_attach_name&gt;” if the photo was uploaded using multipart/form-data under &lt;file_attach_name&gt; More information on Sending Files » |
| main_frame_timestamp | `number` | No | Timestamp in seconds of the frame that will be used as the static profile photo Defaults to 0.0. |
