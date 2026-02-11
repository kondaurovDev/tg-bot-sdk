# InputSticker

This object describes a sticker to be added to a sticker set.

[Telegram docs](https://core.telegram.org/bots/api#inputsticker)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sticker | `string` | Yes | The added sticker Pass a file_id as a String to send a file that already exists on the Telegram servers, pass an HTTP URL as a String for Telegram to get a file from the Internet, or pass “attach://&lt;file_attach_name&gt;” to upload a new file using multipart/form-data under &lt;file_attach_name&gt; name Animated and video stickers can&#39;t be uploaded via HTTP URL More information on Sending Files » |
| format | `"static" | "animated" | "video"` | Yes | Format of the added sticker, must be one of “static” for a .WEBP or .PNG image, “animated” for a .TGS animation, “video” for a .WEBM video |
| emoji_list | `string[]` | Yes | List of 1-20 emoji associated with the sticker |
| mask_position | [`MaskPosition`](mask-position.md) | No | Position where the mask should be placed on faces For “mask” stickers only. |
| keywords | `string[]` | No | List of 0-20 search keywords for the sticker with total length of up to 64 characters For “regular” and “custom_emoji” stickers only. |
