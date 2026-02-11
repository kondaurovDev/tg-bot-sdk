# StoryAreaPosition

Describes the position of a clickable area within a story.

[Telegram docs](https://core.telegram.org/bots/api#storyareaposition)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| x_percentage | `number` | Yes | The abscissa of the area&#39;s center, as a percentage of the media width |
| y_percentage | `number` | Yes | The ordinate of the area&#39;s center, as a percentage of the media height |
| width_percentage | `number` | Yes | The width of the area&#39;s rectangle, as a percentage of the media width |
| height_percentage | `number` | Yes | The height of the area&#39;s rectangle, as a percentage of the media height |
| rotation_angle | `number` | Yes | The clockwise rotation angle of the rectangle, in degrees; 0-360 |
| corner_radius_percentage | `number` | Yes | The radius of the rectangle corner rounding, as a percentage of the media width |
