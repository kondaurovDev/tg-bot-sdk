# BackgroundTypeWallpaper

The background is a wallpaper in the JPEG format.

[Telegram docs](https://core.telegram.org/bots/api#backgroundtypewallpaper)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"wallpaper"` | Yes | Type of the background, always “wallpaper” |
| document | [`Document`](document.md) | Yes | Document with the wallpaper |
| dark_theme_dimming | `number` | Yes | Dimming of the background in dark themes, as a percentage; 0-100 |
| is_blurred | `boolean` | No | True, if the wallpaper is downscaled to fit in a 450x450 square and then box-blurred with radius 12 |
| is_moving | `boolean` | No | True, if the background moves slightly when the device is tilted |
