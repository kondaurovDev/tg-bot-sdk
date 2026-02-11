# sendGift

Sends a gift to the given user or channel chat The gift can&#39;t be converted to Telegram Stars by the receiver

[Telegram docs](https://core.telegram.org/bots/api#sendgift)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| gift_id | `string` | Yes | Identifier of the gift |
| user_id | `number` | No | Required if chat_id is not specified Unique identifier of the target user who will receive the gift. |
| chat_id | `number` \| `string` | No | Required if user_id is not specified Unique identifier for the chat or username of the channel (in the format @channelusername) that will receive the gift. |
| pay_for_upgrade | `boolean` | No | Pass True to pay for the gift upgrade from the bot&#39;s balance, thereby making the upgrade free for the receiver |
| text | `string` | No | Text that will be shown along with the gift; 0-128 characters |
| text_parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the text See formatting options for more details Entities other than “bold”, “italic”, “underline”, “strikethrough”, “spoiler”, and “custom_emoji” are ignored. |
| text_entities | [`MessageEntity`](../types/message-entity.md)[] | No | A JSON-serialized list of special entities that appear in the gift text It can be specified instead of text_parse_mode Entities other than “bold”, “italic”, “underline”, “strikethrough”, “spoiler”, and “custom_emoji” are ignored. |

## Return type

`boolean`
