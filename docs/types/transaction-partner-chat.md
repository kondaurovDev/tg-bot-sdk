# TransactionPartnerChat

Describes a transaction with a chat.

[Telegram docs](https://core.telegram.org/bots/api#transactionpartnerchat)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"chat"` | Yes | Type of the transaction partner, always “chat” |
| chat | [`Chat`](chat.md) | Yes | Information about the chat |
| gift | [`Gift`](gift.md) | No | The gift sent to the chat by the bot |
