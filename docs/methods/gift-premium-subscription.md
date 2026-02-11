# giftPremiumSubscription

Gifts a Telegram Premium subscription to the given user

[Telegram docs](https://core.telegram.org/bots/api#giftpremiumsubscription)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | `number` | Yes | Unique identifier of the target user who will receive a Telegram Premium subscription |
| month_count | `number` | Yes | Number of months the Telegram Premium subscription will be active for the user; must be one of 3, 6, or 12 |
| star_count | `number` | Yes | Number of Telegram Stars to pay for the Telegram Premium subscription; must be 1000 for 3 months, 1500 for 6 months, and 2500 for 12 months |
| text | `string` | No | Text that will be shown along with the service message about the subscription; 0-128 characters |
| text_parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the text See formatting options for more details Entities other than “bold”, “italic”, “underline”, “strikethrough”, “spoiler”, and “custom_emoji” are ignored. |
| text_entities | [`MessageEntity`](../types/message-entity.md)[] | No | A JSON-serialized list of special entities that appear in the gift text It can be specified instead of text_parse_mode Entities other than “bold”, “italic”, “underline”, “strikethrough”, “spoiler”, and “custom_emoji” are ignored. |

## Return type

`boolean`
