# removeBusinessAccountProfilePhoto

Removes the current profile photo of a managed business account Requires the can_edit_profile_photo business bot right

[Telegram docs](https://core.telegram.org/bots/api#removebusinessaccountprofilephoto)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection |
| is_public | `boolean` | No | Pass True to remove the public photo, which is visible even if the main photo is hidden by the business account&#39;s privacy settings After the main photo is removed, the previous profile photo (if present) becomes the main photo. |

## Return type

`boolean`
