# Location

This object represents a point on the map.

[Telegram docs](https://core.telegram.org/bots/api#location)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| latitude | `number` | Yes | Latitude as defined by the sender |
| longitude | `number` | Yes | Longitude as defined by the sender |
| horizontal_accuracy | `number` | No | The radius of uncertainty for the location, measured in meters; 0-1500 |
| live_period | `number` | No | Time relative to the message sending date, during which the location can be updated; in seconds For active live locations only. |
| heading | `number` | No | The direction in which user is moving, in degrees; 1-360 For active live locations only. |
| proximity_alert_radius | `number` | No | The maximum distance for proximity alerts about approaching another chat member, in meters For sent live locations only. |
