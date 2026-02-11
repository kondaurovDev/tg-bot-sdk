# PassportElementErrorDataField

Represents an issue in one of the data fields that was provided by the user The error is considered resolved when the field&#39;s value changes.

[Telegram docs](https://core.telegram.org/bots/api#passportelementerrordatafield)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| source | `"data"` | Yes | Error source, must be data |
| type | `"personal_details" | "passport" | "driver_license" | "identity_card" | "internal_passport" | "address"` | Yes | The section of the user&#39;s Telegram Passport which has the error, one of “personal_details”, “passport”, “driver_license”, “identity_card”, “internal_passport”, “address” |
| field_name | `string` | Yes | Name of the data field which has the error |
| data_hash | `string` | Yes | Base64-encoded data hash |
| message | `string` | Yes | Error message |
