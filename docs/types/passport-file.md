# PassportFile

This object represents a file uploaded to Telegram Passport Currently all Telegram Passport files are in JPEG format when decrypted and don&#39;t exceed 10MB.

[Telegram docs](https://core.telegram.org/bots/api#passportfile)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file_id | `string` | Yes | Identifier for this file, which can be used to download or reuse the file |
| file_unique_id | `string` | Yes | Unique identifier for this file, which is supposed to be the same over time and for different bots Can&#39;t be used to download or reuse the file. |
| file_size | `number` | Yes | File size in bytes |
| file_date | `number` | Yes | Unix time when the file was uploaded |
