# Update

This object represents an incoming update . At most one of the optional parameters can be present in any given update.

[Telegram docs](https://core.telegram.org/bots/api#update)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| update_id | `number` | Yes | The update&#39;s unique identifier Update identifiers start from a certain positive number and increase sequentially This identifier becomes especially handy if you&#39;re using webhooks, since it allows you to ignore repeated updates or to restore the correct update sequence, should they get out of order If there are no new updates for at least a week, then identifier of the next update will be chosen randomly instead of sequentially. |
| message | [`Message`](message.md) | No | New incoming message of any kind - text, photo, sticker, etc. |
| edited_message | [`Message`](message.md) | No | New version of a message that is known to the bot and was edited This update may at times be triggered by changes to message fields that are either unavailable or not actively used by your bot. |
| channel_post | [`Message`](message.md) | No | New incoming channel post of any kind - text, photo, sticker, etc. |
| edited_channel_post | [`Message`](message.md) | No | New version of a channel post that is known to the bot and was edited This update may at times be triggered by changes to message fields that are either unavailable or not actively used by your bot. |
| business_connection | [`BusinessConnection`](business-connection.md) | No | The bot was connected to or disconnected from a business account, or a user edited an existing connection with the bot |
| business_message | [`Message`](message.md) | No | New message from a connected business account |
| edited_business_message | [`Message`](message.md) | No | New version of a message from a connected business account |
| deleted_business_messages | [`BusinessMessagesDeleted`](business-messages-deleted.md) | No | Messages were deleted from a connected business account |
| message_reaction | [`MessageReactionUpdated`](message-reaction-updated.md) | No | A reaction to a message was changed by a user The bot must be an administrator in the chat and must explicitly specify "message_reaction" in the list of allowed_updates to receive these updates The update isn&#39;t received for reactions set by bots. |
| message_reaction_count | [`MessageReactionCountUpdated`](message-reaction-count-updated.md) | No | Reactions to a message with anonymous reactions were changed The bot must be an administrator in the chat and must explicitly specify "message_reaction_count" in the list of allowed_updates to receive these updates The updates are grouped and can be sent with delay up to a few minutes. |
| inline_query | [`InlineQuery`](inline-query.md) | No | New incoming inline query |
| chosen_inline_result | [`ChosenInlineResult`](chosen-inline-result.md) | No | The result of an inline query that was chosen by a user and sent to their chat partner Please see our documentation on the feedback collecting for details on how to enable these updates for your bot. |
| callback_query | [`CallbackQuery`](callback-query.md) | No | New incoming callback query |
| shipping_query | [`ShippingQuery`](shipping-query.md) | No | New incoming shipping query Only for invoices with flexible price |
| pre_checkout_query | [`PreCheckoutQuery`](pre-checkout-query.md) | No | New incoming pre-checkout query Contains full information about checkout |
| purchased_paid_media | [`PaidMediaPurchased`](paid-media-purchased.md) | No | A user purchased paid media with a non-empty payload sent by the bot in a non-channel chat |
| poll | [`Poll`](poll.md) | No | New poll state Bots receive only updates about manually stopped polls and polls, which are sent by the bot |
| poll_answer | [`PollAnswer`](poll-answer.md) | No | A user changed their answer in a non-anonymous poll Bots receive new votes only in polls that were sent by the bot itself. |
| my_chat_member | [`ChatMemberUpdated`](chat-member-updated.md) | No | The bot&#39;s chat member status was updated in a chat For private chats, this update is received only when the bot is blocked or unblocked by the user. |
| chat_member | [`ChatMemberUpdated`](chat-member-updated.md) | No | A chat member&#39;s status was updated in a chat The bot must be an administrator in the chat and must explicitly specify "chat_member" in the list of allowed_updates to receive these updates. |
| chat_join_request | [`ChatJoinRequest`](chat-join-request.md) | No | A request to join the chat has been sent The bot must have the can_invite_users administrator right in the chat to receive these updates. |
| chat_boost | [`ChatBoostUpdated`](chat-boost-updated.md) | No | A chat boost was added or changed The bot must be an administrator in the chat to receive these updates. |
| removed_chat_boost | [`ChatBoostRemoved`](chat-boost-removed.md) | No | A boost was removed from a chat The bot must be an administrator in the chat to receive these updates. |
