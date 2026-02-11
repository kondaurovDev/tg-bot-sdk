# unpinAllChatMessages

Use this method to clear the list of pinned messages in a chat In private chats and channel direct messages chats, no additional rights are required to unpin all pinned messages Conversely, the bot must be an administrator with the &#39;can_pin_messages&#39; right or the &#39;can_edit_messages&#39; right to unpin all pinned messages in groups and channels respectively

[Telegram docs](https://core.telegram.org/bots/api#unpinallchatmessages)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |

## Return type

`boolean`
