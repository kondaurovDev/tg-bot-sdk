# setBusinessAccountGiftSettings

Changes the privacy settings pertaining to incoming gifts in a managed business account Requires the can_change_gift_settings business bot right

[Telegram docs](https://core.telegram.org/bots/api#setbusinessaccountgiftsettings)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection |
| show_gift_button | `boolean` | Yes | Pass True, if a button for sending a gift to the user or by the business account must always be shown in the input field |
| accepted_gift_types | [`AcceptedGiftTypes`](../types/accepted-gift-types.md) | Yes | Types of gifts accepted by the business account |

## Return type

`boolean`
