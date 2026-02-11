# ChatBoostSourceGiftCode

The boost was obtained by the creation of Telegram Premium gift codes to boost a chat Each such code boosts the chat 4 times for the duration of the corresponding Telegram Premium subscription.

[Telegram docs](https://core.telegram.org/bots/api#chatboostsourcegiftcode)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| source | `"gift_code"` | Yes | Source of the boost, always “gift_code” |
| user | [`User`](user.md) | Yes | User for which the gift code was created |
