# Message

This object represents a message.

[Telegram docs](https://core.telegram.org/bots/api#message)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message_id | `number` | Yes | Unique message identifier inside this chat In specific instances (e.g., message containing a video sent to a big chat), the server might automatically schedule a message instead of sending it immediately In such cases, this field will be 0 and the relevant message will be unusable until it is actually sent |
| date | `number` | Yes | Date the message was sent in Unix time It is always a positive number, representing a valid date. |
| chat | [`Chat`](chat.md) | Yes | Chat the message belongs to |
| message_thread_id | `number` | No | Unique identifier of a message thread to which the message belongs; for supergroups only |
| direct_messages_topic | [`DirectMessagesTopic`](direct-messages-topic.md) | No | Information about the direct messages chat topic that contains the message |
| from | [`User`](user.md) | No | Sender of the message; may be empty for messages sent to channels For backward compatibility, if the message was sent on behalf of a chat, the field contains a fake sender user in non-channel chats |
| sender_chat | [`Chat`](chat.md) | No | Sender of the message when sent on behalf of a chat For example, the supergroup itself for messages sent by its anonymous administrators or a linked channel for messages automatically forwarded to the channel&#39;s discussion group For backward compatibility, if the message was sent on behalf of a chat, the field from contains a fake sender user in non-channel chats. |
| sender_boost_count | `number` | No | If the sender of the message boosted the chat, the number of boosts added by the user |
| sender_business_bot | [`User`](user.md) | No | The bot that actually sent the message on behalf of the business account Available only for outgoing messages sent on behalf of the connected business account. |
| business_connection_id | `string` | No | Unique identifier of the business connection from which the message was received If non-empty, the message belongs to a chat of the corresponding business account that is independent from any potential bot chat which might share the same identifier. |
| forward_origin | [`MessageOrigin`](message-origin.md) | No | Information about the original message for forwarded messages |
| is_topic_message | `boolean` | No | True, if the message is sent to a forum topic |
| is_automatic_forward | `boolean` | No | True, if the message is a channel post that was automatically forwarded to the connected discussion group |
| reply_to_message | [`Message`](message.md) | No | For replies in the same chat and message thread, the original message Note that the Message object in this field will not contain further reply_to_message fields even if it itself is a reply. |
| external_reply | [`ExternalReplyInfo`](external-reply-info.md) | No | Information about the message that is being replied to, which may come from another chat or forum topic |
| quote | [`TextQuote`](text-quote.md) | No | For replies that quote part of the original message, the quoted part of the message |
| reply_to_story | [`Story`](story.md) | No | For replies to a story, the original story |
| reply_to_checklist_task_id | `number` | No | Identifier of the specific checklist task that is being replied to |
| via_bot | [`User`](user.md) | No | Bot through which the message was sent |
| edit_date | `number` | No | Date the message was last edited in Unix time |
| has_protected_content | `boolean` | No | True, if the message can&#39;t be forwarded |
| is_from_offline | `boolean` | No | True, if the message was sent by an implicit action, for example, as an away or a greeting business message, or as a scheduled message |
| is_paid_post | `boolean` | No | True, if the message is a paid post Note that such posts must not be deleted for 24 hours to receive the payment and can&#39;t be edited. |
| media_group_id | `string` | No | The unique identifier of a media message group this message belongs to |
| author_signature | `string` | No | Signature of the post author for messages in channels, or the custom title of an anonymous group administrator |
| paid_star_count | `number` | No | The number of Telegram Stars that were paid by the sender of the message to send it |
| text | `string` | No | For text messages, the actual UTF-8 text of the message |
| entities | [`MessageEntity`](message-entity.md)[] | No | For text messages, special entities like usernames, URLs, bot commands, etc that appear in the text |
| link_preview_options | [`LinkPreviewOptions`](link-preview-options.md) | No | Options used for link preview generation for the message, if it is a text message and link preview options were changed |
| suggested_post_info | [`SuggestedPostInfo`](suggested-post-info.md) | No | Information about suggested post parameters if the message is a suggested post in a channel direct messages chat If the message is an approved or declined suggested post, then it can&#39;t be edited. |
| effect_id | `string` | No | Unique identifier of the message effect added to the message |
| animation | [`Animation`](animation.md) | No | Message is an animation, information about the animation For backward compatibility, when this field is set, the document field will also be set |
| audio | [`Audio`](audio.md) | No | Message is an audio file, information about the file |
| document | [`Document`](document.md) | No | Message is a general file, information about the file |
| paid_media | [`PaidMediaInfo`](paid-media-info.md) | No | Message contains paid media; information about the paid media |
| photo | [`PhotoSize`](photo-size.md)[] | No | Message is a photo, available sizes of the photo |
| sticker | [`Sticker`](sticker.md) | No | Message is a sticker, information about the sticker |
| story | [`Story`](story.md) | No | Message is a forwarded story |
| video | [`Video`](video.md) | No | Message is a video, information about the video |
| video_note | [`VideoNote`](video-note.md) | No | Message is a video note, information about the video message |
| voice | [`Voice`](voice.md) | No | Message is a voice message, information about the file |
| caption | `string` | No | Caption for the animation, audio, document, paid media, photo, video or voice |
| caption_entities | [`MessageEntity`](message-entity.md)[] | No | For messages with a caption, special entities like usernames, URLs, bot commands, etc that appear in the caption |
| show_caption_above_media | `boolean` | No | True, if the caption must be shown above the message media |
| has_media_spoiler | `boolean` | No | True, if the message media is covered by a spoiler animation |
| checklist | [`Checklist`](checklist.md) | No | Message is a checklist |
| contact | [`Contact`](contact.md) | No | Message is a shared contact, information about the contact |
| dice | [`Dice`](dice.md) | No | Message is a dice with random value |
| game | [`Game`](game.md) | No | Message is a game, information about the game More about games » |
| poll | [`Poll`](poll.md) | No | Message is a native poll, information about the poll |
| venue | [`Venue`](venue.md) | No | Message is a venue, information about the venue For backward compatibility, when this field is set, the location field will also be set |
| location | [`Location`](location.md) | No | Message is a shared location, information about the location |
| new_chat_members | [`User`](user.md)[] | No | New members that were added to the group or supergroup and information about them (the bot itself may be one of these members) |
| left_chat_member | [`User`](user.md) | No | A member was removed from the group, information about them (this member may be the bot itself) |
| new_chat_title | `string` | No | A chat title was changed to this value |
| new_chat_photo | [`PhotoSize`](photo-size.md)[] | No | A chat photo was change to this value |
| delete_chat_photo | `boolean` | No | Service message: the chat photo was deleted |
| group_chat_created | `boolean` | No | Service message: the group has been created |
| supergroup_chat_created | `boolean` | No | Service message: the supergroup has been created This field can&#39;t be received in a message coming through updates, because bot can&#39;t be a member of a supergroup when it is created It can only be found in reply_to_message if someone replies to a very first message in a directly created supergroup. |
| channel_chat_created | `boolean` | No | Service message: the channel has been created This field can&#39;t be received in a message coming through updates, because bot can&#39;t be a member of a channel when it is created It can only be found in reply_to_message if someone replies to a very first message in a channel. |
| message_auto_delete_timer_changed | [`MessageAutoDeleteTimerChanged`](message-auto-delete-timer-changed.md) | No | Service message: auto-delete timer settings changed in the chat |
| migrate_to_chat_id | `number` | No | The group has been migrated to a supergroup with the specified identifier This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this identifier. |
| migrate_from_chat_id | `number` | No | The supergroup has been migrated from a group with the specified identifier This number may have more than 32 significant bits and some programming languages may have difficulty/silent defects in interpreting it But it has at most 52 significant bits, so a signed 64-bit integer or double-precision float type are safe for storing this identifier. |
| pinned_message | [`MaybeInaccessibleMessage`](maybe-inaccessible-message.md) | No | Specified message was pinned Note that the Message object in this field will not contain further reply_to_message fields even if it itself is a reply. |
| invoice | [`Invoice`](invoice.md) | No | Message is an invoice for a payment, information about the invoice More about payments » |
| successful_payment | [`SuccessfulPayment`](successful-payment.md) | No | Message is a service message about a successful payment, information about the payment More about payments » |
| refunded_payment | [`RefundedPayment`](refunded-payment.md) | No | Message is a service message about a refunded payment, information about the payment More about payments » |
| users_shared | [`UsersShared`](users-shared.md) | No | Service message: users were shared with the bot |
| chat_shared | [`ChatShared`](chat-shared.md) | No | Service message: a chat was shared with the bot |
| gift | [`GiftInfo`](gift-info.md) | No | Service message: a regular gift was sent or received |
| unique_gift | [`UniqueGiftInfo`](unique-gift-info.md) | No | Service message: a unique gift was sent or received |
| connected_website | `string` | No | The domain name of the website on which the user has logged in More about Telegram Login » |
| write_access_allowed | [`WriteAccessAllowed`](write-access-allowed.md) | No | Service message: the user allowed the bot to write messages after adding it to the attachment or side menu, launching a Web App from a link, or accepting an explicit request from a Web App sent by the method requestWriteAccess |
| passport_data | [`PassportData`](passport-data.md) | No | Telegram Passport data |
| proximity_alert_triggered | [`ProximityAlertTriggered`](proximity-alert-triggered.md) | No | Service message A user in the chat triggered another user&#39;s proximity alert while sharing Live Location. |
| boost_added | [`ChatBoostAdded`](chat-boost-added.md) | No | Service message: user boosted the chat |
| chat_background_set | [`ChatBackground`](chat-background.md) | No | Service message: chat background set |
| checklist_tasks_done | [`ChecklistTasksDone`](checklist-tasks-done.md) | No | Service message: some tasks in a checklist were marked as done or not done |
| checklist_tasks_added | [`ChecklistTasksAdded`](checklist-tasks-added.md) | No | Service message: tasks were added to a checklist |
| direct_message_price_changed | [`DirectMessagePriceChanged`](direct-message-price-changed.md) | No | Service message: the price for paid messages in the corresponding direct messages chat of a channel has changed |
| forum_topic_created | [`ForumTopicCreated`](forum-topic-created.md) | No | Service message: forum topic created |
| forum_topic_edited | [`ForumTopicEdited`](forum-topic-edited.md) | No | Service message: forum topic edited |
| forum_topic_closed | [`ForumTopicClosed`](forum-topic-closed.md) | No | Service message: forum topic closed |
| forum_topic_reopened | [`ForumTopicReopened`](forum-topic-reopened.md) | No | Service message: forum topic reopened |
| general_forum_topic_hidden | [`GeneralForumTopicHidden`](general-forum-topic-hidden.md) | No | Service message: the &#39;General&#39; forum topic hidden |
| general_forum_topic_unhidden | [`GeneralForumTopicUnhidden`](general-forum-topic-unhidden.md) | No | Service message: the &#39;General&#39; forum topic unhidden |
| giveaway_created | [`GiveawayCreated`](giveaway-created.md) | No | Service message: a scheduled giveaway was created |
| giveaway | [`Giveaway`](giveaway.md) | No | The message is a scheduled giveaway message |
| giveaway_winners | [`GiveawayWinners`](giveaway-winners.md) | No | A giveaway with public winners was completed |
| giveaway_completed | [`GiveawayCompleted`](giveaway-completed.md) | No | Service message: a giveaway without public winners was completed |
| paid_message_price_changed | [`PaidMessagePriceChanged`](paid-message-price-changed.md) | No | Service message: the price for paid messages has changed in the chat |
| suggested_post_approved | [`SuggestedPostApproved`](suggested-post-approved.md) | No | Service message: a suggested post was approved |
| suggested_post_approval_failed | [`SuggestedPostApprovalFailed`](suggested-post-approval-failed.md) | No | Service message: approval of a suggested post has failed |
| suggested_post_declined | [`SuggestedPostDeclined`](suggested-post-declined.md) | No | Service message: a suggested post was declined |
| suggested_post_paid | [`SuggestedPostPaid`](suggested-post-paid.md) | No | Service message: payment for a suggested post was received |
| suggested_post_refunded | [`SuggestedPostRefunded`](suggested-post-refunded.md) | No | Service message: payment for a suggested post was refunded |
| video_chat_scheduled | [`VideoChatScheduled`](video-chat-scheduled.md) | No | Service message: video chat scheduled |
| video_chat_started | [`VideoChatStarted`](video-chat-started.md) | No | Service message: video chat started |
| video_chat_ended | [`VideoChatEnded`](video-chat-ended.md) | No | Service message: video chat ended |
| video_chat_participants_invited | [`VideoChatParticipantsInvited`](video-chat-participants-invited.md) | No | Service message: new participants invited to a video chat |
| web_app_data | [`WebAppData`](web-app-data.md) | No | Service message: data sent by a Web App |
| reply_markup | [`InlineKeyboardMarkup`](inline-keyboard-markup.md) | No | Inline keyboard attached to the message login_url buttons are represented as ordinary url buttons. |
