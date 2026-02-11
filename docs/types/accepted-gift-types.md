# AcceptedGiftTypes

This object describes the types of gifts that can be gifted to a user or a chat.

[Telegram docs](https://core.telegram.org/bots/api#acceptedgifttypes)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| unlimited_gifts | `boolean` | Yes | True, if unlimited regular gifts are accepted |
| limited_gifts | `boolean` | Yes | True, if limited regular gifts are accepted |
| unique_gifts | `boolean` | Yes | True, if unique gifts or gifts that can be upgraded to unique for free are accepted |
| premium_subscription | `boolean` | Yes | True, if a Telegram Premium subscription is accepted |
