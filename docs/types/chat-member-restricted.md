# ChatMemberRestricted

Represents a chat member that is under certain restrictions in the chat Supergroups only.

[Telegram docs](https://core.telegram.org/bots/api#chatmemberrestricted)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | `"restricted"` | Yes | The member&#39;s status in the chat, always “restricted” |
| user | [`User`](user.md) | Yes | Information about the user |
| is_member | `boolean` | Yes | True, if the user is a member of the chat at the moment of the request |
| can_send_messages | `boolean` | Yes | True, if the user is allowed to send text messages, contacts, giveaways, giveaway winners, invoices, locations and venues |
| can_send_audios | `boolean` | Yes | True, if the user is allowed to send audios |
| can_send_documents | `boolean` | Yes | True, if the user is allowed to send documents |
| can_send_photos | `boolean` | Yes | True, if the user is allowed to send photos |
| can_send_videos | `boolean` | Yes | True, if the user is allowed to send videos |
| can_send_video_notes | `boolean` | Yes | True, if the user is allowed to send video notes |
| can_send_voice_notes | `boolean` | Yes | True, if the user is allowed to send voice notes |
| can_send_polls | `boolean` | Yes | True, if the user is allowed to send polls and checklists |
| can_send_other_messages | `boolean` | Yes | True, if the user is allowed to send animations, games, stickers and use inline bots |
| can_add_web_page_previews | `boolean` | Yes | True, if the user is allowed to add web page previews to their messages |
| can_change_info | `boolean` | Yes | True, if the user is allowed to change the chat title, photo and other settings |
| can_invite_users | `boolean` | Yes | True, if the user is allowed to invite new users to the chat |
| can_pin_messages | `boolean` | Yes | True, if the user is allowed to pin messages |
| can_manage_topics | `boolean` | Yes | True, if the user is allowed to create forum topics |
| until_date | `number` | Yes | Date when restrictions will be lifted for this user; Unix time If 0, then the user is restricted forever |
