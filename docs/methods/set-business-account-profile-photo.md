# setBusinessAccountProfilePhoto

Changes the profile photo of a managed business account Requires the can_edit_profile_photo business bot right

[Telegram docs](https://core.telegram.org/bots/api#setbusinessaccountprofilephoto)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection |
| photo | [`InputProfilePhoto`](../types/input-profile-photo.md) | Yes | The new profile photo to set |
| is_public | `boolean` | No | Pass True to set the public photo, which will be visible even if the main photo is hidden by the business account&#39;s privacy settings An account can have only one public photo. |

## Return type

`boolean`
