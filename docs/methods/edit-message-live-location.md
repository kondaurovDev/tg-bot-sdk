# editMessageLiveLocation

Use this method to edit live location messages A location can be edited until its live_period expires or editing is explicitly disabled by a call to stopMessageLiveLocation

[Telegram docs](https://core.telegram.org/bots/api#editmessagelivelocation)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| latitude | `number` | Yes | Latitude of new location |
| longitude | `number` | Yes | Longitude of new location |
| business_connection_id | `string` | No | Unique identifier of the business connection on behalf of which the message to be edited was sent |
| chat_id | `number` \| `string` | No | Required if inline_message_id is not specified Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| message_id | `number` | No | Required if inline_message_id is not specified Identifier of the message to edit |
| inline_message_id | `string` | No | Required if chat_id and message_id are not specified Identifier of the inline message |
| live_period | `number` | No | New period in seconds during which the location can be updated, starting from the message send date If 0x7FFFFFFF is specified, then the location can be updated forever Otherwise, the new value must not exceed the current live_period by more than a day, and the live location expiration date must remain within the next 90 days If not specified, then live_period remains unchanged |
| horizontal_accuracy | `number` | No | The radius of uncertainty for the location, measured in meters; 0-1500 |
| heading | `number` | No | Direction in which the user is moving, in degrees Must be between 1 and 360 if specified. |
| proximity_alert_radius | `number` | No | The maximum distance for proximity alerts about approaching another chat member, in meters Must be between 1 and 100000 if specified. |
| reply_markup | [`InlineKeyboardMarkup`](../types/inline-keyboard-markup.md) | No | A JSON-serialized object for a new inline keyboard. |

## Return type

[`Message`](../types/message.md) \| `boolean`
