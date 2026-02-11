# SuggestedPostInfo

Contains information about a suggested post.

[Telegram docs](https://core.telegram.org/bots/api#suggestedpostinfo)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| state | `"pending" | "approved" | "declined"` | Yes | State of the suggested post Currently, it can be one of “pending”, “approved”, “declined”. |
| price | [`SuggestedPostPrice`](suggested-post-price.md) | No | Proposed price of the post If the field is omitted, then the post is unpaid. |
| send_date | `number` | No | Proposed send date of the post If the field is omitted, then the post can be published at any time within 30 days at the sole discretion of the user or administrator who approves it. |
