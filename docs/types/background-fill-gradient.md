# BackgroundFillGradient

The background is a gradient fill.

[Telegram docs](https://core.telegram.org/bots/api#backgroundfillgradient)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"gradient"` | Yes | Type of the background fill, always “gradient” |
| top_color | `number` | Yes | Top color of the gradient in the RGB24 format |
| bottom_color | `number` | Yes | Bottom color of the gradient in the RGB24 format |
| rotation_angle | `number` | Yes | Clockwise rotation angle of the background fill in degrees; 0-359 |
