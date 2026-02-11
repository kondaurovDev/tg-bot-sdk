# PassportElementErrorFrontSide

Represents an issue with the front side of a document The error is considered resolved when the file with the front side of the document changes.

[Telegram docs](https://core.telegram.org/bots/api#passportelementerrorfrontside)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| source | `"front_side"` | Yes | Error source, must be front_side |
| type | `"passport" | "driver_license" | "identity_card" | "internal_passport"` | Yes | The section of the user&#39;s Telegram Passport which has the issue, one of “passport”, “driver_license”, “identity_card”, “internal_passport” |
| file_hash | `string` | Yes | Base64-encoded hash of the file with the front side of the document |
| message | `string` | Yes | Error message |
