# promoteChatMember

Use this method to promote or demote a user in a supergroup or a channel The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights Pass False for all boolean parameters to demote a user

[Telegram docs](https://core.telegram.org/bots/api#promotechatmember)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| user_id | `number` | Yes | Unique identifier of the target user |
| is_anonymous | `boolean` | No | Pass True if the administrator&#39;s presence in the chat is hidden |
| can_manage_chat | `boolean` | No | Pass True if the administrator can access the chat event log, get boost list, see hidden supergroup and channel members, report spam messages, ignore slow mode, and send messages to the chat without paying Telegram Stars Implied by any other administrator privilege. |
| can_delete_messages | `boolean` | No | Pass True if the administrator can delete messages of other users |
| can_manage_video_chats | `boolean` | No | Pass True if the administrator can manage video chats |
| can_restrict_members | `boolean` | No | Pass True if the administrator can restrict, ban or unban chat members, or access supergroup statistics |
| can_promote_members | `boolean` | No | Pass True if the administrator can add new administrators with a subset of their own privileges or demote administrators that they have promoted, directly or indirectly (promoted by administrators that were appointed by him) |
| can_change_info | `boolean` | No | Pass True if the administrator can change chat title, photo and other settings |
| can_invite_users | `boolean` | No | Pass True if the administrator can invite new users to the chat |
| can_post_stories | `boolean` | No | Pass True if the administrator can post stories to the chat |
| can_edit_stories | `boolean` | No | Pass True if the administrator can edit stories posted by other users, post stories to the chat page, pin chat stories, and access the chat&#39;s story archive |
| can_delete_stories | `boolean` | No | Pass True if the administrator can delete stories posted by other users |
| can_post_messages | `boolean` | No | Pass True if the administrator can post messages in the channel, approve suggested posts, or access channel statistics; for channels only |
| can_edit_messages | `boolean` | No | Pass True if the administrator can edit messages of other users and can pin messages; for channels only |
| can_pin_messages | `boolean` | No | Pass True if the administrator can pin messages; for supergroups only |
| can_manage_topics | `boolean` | No | Pass True if the user is allowed to create, rename, close, and reopen forum topics; for supergroups only |
| can_manage_direct_messages | `boolean` | No | Pass True if the administrator can manage direct messages within the channel and decline suggested posts; for channels only |

## Return type

`boolean`
