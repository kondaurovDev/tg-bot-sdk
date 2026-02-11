# PassportElementErrorFile

Represents an issue with a document scan The error is considered resolved when the file with the document scan changes.

[Telegram docs](https://core.telegram.org/bots/api#passportelementerrorfile)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| source | `"file"` | Yes | Error source, must be file |
| type | `"utility_bill" | "bank_statement" | "rental_agreement" | "passport_registration" | "temporary_registration"` | Yes | The section of the user&#39;s Telegram Passport which has the issue, one of “utility_bill”, “bank_statement”, “rental_agreement”, “passport_registration”, “temporary_registration” |
| file_hash | `string` | Yes | Base64-encoded file hash |
| message | `string` | Yes | Error message |
