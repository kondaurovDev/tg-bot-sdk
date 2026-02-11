# PassportData

Describes Telegram Passport data shared with the bot by the user.

[Telegram docs](https://core.telegram.org/bots/api#passportdata)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| data | [`EncryptedPassportElement`](encrypted-passport-element.md)[] | Yes | Array with information about documents and other Telegram Passport elements that was shared with the bot |
| credentials | [`EncryptedCredentials`](encrypted-credentials.md) | Yes | Encrypted credentials required to decrypt the data |
