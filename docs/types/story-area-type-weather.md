# StoryAreaTypeWeather

Describes a story area containing weather information Currently, a story can have up to 3 weather areas.

[Telegram docs](https://core.telegram.org/bots/api#storyareatypeweather)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"weather"` | Yes | Type of the area, always “weather” |
| temperature | `number` | Yes | Temperature, in degree Celsius |
| emoji | `string` | Yes | Emoji representing the weather |
| background_color | `number` | Yes | A color of the area background in the ARGB format |
