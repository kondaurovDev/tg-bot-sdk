# setBusinessAccountUsername

Changes the username of a managed business account Requires the can_change_username business bot right

[Telegram docs](https://core.telegram.org/bots/api#setbusinessaccountusername)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection |
| username | `string` | No | The new value of the username for the business account; 0-32 characters |

## Return type

`boolean`
