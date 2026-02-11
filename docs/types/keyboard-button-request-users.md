# KeyboardButtonRequestUsers

This object defines the criteria used to request suitable users Information about the selected users will be shared with the bot when the corresponding button is pressed More about requesting users »

[Telegram docs](https://core.telegram.org/bots/api#keyboardbuttonrequestusers)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| request_id | `number` | Yes | Signed 32-bit identifier of the request that will be received back in the UsersShared object Must be unique within the message |
| user_is_bot | `boolean` | No | Pass True to request bots, pass False to request regular users If not specified, no additional restrictions are applied. |
| user_is_premium | `boolean` | No | Pass True to request premium users, pass False to request non-premium users If not specified, no additional restrictions are applied. |
| max_quantity | `number` | No | The maximum number of users to be selected; 1-10 Defaults to 1. |
| request_name | `boolean` | No | Pass True to request the users&#39; first and last names |
| request_username | `boolean` | No | Pass True to request the users&#39; usernames |
| request_photo | `boolean` | No | Pass True to request the users&#39; photos |
