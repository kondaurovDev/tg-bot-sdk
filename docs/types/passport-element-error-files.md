# PassportElementErrorFiles

Represents an issue with a list of scans The error is considered resolved when the list of files containing the scans changes.

[Telegram docs](https://core.telegram.org/bots/api#passportelementerrorfiles)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| source | `"files"` | Yes | Error source, must be files |
| type | `"utility_bill" | "bank_statement" | "rental_agreement" | "passport_registration" | "temporary_registration"` | Yes | The section of the user&#39;s Telegram Passport which has the issue, one of “utility_bill”, “bank_statement”, “rental_agreement”, “passport_registration”, “temporary_registration” |
| file_hashes | `string[]` | Yes | List of base64-encoded file hashes |
| message | `string` | Yes | Error message |
