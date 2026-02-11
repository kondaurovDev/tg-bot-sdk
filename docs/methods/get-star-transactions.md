# getStarTransactions

Returns the bot&#39;s Telegram Star transactions in chronological order

[Telegram docs](https://core.telegram.org/bots/api#getstartransactions)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| offset | `number` | No | Number of transactions to skip in the response |
| limit | `number` | No | The maximum number of transactions to be retrieved Values between 1-100 are accepted Defaults to 100. |

## Return type

[`StarTransactions`](../types/star-transactions.md)
