# editChatInviteLink

Use this method to edit a non-primary invite link created by the bot The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights

[Telegram docs](https://core.telegram.org/bots/api#editchatinvitelink)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| invite_link | `string` | Yes | The invite link to edit |
| name | `string` | No | Invite link name; 0-32 characters |
| expire_date | `number` | No | Point in time (Unix timestamp) when the link will expire |
| member_limit | `number` | No | The maximum number of users that can be members of the chat simultaneously after joining the chat via this invite link; 1-99999 |
| creates_join_request | `boolean` | No | True, if users joining the chat via the link need to be approved by chat administrators If True, member_limit can&#39;t be specified |

## Return type

[`ChatInviteLink`](../types/chat-invite-link.md)
