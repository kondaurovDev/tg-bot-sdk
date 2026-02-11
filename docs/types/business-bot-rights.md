# BusinessBotRights

Represents the rights of a business bot.

[Telegram docs](https://core.telegram.org/bots/api#businessbotrights)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| can_reply | `boolean` | No | True, if the bot can send and edit messages in the private chats that had incoming messages in the last 24 hours |
| can_read_messages | `boolean` | No | True, if the bot can mark incoming private messages as read |
| can_delete_sent_messages | `boolean` | No | True, if the bot can delete messages sent by the bot |
| can_delete_all_messages | `boolean` | No | True, if the bot can delete all private messages in managed chats |
| can_edit_name | `boolean` | No | True, if the bot can edit the first and last name of the business account |
| can_edit_bio | `boolean` | No | True, if the bot can edit the bio of the business account |
| can_edit_profile_photo | `boolean` | No | True, if the bot can edit the profile photo of the business account |
| can_edit_username | `boolean` | No | True, if the bot can edit the username of the business account |
| can_change_gift_settings | `boolean` | No | True, if the bot can change the privacy settings pertaining to gifts for the business account |
| can_view_gifts_and_stars | `boolean` | No | True, if the bot can view gifts and the amount of Telegram Stars owned by the business account |
| can_convert_gifts_to_stars | `boolean` | No | True, if the bot can convert regular gifts owned by the business account to Telegram Stars |
| can_transfer_and_upgrade_gifts | `boolean` | No | True, if the bot can transfer and upgrade gifts owned by the business account |
| can_transfer_stars | `boolean` | No | True, if the bot can transfer Telegram Stars received by the business account to its own account, or use them to upgrade and transfer gifts |
| can_manage_stories | `boolean` | No | True, if the bot can post, edit and delete stories on behalf of the business account |
