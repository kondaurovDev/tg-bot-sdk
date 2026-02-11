# ChatFullInfo

This object contains full information about a chat.

[Telegram docs](https://core.telegram.org/bots/api#chatfullinfo)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `number` | Yes | Unique identifier for this chat This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this identifier. |
| type | `"private" | "group" | "supergroup" | "channel"` | Yes | Type of the chat, can be either “private”, “group”, “supergroup” or “channel” |
| accent_color_id | `number` | Yes | Identifier of the accent color for the chat name and backgrounds of the chat photo, reply header, and link preview See accent colors for more details. |
| max_reaction_count | `number` | Yes | The maximum number of reactions that can be set on a message in the chat |
| accepted_gift_types | [`AcceptedGiftTypes`](accepted-gift-types.md) | Yes | Information about types of gifts that are accepted by the chat or by the corresponding user for private chats |
| title | `string` | No | Title, for supergroups, channels and group chats |
| username | `string` | No | Username, for private chats, supergroups and channels if available |
| first_name | `string` | No | First name of the other party in a private chat |
| last_name | `string` | No | Last name of the other party in a private chat |
| is_forum | `boolean` | No | True, if the supergroup chat is a forum (has topics enabled) |
| is_direct_messages | `boolean` | No | True, if the chat is the direct messages chat of a channel |
| photo | [`ChatPhoto`](chat-photo.md) | No | Chat photo |
| active_usernames | `string[]` | No | If non-empty, the list of all active chat usernames; for private chats, supergroups and channels |
| birthdate | [`Birthdate`](birthdate.md) | No | For private chats, the date of birth of the user |
| business_intro | [`BusinessIntro`](business-intro.md) | No | For private chats with business accounts, the intro of the business |
| business_location | [`BusinessLocation`](business-location.md) | No | For private chats with business accounts, the location of the business |
| business_opening_hours | [`BusinessOpeningHours`](business-opening-hours.md) | No | For private chats with business accounts, the opening hours of the business |
| personal_chat | [`Chat`](chat.md) | No | For private chats, the personal channel of the user |
| parent_chat | [`Chat`](chat.md) | No | Information about the corresponding channel chat; for direct messages chats only |
| available_reactions | [`ReactionType`](reaction-type.md)[] | No | List of available reactions allowed in the chat If omitted, then all emoji reactions are allowed. |
| background_custom_emoji_id | `string` | No | Custom emoji identifier of the emoji chosen by the chat for the reply header and link preview background |
| profile_accent_color_id | `number` | No | Identifier of the accent color for the chat&#39;s profile background See profile accent colors for more details. |
| profile_background_custom_emoji_id | `string` | No | Custom emoji identifier of the emoji chosen by the chat for its profile background |
| emoji_status_custom_emoji_id | `string` | No | Custom emoji identifier of the emoji status of the chat or the other party in a private chat |
| emoji_status_expiration_date | `number` | No | Expiration date of the emoji status of the chat or the other party in a private chat, in Unix time, if any |
| bio | `string` | No | Bio of the other party in a private chat |
| has_private_forwards | `boolean` | No | True, if privacy settings of the other party in the private chat allows to use tg://user?id=&lt;user_id&gt; links only in chats with the user |
| has_restricted_voice_and_video_messages | `boolean` | No | True, if the privacy settings of the other party restrict sending voice and video note messages in the private chat |
| join_to_send_messages | `boolean` | No | True, if users need to join the supergroup before they can send messages |
| join_by_request | `boolean` | No | True, if all users directly joining the supergroup without using an invite link need to be approved by supergroup administrators |
| description | `string` | No | Description, for groups, supergroups and channel chats |
| invite_link | `string` | No | Primary invite link, for groups, supergroups and channel chats |
| pinned_message | [`Message`](message.md) | No | The most recent pinned message (by sending date) |
| permissions | [`ChatPermissions`](chat-permissions.md) | No | Default chat member permissions, for groups and supergroups |
| can_send_paid_media | `boolean` | No | True, if paid media messages can be sent or forwarded to the channel chat The field is available only for channel chats. |
| slow_mode_delay | `number` | No | For supergroups, the minimum allowed delay between consecutive messages sent by each unprivileged user; in seconds |
| unrestrict_boost_count | `number` | No | For supergroups, the minimum number of boosts that a non-administrator user needs to add in order to ignore slow mode and chat permissions |
| message_auto_delete_time | `number` | No | The time after which all messages sent to the chat will be automatically deleted; in seconds |
| has_aggressive_anti_spam_enabled | `boolean` | No | True, if aggressive anti-spam checks are enabled in the supergroup The field is only available to chat administrators. |
| has_hidden_members | `boolean` | No | True, if non-administrators can only get the list of bots and administrators in the chat |
| has_protected_content | `boolean` | No | True, if messages from the chat can&#39;t be forwarded to other chats |
| has_visible_history | `boolean` | No | True, if new chat members will have access to old messages; available only to chat administrators |
| sticker_set_name | `string` | No | For supergroups, name of the group sticker set |
| can_set_sticker_set | `boolean` | No | True, if the bot can change the group sticker set |
| custom_emoji_sticker_set_name | `string` | No | For supergroups, the name of the group&#39;s custom emoji sticker set Custom emoji from this set can be used by all users and bots in the group. |
| linked_chat_id | `number` | No | Unique identifier for the linked chat, i.e the discussion group identifier for a channel and vice versa; for supergroups and channel chats This identifier may be greater than 32 bits and some programming languages may have difficulty/silent defects in interpreting it But it is smaller than 52 bits, so a signed 64 bit integer or double-precision float type are safe for storing this identifier. |
| location | [`ChatLocation`](chat-location.md) | No | For supergroups, the location to which the supergroup is connected |
