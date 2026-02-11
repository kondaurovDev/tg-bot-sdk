# InlineQueryResultLocation

Represents a location on a map By default, the location will be sent by the user Alternatively, you can use input_message_content to send a message with the specified content instead of the location.

[Telegram docs](https://core.telegram.org/bots/api#inlinequeryresultlocation)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"location"` | Yes | Type of the result, must be location |
| id | `string` | Yes | Unique identifier for this result, 1-64 Bytes |
| latitude | `number` | Yes | Location latitude in degrees |
| longitude | `number` | Yes | Location longitude in degrees |
| title | `string` | Yes | Location title |
| horizontal_accuracy | `number` | No | The radius of uncertainty for the location, measured in meters; 0-1500 |
| live_period | `number` | No | Period in seconds during which the location can be updated, should be between 60 and 86400, or 0x7FFFFFFF for live locations that can be edited indefinitely. |
| heading | `number` | No | For live locations, a direction in which the user is moving, in degrees Must be between 1 and 360 if specified. |
| proximity_alert_radius | `number` | No | For live locations, a maximum distance for proximity alerts about approaching another chat member, in meters Must be between 1 and 100000 if specified. |
| reply_markup | [`InlineKeyboardMarkup`](inline-keyboard-markup.md) | No | Inline keyboard attached to the message |
| input_message_content | [`InputMessageContent`](input-message-content.md) | No | Content of the message to be sent instead of the location |
| thumbnail_url | `string` | No | Url of the thumbnail for the result |
| thumbnail_width | `number` | No | Thumbnail width |
| thumbnail_height | `number` | No | Thumbnail height |
