# upgradeGift

Upgrades a given regular gift to a unique gift Requires the can_transfer_and_upgrade_gifts business bot right Additionally requires the can_transfer_stars business bot right if the upgrade is paid

[Telegram docs](https://core.telegram.org/bots/api#upgradegift)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection |
| owned_gift_id | `string` | Yes | Unique identifier of the regular gift that should be upgraded to a unique one |
| keep_original_details | `boolean` | No | Pass True to keep the original gift text, sender and receiver in the upgraded gift |
| star_count | `number` | No | The amount of Telegram Stars that will be paid for the upgrade from the business account balance If gift.prepaid_upgrade_star_count &gt; 0, then pass 0, otherwise, the can_transfer_stars business bot right is required and gift.upgrade_star_count must be passed. |

## Return type

`boolean`
