# InlineQueryResultVenue

Represents a venue By default, the venue will be sent by the user Alternatively, you can use input_message_content to send a message with the specified content instead of the venue.

[Telegram docs](https://core.telegram.org/bots/api#inlinequeryresultvenue)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"venue"` | Yes | Type of the result, must be venue |
| id | `string` | Yes | Unique identifier for this result, 1-64 Bytes |
| latitude | `number` | Yes | Latitude of the venue location in degrees |
| longitude | `number` | Yes | Longitude of the venue location in degrees |
| title | `string` | Yes | Title of the venue |
| address | `string` | Yes | Address of the venue |
| foursquare_id | `string` | No | Foursquare identifier of the venue if known |
| foursquare_type | `string` | No | Foursquare type of the venue, if known (For example, “arts_entertainment/default”, “arts_entertainment/aquarium” or “food/icecream”.) |
| google_place_id | `string` | No | Google Places identifier of the venue |
| google_place_type | `string` | No | Google Places type of the venue (See supported types.) |
| reply_markup | [`InlineKeyboardMarkup`](inline-keyboard-markup.md) | No | Inline keyboard attached to the message |
| input_message_content | [`InputMessageContent`](input-message-content.md) | No | Content of the message to be sent instead of the venue |
| thumbnail_url | `string` | No | Url of the thumbnail for the result |
| thumbnail_width | `number` | No | Thumbnail width |
| thumbnail_height | `number` | No | Thumbnail height |
