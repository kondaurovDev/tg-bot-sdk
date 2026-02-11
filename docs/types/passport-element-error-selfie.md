# PassportElementErrorSelfie

Represents an issue with the selfie with a document The error is considered resolved when the file with the selfie changes.

[Telegram docs](https://core.telegram.org/bots/api#passportelementerrorselfie)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| source | `"selfie"` | Yes | Error source, must be selfie |
| type | `"passport" | "driver_license" | "identity_card" | "internal_passport"` | Yes | The section of the user&#39;s Telegram Passport which has the issue, one of “passport”, “driver_license”, “identity_card”, “internal_passport” |
| file_hash | `string` | Yes | Base64-encoded hash of the file with the selfie |
| message | `string` | Yes | Error message |
