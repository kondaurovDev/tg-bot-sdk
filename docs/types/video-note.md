# VideoNote

This object represents a video message (available in Telegram apps as of v.4.0).

[Telegram docs](https://core.telegram.org/bots/api#videonote)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file_id | `string` | Yes | Identifier for this file, which can be used to download or reuse the file |
| file_unique_id | `string` | Yes | Unique identifier for this file, which is supposed to be the same over time and for different bots Can&#39;t be used to download or reuse the file. |
| length | `number` | Yes | Video width and height (diameter of the video message) as defined by the sender |
| duration | `number` | Yes | Duration of the video in seconds as defined by the sender |
| thumbnail | [`PhotoSize`](photo-size.md) | No | Video thumbnail |
| file_size | `number` | No | File size in bytes |
