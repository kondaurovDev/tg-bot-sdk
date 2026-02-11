# ChatPermissions

Describes actions that a non-administrator user is allowed to take in a chat.

[Telegram docs](https://core.telegram.org/bots/api#chatpermissions)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| can_send_messages | `boolean` | No | True, if the user is allowed to send text messages, contacts, giveaways, giveaway winners, invoices, locations and venues |
| can_send_audios | `boolean` | No | True, if the user is allowed to send audios |
| can_send_documents | `boolean` | No | True, if the user is allowed to send documents |
| can_send_photos | `boolean` | No | True, if the user is allowed to send photos |
| can_send_videos | `boolean` | No | True, if the user is allowed to send videos |
| can_send_video_notes | `boolean` | No | True, if the user is allowed to send video notes |
| can_send_voice_notes | `boolean` | No | True, if the user is allowed to send voice notes |
| can_send_polls | `boolean` | No | True, if the user is allowed to send polls and checklists |
| can_send_other_messages | `boolean` | No | True, if the user is allowed to send animations, games, stickers and use inline bots |
| can_add_web_page_previews | `boolean` | No | True, if the user is allowed to add web page previews to their messages |
| can_change_info | `boolean` | No | True, if the user is allowed to change the chat title, photo and other settings Ignored in public supergroups |
| can_invite_users | `boolean` | No | True, if the user is allowed to invite new users to the chat |
| can_pin_messages | `boolean` | No | True, if the user is allowed to pin messages Ignored in public supergroups |
| can_manage_topics | `boolean` | No | True, if the user is allowed to create forum topics If omitted defaults to the value of can_pin_messages |
