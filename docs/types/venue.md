# Venue

This object represents a venue.

[Telegram docs](https://core.telegram.org/bots/api#venue)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| location | [`Location`](location.md) | Yes | Venue location Can&#39;t be a live location |
| title | `string` | Yes | Name of the venue |
| address | `string` | Yes | Address of the venue |
| foursquare_id | `string` | No | Foursquare identifier of the venue |
| foursquare_type | `string` | No | Foursquare type of the venue (For example, “arts_entertainment/default”, “arts_entertainment/aquarium” or “food/icecream”.) |
| google_place_id | `string` | No | Google Places identifier of the venue |
| google_place_type | `string` | No | Google Places type of the venue (See supported types.) |
