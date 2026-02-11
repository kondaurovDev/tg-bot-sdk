# unpinChatMessage

Use this method to remove a message from the list of pinned messages in a chat In private chats and channel direct messages chats, all messages can be unpinned Conversely, the bot must be an administrator with the &#39;can_pin_messages&#39; right or the &#39;can_edit_messages&#39; right to unpin messages in groups and channels respectively

[Telegram docs](https://core.telegram.org/bots/api#unpinchatmessage)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| business_connection_id | `string` | No | Unique identifier of the business connection on behalf of which the message will be unpinned |
| message_id | `number` | No | Identifier of the message to unpin Required if business_connection_id is specified If not specified, the most recent pinned message (by sending date) will be unpinned. |

## Return type

`boolean`
