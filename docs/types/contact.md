# Contact

This object represents a phone contact.

[Telegram docs](https://core.telegram.org/bots/api#contact)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phone_number | `string` | Yes | Contact&#39;s phone number |
| first_name | `string` | Yes | Contact&#39;s first name |
| last_name | `string` | No | Contact&#39;s last name |
| user_id | `number` | No | Contact&#39;s user identifier in Telegram This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it But it has at most 52 significant bits, so a 64-bit integer or double-precision float type are safe for storing this identifier. |
| vcard | `string` | No | Additional data about the contact in the form of a vCard |
