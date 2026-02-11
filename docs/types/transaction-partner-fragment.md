# TransactionPartnerFragment

Describes a withdrawal transaction with Fragment.

[Telegram docs](https://core.telegram.org/bots/api#transactionpartnerfragment)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"fragment"` | Yes | Type of the transaction partner, always “fragment” |
| withdrawal_state | [`RevenueWithdrawalState`](revenue-withdrawal-state.md) | No | State of the transaction if the transaction is outgoing |
