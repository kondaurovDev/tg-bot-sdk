# InputContactMessageContent

Represents the content of a contact message to be sent as the result of an inline query.

[Telegram docs](https://core.telegram.org/bots/api#inputcontactmessagecontent)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phone_number | `string` | Yes | Contact&#39;s phone number |
| first_name | `string` | Yes | Contact&#39;s first name |
| last_name | `string` | No | Contact&#39;s last name |
| vcard | `string` | No | Additional data about the contact in the form of a vCard, 0-2048 bytes |
