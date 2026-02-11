# ChatMemberUpdated

This object represents changes in the status of a chat member.

[Telegram docs](https://core.telegram.org/bots/api#chatmemberupdated)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| chat | [`Chat`](chat.md) | Yes | Chat the user belongs to |
| from | [`User`](user.md) | Yes | Performer of the action, which resulted in the change |
| date | `number` | Yes | Date the change was done in Unix time |
| old_chat_member | [`ChatMember`](chat-member.md) | Yes | Previous information about the chat member |
| new_chat_member | [`ChatMember`](chat-member.md) | Yes | New information about the chat member |
| invite_link | [`ChatInviteLink`](chat-invite-link.md) | No | Chat invite link, which was used by the user to join the chat; for joining by invite link events only. |
| via_join_request | `boolean` | No | True, if the user joined the chat after sending a direct join request without using an invite link and being approved by an administrator |
| via_chat_folder_invite_link | `boolean` | No | True, if the user joined the chat via a chat folder invite link |
