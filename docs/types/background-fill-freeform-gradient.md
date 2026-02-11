# BackgroundFillFreeformGradient

The background is a freeform gradient that rotates after every message in the chat.

[Telegram docs](https://core.telegram.org/bots/api#backgroundfillfreeformgradient)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"freeform_gradient"` | Yes | Type of the background fill, always “freeform_gradient” |
| colors | `number[]` | Yes | A list of the 3 or 4 base colors that are used to generate the freeform gradient in the RGB24 format |
