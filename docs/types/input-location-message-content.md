# InputLocationMessageContent

Represents the content of a location message to be sent as the result of an inline query.

[Telegram docs](https://core.telegram.org/bots/api#inputlocationmessagecontent)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| latitude | `number` | Yes | Latitude of the location in degrees |
| longitude | `number` | Yes | Longitude of the location in degrees |
| horizontal_accuracy | `number` | No | The radius of uncertainty for the location, measured in meters; 0-1500 |
| live_period | `number` | No | Period in seconds during which the location can be updated, should be between 60 and 86400, or 0x7FFFFFFF for live locations that can be edited indefinitely. |
| heading | `number` | No | For live locations, a direction in which the user is moving, in degrees Must be between 1 and 360 if specified. |
| proximity_alert_radius | `number` | No | For live locations, a maximum distance for proximity alerts about approaching another chat member, in meters Must be between 1 and 100000 if specified. |
