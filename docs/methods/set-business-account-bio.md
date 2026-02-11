# setBusinessAccountBio

Changes the bio of a managed business account Requires the can_change_bio business bot right

[Telegram docs](https://core.telegram.org/bots/api#setbusinessaccountbio)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection |
| bio | `string` | No | The new value of the bio for the business account; 0-140 characters |

## Return type

`boolean`
