# ChatInviteLink

Represents an invite link for a chat.

[Telegram docs](https://core.telegram.org/bots/api#chatinvitelink)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| invite_link | `string` | Yes | The invite link If the link was created by another chat administrator, then the second part of the link will be replaced with “…”. |
| creator | [`User`](user.md) | Yes | Creator of the link |
| creates_join_request | `boolean` | Yes | True, if users joining the chat via the link need to be approved by chat administrators |
| is_primary | `boolean` | Yes | True, if the link is primary |
| is_revoked | `boolean` | Yes | True, if the link is revoked |
| name | `string` | No | Invite link name |
| expire_date | `number` | No | Point in time (Unix timestamp) when the link will expire or has been expired |
| member_limit | `number` | No | The maximum number of users that can be members of the chat simultaneously after joining the chat via this invite link; 1-99999 |
| pending_join_request_count | `number` | No | Number of pending join requests created using this link |
| subscription_period | `number` | No | The number of seconds the subscription will be active for before the next payment |
| subscription_price | `number` | No | The amount of Telegram Stars a user must pay initially and after each subsequent subscription period to be a member of the chat using the link |
