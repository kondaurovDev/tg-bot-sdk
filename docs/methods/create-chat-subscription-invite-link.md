# createChatSubscriptionInviteLink

Use this method to create a subscription invite link for a channel chat The bot must have the can_invite_users administrator rights The link can be edited using the method editChatSubscriptionInviteLink or revoked using the method revokeChatInviteLink

[Telegram docs](https://core.telegram.org/bots/api#createchatsubscriptioninvitelink)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target channel chat or username of the target channel (in the format @channelusername) |
| subscription_period | `number` | Yes | The number of seconds the subscription will be active for before the next payment Currently, it must always be 2592000 (30 days). |
| subscription_price | `number` | Yes | The amount of Telegram Stars a user must pay initially and after each subsequent subscription period to be a member of the chat; 1-10000 |
| name | `string` | No | Invite link name; 0-32 characters |

## Return type

[`ChatInviteLink`](../types/chat-invite-link.md)
