# PassportElementErrorReverseSide

Represents an issue with the reverse side of a document The error is considered resolved when the file with reverse side of the document changes.

[Telegram docs](https://core.telegram.org/bots/api#passportelementerrorreverseside)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| source | `"reverse_side"` | Yes | Error source, must be reverse_side |
| type | `"driver_license" | "identity_card"` | Yes | The section of the user&#39;s Telegram Passport which has the issue, one of “driver_license”, “identity_card” |
| file_hash | `string` | Yes | Base64-encoded hash of the file with the reverse side of the document |
| message | `string` | Yes | Error message |
