# StoryAreaTypeLink

Describes a story area pointing to an HTTP or tg:// link Currently, a story can have up to 3 link areas.

[Telegram docs](https://core.telegram.org/bots/api#storyareatypelink)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"link"` | Yes | Type of the area, always “link” |
| url | `string` | Yes | HTTP or tg:// URL to be opened when the area is clicked |
