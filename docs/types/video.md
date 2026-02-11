# Video

This object represents a video file.

[Telegram docs](https://core.telegram.org/bots/api#video)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file_id | `string` | Yes | Identifier for this file, which can be used to download or reuse the file |
| file_unique_id | `string` | Yes | Unique identifier for this file, which is supposed to be the same over time and for different bots Can&#39;t be used to download or reuse the file. |
| width | `number` | Yes | Video width as defined by the sender |
| height | `number` | Yes | Video height as defined by the sender |
| duration | `number` | Yes | Duration of the video in seconds as defined by the sender |
| thumbnail | [`PhotoSize`](photo-size.md) | No | Video thumbnail |
| cover | [`PhotoSize`](photo-size.md)[] | No | Available sizes of the cover of the video in the message |
| start_timestamp | `number` | No | Timestamp in seconds from which the video will play in the message |
| file_name | `string` | No | Original filename as defined by the sender |
| mime_type | `string` | No | MIME type of the file as defined by the sender |
| file_size | `number` | No | File size in bytes It can be bigger than 2^31 and some programming languages may have difficulty/silent defects in interpreting it But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this value. |
