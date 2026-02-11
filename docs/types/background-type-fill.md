# BackgroundTypeFill

The background is automatically filled based on the selected colors.

[Telegram docs](https://core.telegram.org/bots/api#backgroundtypefill)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"fill"` | Yes | Type of the background, always “fill” |
| fill | [`BackgroundFill`](background-fill.md) | Yes | The background fill |
| dark_theme_dimming | `number` | Yes | Dimming of the background in dark themes, as a percentage; 0-100 |
