# revokeChatInviteLink

Use this method to revoke an invite link created by the bot If the primary link is revoked, a new link is automatically generated The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights

[Telegram docs](https://core.telegram.org/bots/api#revokechatinvitelink)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier of the target chat or username of the target channel (in the format @channelusername) |
| invite_link | `string` | Yes | The invite link to revoke |

## Return type

[`ChatInviteLink`](../types/chat-invite-link.md)
