# transferBusinessAccountStars

Transfers Telegram Stars from the business account balance to the bot&#39;s balance Requires the can_transfer_stars business bot right

[Telegram docs](https://core.telegram.org/bots/api#transferbusinessaccountstars)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection |
| star_count | `number` | Yes | Number of Telegram Stars to transfer; 1-10000 |

## Return type

`boolean`
