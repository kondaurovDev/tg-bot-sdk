# LinkPreviewOptions

Describes the options used for link preview generation.

[Telegram docs](https://core.telegram.org/bots/api#linkpreviewoptions)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| is_disabled | `boolean` | No | True, if the link preview is disabled |
| url | `string` | No | URL to use for the link preview If empty, then the first URL found in the message text will be used |
| prefer_small_media | `boolean` | No | True, if the media in the link preview is supposed to be shrunk; ignored if the URL isn&#39;t explicitly specified or media size change isn&#39;t supported for the preview |
| prefer_large_media | `boolean` | No | True, if the media in the link preview is supposed to be enlarged; ignored if the URL isn&#39;t explicitly specified or media size change isn&#39;t supported for the preview |
| show_above_text | `boolean` | No | True, if the link preview must be shown above the message text; otherwise, the link preview will be shown below the message text |
