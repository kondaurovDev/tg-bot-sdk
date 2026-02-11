# ChatAdministratorRights

Represents the rights of an administrator in a chat.

[Telegram docs](https://core.telegram.org/bots/api#chatadministratorrights)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| is_anonymous | `boolean` | Yes | True, if the user&#39;s presence in the chat is hidden |
| can_manage_chat | `boolean` | Yes | True, if the administrator can access the chat event log, get boost list, see hidden supergroup and channel members, report spam messages, ignore slow mode, and send messages to the chat without paying Telegram Stars Implied by any other administrator privilege. |
| can_delete_messages | `boolean` | Yes | True, if the administrator can delete messages of other users |
| can_manage_video_chats | `boolean` | Yes | True, if the administrator can manage video chats |
| can_restrict_members | `boolean` | Yes | True, if the administrator can restrict, ban or unban chat members, or access supergroup statistics |
| can_promote_members | `boolean` | Yes | True, if the administrator can add new administrators with a subset of their own privileges or demote administrators that they have promoted, directly or indirectly (promoted by administrators that were appointed by the user) |
| can_change_info | `boolean` | Yes | True, if the user is allowed to change the chat title, photo and other settings |
| can_invite_users | `boolean` | Yes | True, if the user is allowed to invite new users to the chat |
| can_post_stories | `boolean` | Yes | True, if the administrator can post stories to the chat |
| can_edit_stories | `boolean` | Yes | True, if the administrator can edit stories posted by other users, post stories to the chat page, pin chat stories, and access the chat&#39;s story archive |
| can_delete_stories | `boolean` | Yes | True, if the administrator can delete stories posted by other users |
| can_post_messages | `boolean` | No | True, if the administrator can post messages in the channel, approve suggested posts, or access channel statistics; for channels only |
| can_edit_messages | `boolean` | No | True, if the administrator can edit messages of other users and can pin messages; for channels only |
| can_pin_messages | `boolean` | No | True, if the user is allowed to pin messages; for groups and supergroups only |
| can_manage_topics | `boolean` | No | True, if the user is allowed to create, rename, close, and reopen forum topics; for supergroups only |
| can_manage_direct_messages | `boolean` | No | True, if the administrator can manage direct messages of the channel and decline suggested posts; for channels only |
