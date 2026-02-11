# setBusinessAccountName

Changes the first and last name of a managed business account Requires the can_change_name business bot right

[Telegram docs](https://core.telegram.org/bots/api#setbusinessaccountname)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection |
| first_name | `string` | Yes | The new value of the first name for the business account; 1-64 characters |
| last_name | `string` | No | The new value of the last name for the business account; 0-64 characters |

## Return type

`boolean`
