# setChatPhoto

Use this method to set a new profile photo for the chat Photos can&#39;t be changed for private chats The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights

[Telegram docs](https://core.telegram.org/bots/api#setchatphoto)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| photo | [`InputFile`](../types/input-file.md) | Yes | New chat photo, uploaded using multipart/form-data |

## Return type

`boolean`
