# UserProfilePhotos

This object represent a user&#39;s profile pictures.

[Telegram docs](https://core.telegram.org/bots/api#userprofilephotos)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| total_count | `number` | Yes | Total number of profile pictures the target user has |
| photos | [`PhotoSize[]`](photo-size[].md)[] | Yes | Requested profile pictures (in up to 4 sizes each) |
