# BusinessOpeningHours

Describes the opening hours of a business.

[Telegram docs](https://core.telegram.org/bots/api#businessopeninghours)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| time_zone_name | `string` | Yes | Unique name of the time zone for which the opening hours are defined |
| opening_hours | [`BusinessOpeningHoursInterval`](business-opening-hours-interval.md)[] | Yes | List of time intervals describing business opening hours |
