# InputProfilePhotoStatic

A static profile photo in the .JPG format.

[Telegram docs](https://core.telegram.org/bots/api#inputprofilephotostatic)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"static"` | Yes | Type of the profile photo, must be static |
| photo | `string` | Yes | The static profile photo Profile photos can&#39;t be reused and can only be uploaded as a new file, so you can pass “attach://&lt;file_attach_name&gt;” if the photo was uploaded using multipart/form-data under &lt;file_attach_name&gt; More information on Sending Files » |
