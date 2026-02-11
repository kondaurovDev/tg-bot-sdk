# editChatSubscriptionInviteLink

Use this method to edit a subscription invite link created by the bot The bot must have the can_invite_users administrator rights

[Telegram docs](https://core.telegram.org/bots/api#editchatsubscriptioninvitelink)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| invite_link | `string` | Yes | The invite link to edit |
| name | `string` | No | Invite link name; 0-32 characters |

## Return type

[`ChatInviteLink`](../types/chat-invite-link.md)
