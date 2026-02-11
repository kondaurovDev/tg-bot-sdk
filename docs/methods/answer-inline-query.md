# answerInlineQuery

Use this method to send answers to an inline query . No more than 50 results per query are allowed.

[Telegram docs](https://core.telegram.org/bots/api#answerinlinequery)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| inline_query_id | `string` | Yes | Unique identifier for the answered query |
| results | [`InlineQueryResult`](../types/inline-query-result.md)[] | Yes | A JSON-serialized array of results for the inline query |
| cache_time | `number` | No | The maximum amount of time in seconds that the result of the inline query may be cached on the server Defaults to 300. |
| is_personal | `boolean` | No | Pass True if results may be cached on the server side only for the user that sent the query By default, results may be returned to any user who sends the same query. |
| next_offset | `string` | No | Pass the offset that a client should send in the next query with the same text to receive more results Pass an empty string if there are no more results or if you don&#39;t support pagination Offset length can&#39;t exceed 64 bytes. |
| button | [`InlineQueryResultsButton`](../types/inline-query-results-button.md) | No | A JSON-serialized object describing a button to be shown above inline query results |

## Return type

`boolean`
