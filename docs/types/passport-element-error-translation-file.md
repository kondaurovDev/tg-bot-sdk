# PassportElementErrorTranslationFile

Represents an issue with one of the files that constitute the translation of a document The error is considered resolved when the file changes.

[Telegram docs](https://core.telegram.org/bots/api#passportelementerrortranslationfile)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| source | `"translation_file"` | Yes | Error source, must be translation_file |
| type | `"passport" | "driver_license" | "identity_card" | "internal_passport" | "utility_bill" | "bank_statement" | "rental_agreement" | "passport_registration" | "temporary_registration"` | Yes | Type of element of the user&#39;s Telegram Passport which has the issue, one of “passport”, “driver_license”, “identity_card”, “internal_passport”, “utility_bill”, “bank_statement”, “rental_agreement”, “passport_registration”, “temporary_registration” |
| file_hash | `string` | Yes | Base64-encoded file hash |
| message | `string` | Yes | Error message |
