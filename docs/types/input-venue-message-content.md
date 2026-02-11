# InputVenueMessageContent

Represents the content of a venue message to be sent as the result of an inline query.

[Telegram docs](https://core.telegram.org/bots/api#inputvenuemessagecontent)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| latitude | `number` | Yes | Latitude of the venue in degrees |
| longitude | `number` | Yes | Longitude of the venue in degrees |
| title | `string` | Yes | Name of the venue |
| address | `string` | Yes | Address of the venue |
| foursquare_id | `string` | No | Foursquare identifier of the venue, if known |
| foursquare_type | `string` | No | Foursquare type of the venue, if known (For example, “arts_entertainment/default”, “arts_entertainment/aquarium” or “food/icecream”.) |
| google_place_id | `string` | No | Google Places identifier of the venue |
| google_place_type | `string` | No | Google Places type of the venue (See supported types.) |
