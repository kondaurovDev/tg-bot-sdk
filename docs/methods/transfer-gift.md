# transferGift

Transfers an owned unique gift to another user Requires the can_transfer_and_upgrade_gifts business bot right Requires can_transfer_stars business bot right if the transfer is paid

[Telegram docs](https://core.telegram.org/bots/api#transfergift)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection |
| owned_gift_id | `string` | Yes | Unique identifier of the regular gift that should be transferred |
| new_owner_chat_id | `number` | Yes | Unique identifier of the chat which will own the gift The chat must be active in the last 24 hours. |
| star_count | `number` | No | The amount of Telegram Stars that will be paid for the transfer from the business account balance If positive, then the can_transfer_stars business bot right is required. |

## Return type

`boolean`
