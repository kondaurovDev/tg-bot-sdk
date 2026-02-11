# PassportElementErrorTranslationFiles

Represents an issue with the translated version of a document The error is considered resolved when a file with the document translation change.

[Telegram docs](https://core.telegram.org/bots/api#passportelementerrortranslationfiles)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| source | `"translation_files"` | Yes | Error source, must be translation_files |
| type | `"passport" | "driver_license" | "identity_card" | "internal_passport" | "utility_bill" | "bank_statement" | "rental_agreement" | "passport_registration" | "temporary_registration"` | Yes | Type of element of the user&#39;s Telegram Passport which has the issue, one of “passport”, “driver_license”, “identity_card”, “internal_passport”, “utility_bill”, “bank_statement”, “rental_agreement”, “passport_registration”, “temporary_registration” |
| file_hashes | `string[]` | Yes | List of base64-encoded file hashes |
| message | `string` | Yes | Error message |
