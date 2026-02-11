# InputPaidMediaPhoto

The paid media to send is a photo.

[Telegram docs](https://core.telegram.org/bots/api#inputpaidmediaphoto)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"photo"` | Yes | Type of the media, must be photo |
| media | `string` | Yes | File to send Pass a file_id to send a file that exists on the Telegram servers (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or pass “attach://&lt;file_attach_name&gt;” to upload a new one using multipart/form-data under &lt;file_attach_name&gt; name More information on Sending Files » |
