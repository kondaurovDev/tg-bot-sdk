# InlineQueryResultContact

Represents a contact with a phone number By default, this contact will be sent by the user Alternatively, you can use input_message_content to send a message with the specified content instead of the contact.

[Telegram docs](https://core.telegram.org/bots/api#inlinequeryresultcontact)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"contact"` | Yes | Type of the result, must be contact |
| id | `string` | Yes | Unique identifier for this result, 1-64 Bytes |
| phone_number | `string` | Yes | Contact&#39;s phone number |
| first_name | `string` | Yes | Contact&#39;s first name |
| last_name | `string` | No | Contact&#39;s last name |
| vcard | `string` | No | Additional data about the contact in the form of a vCard, 0-2048 bytes |
| reply_markup | [`InlineKeyboardMarkup`](inline-keyboard-markup.md) | No | Inline keyboard attached to the message |
| input_message_content | [`InputMessageContent`](input-message-content.md) | No | Content of the message to be sent instead of the contact |
| thumbnail_url | `string` | No | Url of the thumbnail for the result |
| thumbnail_width | `number` | No | Thumbnail width |
| thumbnail_height | `number` | No | Thumbnail height |
