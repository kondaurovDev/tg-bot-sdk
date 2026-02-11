# answerWebAppQuery

Use this method to set the result of an interaction with a Web App and send a corresponding message on behalf of the user to the chat from which the query originated

[Telegram docs](https://core.telegram.org/bots/api#answerwebappquery)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| web_app_query_id | `string` | Yes | Unique identifier for the query to be answered |
| result | [`InlineQueryResult`](../types/inline-query-result.md) | Yes | A JSON-serialized object describing the message to be sent |

## Return type

[`SentWebAppMessage`](../types/sent-web-app-message.md)
