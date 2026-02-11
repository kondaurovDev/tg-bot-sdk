# BackgroundTypePattern

The background is a .PNG or .TGV (gzipped subset of SVG with MIME type “application/x-tgwallpattern”) pattern to be combined with the background fill chosen by the user.

[Telegram docs](https://core.telegram.org/bots/api#backgroundtypepattern)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"pattern"` | Yes | Type of the background, always “pattern” |
| document | [`Document`](document.md) | Yes | Document with the pattern |
| fill | [`BackgroundFill`](background-fill.md) | Yes | The background fill that is combined with the pattern |
| intensity | `number` | Yes | Intensity of the pattern when it is shown above the filled background; 0-100 |
| is_inverted | `boolean` | No | True, if the background fill must be applied only to the pattern itself All other pixels are black in this case For dark themes only |
| is_moving | `boolean` | No | True, if the background moves slightly when the device is tilted |
