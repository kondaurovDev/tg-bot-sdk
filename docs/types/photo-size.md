# PhotoSize

This object represents one size of a photo or a file / sticker thumbnail.

[Telegram docs](https://core.telegram.org/bots/api#photosize)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file_id | `string` | Yes | Identifier for this file, which can be used to download or reuse the file |
| file_unique_id | `string` | Yes | Unique identifier for this file, which is supposed to be the same over time and for different bots Can&#39;t be used to download or reuse the file. |
| width | `number` | Yes | Photo width |
| height | `number` | Yes | Photo height |
| file_size | `number` | No | File size in bytes |
