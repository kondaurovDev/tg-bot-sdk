# pinChatMessage

Use this method to add a message to the list of pinned messages in a chat In private chats and channel direct messages chats, all non-service messages can be pinned Conversely, the bot must be an administrator with the &#39;can_pin_messages&#39; right or the &#39;can_edit_messages&#39; right to pin messages in groups and channels respectively

[Telegram docs](https://core.telegram.org/bots/api#pinchatmessage)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| message_id | `number` | Yes | Identifier of a message to pin |
| business_connection_id | `string` | No | Unique identifier of the business connection on behalf of which the message will be pinned |
| disable_notification | `boolean` | No | Pass True if it is not necessary to send a notification to all chat members about the new pinned message Notifications are always disabled in channels and private chats. |

## Return type

`boolean`
