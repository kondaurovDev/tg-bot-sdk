# DirectMessagePriceChanged

Describes a service message about a change in the price of direct messages sent to a channel chat.

[Telegram docs](https://core.telegram.org/bots/api#directmessagepricechanged)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| are_direct_messages_enabled | `boolean` | Yes | True, if direct messages are enabled for the channel chat; false otherwise |
| direct_message_star_count | `number` | No | The new number of Telegram Stars that must be paid by users for each direct message sent to the channel Does not apply to users who have been exempted by administrators Defaults to 0. |
