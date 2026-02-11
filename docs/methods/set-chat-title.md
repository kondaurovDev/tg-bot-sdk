# setChatTitle

Use this method to change the title of a chat Titles can&#39;t be changed for private chats The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights

[Telegram docs](https://core.telegram.org/bots/api#setchattitle)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| title | `string` | Yes | New chat title, 1-128 characters |

## Return type

`boolean`
