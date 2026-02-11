# RevenueWithdrawalStateSucceeded

The withdrawal succeeded.

[Telegram docs](https://core.telegram.org/bots/api#revenuewithdrawalstatesucceeded)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"succeeded"` | Yes | Type of the state, always “succeeded” |
| date | `number` | Yes | Date the withdrawal was completed in Unix time |
| url | `string` | Yes | An HTTPS URL that can be used to see transaction details |
