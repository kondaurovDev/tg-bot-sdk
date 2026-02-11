# getUserProfilePhotos

Use this method to get a list of profile pictures for a user

[Telegram docs](https://core.telegram.org/bots/api#getuserprofilephotos)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | `number` | Yes | Unique identifier of the target user |
| offset | `number` | No | Sequential number of the first photo to be returned By default, all photos are returned. |
| limit | `number` | No | Limits the number of photos to be retrieved Values between 1-100 are accepted Defaults to 100. |

## Return type

[`UserProfilePhotos`](../types/user-profile-photos.md)
