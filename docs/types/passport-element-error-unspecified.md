# PassportElementErrorUnspecified

Represents an issue in an unspecified place The error is considered resolved when new data is added.

[Telegram docs](https://core.telegram.org/bots/api#passportelementerrorunspecified)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| source | `"unspecified"` | Yes | Error source, must be unspecified |
| type | `string` | Yes | Type of element of the user&#39;s Telegram Passport which has the issue |
| element_hash | `string` | Yes | Base64-encoded element hash |
| message | `string` | Yes | Error message |
