# convertGiftToStars

Converts a given regular gift to Telegram Stars Requires the can_convert_gifts_to_stars business bot right

[Telegram docs](https://core.telegram.org/bots/api#convertgifttostars)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection |
| owned_gift_id | `string` | Yes | Unique identifier of the regular gift that should be converted to Telegram Stars |

## Return type

`boolean`
