# StoryAreaTypeLocation

Describes a story area pointing to a location Currently, a story can have up to 10 location areas.

[Telegram docs](https://core.telegram.org/bots/api#storyareatypelocation)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"location"` | Yes | Type of the area, always “location” |
| latitude | `number` | Yes | Location latitude in degrees |
| longitude | `number` | Yes | Location longitude in degrees |
| address | [`LocationAddress`](location-address.md) | No | Address of the location |
