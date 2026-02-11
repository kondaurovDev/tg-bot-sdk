# BusinessOpeningHoursInterval

Describes an interval of time during which a business is open.

[Telegram docs](https://core.telegram.org/bots/api#businessopeninghoursinterval)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| opening_minute | `number` | Yes | The minute&#39;s sequence number in a week, starting on Monday, marking the start of the time interval during which the business is open; 0 - 7 * 24 * 60 |
| closing_minute | `number` | Yes | The minute&#39;s sequence number in a week, starting on Monday, marking the end of the time interval during which the business is open; 0 - 8 * 24 * 60 |
