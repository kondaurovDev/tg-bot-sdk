---
"@effect-ak/tg-bot-api": minor
---

Fix scraper mistakes in the generated types, found by new invariant tests that check the whole spec against the docs.

- Types the docs describe as "Currently holds no information" were `never`, so they could be neither sent nor read: `{ text, disabled: {} }` (`DisabledButton`, Bot API 10.3) and `callback_game: {}` did not compile, and `message.forum_topic_closed`, `video_chat_started` and the like were typed as always absent. They are now `Record<string, never>`. Affected: `CallbackGame`, `CommunityChatRemoved`, `DisabledButton`, `ForumTopicClosed`, `ForumTopicReopened`, `GeneralForumTopicHidden`, `GeneralForumTopicUnhidden`, `PaidMessagesWaived`, `VideoChatStarted`.
- `send_media_group`: `media` accepts `InputMediaLivePhoto`. The docs list the members as "A, B, C and D", which the parser now reads; a stale hand-written list had left live photos out.
- Enums the scraper missed are now enums: `answer_chat_join_request_query` `result`, `send_poll` `type`, `EncryptedPassportElement.type`, `InlineQuery.chat_type`, `WidgetQuery.chat_type`, `InlineQueryResultDocument.mime_type`, `MaskPosition.point`, `UniqueGiftInfo.origin`, and Mini Apps `colorScheme`.
- Mini Apps signatures now follow the docs: `requestChat` and `Serverless.call` were `unknown`; `requestEmojiStatusAccess` takes only a callback (it was typed with the `url` of `openInvoice`); `shareMessage` takes a string `msg_id`; `switchInlineQuery` takes an array `choose_chat_types`; `shareToStory`, `setEmojiStatus` and `BottomButton.showProgress` use the documented parameters. `EventHandlers` gains `contactRequested` and `secondaryButtonClicked`; `ServerlessCallError` describes the error `Serverless.call` reports.
