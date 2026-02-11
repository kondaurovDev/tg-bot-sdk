# EncryptedCredentials

Describes data required for decrypting and authenticating EncryptedPassportElement See the Telegram Passport Documentation for a complete description of the data decryption and authentication processes.

[Telegram docs](https://core.telegram.org/bots/api#encryptedcredentials)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| data | `string` | Yes | Base64-encoded encrypted JSON-serialized data with unique user&#39;s payload, data hashes and secrets required for EncryptedPassportElement decryption and authentication |
| hash | `string` | Yes | Base64-encoded data hash for data authentication |
| secret | `string` | Yes | Base64-encoded secret, encrypted with the bot&#39;s public RSA key, required for data decryption |
