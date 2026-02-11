# getBusinessAccountGifts

Returns the gifts received and owned by a managed business account Requires the can_view_gifts_and_stars business bot right

[Telegram docs](https://core.telegram.org/bots/api#getbusinessaccountgifts)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection |
| exclude_unsaved | `boolean` | No | Pass True to exclude gifts that aren&#39;t saved to the account&#39;s profile page |
| exclude_saved | `boolean` | No | Pass True to exclude gifts that are saved to the account&#39;s profile page |
| exclude_unlimited | `boolean` | No | Pass True to exclude gifts that can be purchased an unlimited number of times |
| exclude_limited | `boolean` | No | Pass True to exclude gifts that can be purchased a limited number of times |
| exclude_unique | `boolean` | No | Pass True to exclude unique gifts |
| sort_by_price | `boolean` | No | Pass True to sort results by gift price instead of send date Sorting is applied before pagination. |
| offset | `string` | No | Offset of the first entry to return as received from the previous request; use empty string to get the first chunk of results |
| limit | `number` | No | The maximum number of gifts to be returned; 1-100 Defaults to 100 |

## Return type

[`OwnedGifts`](../types/owned-gifts.md)
