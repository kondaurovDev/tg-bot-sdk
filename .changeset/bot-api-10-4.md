---
"@effect-ak/tg-bot-api": minor
---

Regenerate types for Telegram Bot API 10.4 (Mini Apps unchanged at 10.1).

- Widgets: `Widget` with `Message.widget` / `ExternalReplyInfo.widget`, `send_widget`, `send_shared_widget`, `answer_widget_query`, `edit_message_widget_data`, `edit_shared_widget_data`, `WidgetQuery` / `SharedWidgetQuery` with `Update.widget_query` / `Update.shared_widget_query`, `WidgetQueryType` (`WidgetQueryTypeData`, `WidgetQueryTypeSignData`, `WidgetQueryTypeSentTransaction`), `WidgetQueryWallet`, `InputWidgetMessageContent`, `InputSharedWidgetMessageContent`.
- Ephemeral messages: `chat_id` is now optional in `send_message`, `send_rich_message` and the other `send*` methods that take `ephemeral_message_parameters`, and so is `EphemeralMessageParameters.receiver_user_id` — an ephemeral reply to a callback query needs only `callback_query_id`.
- Quotes from rich messages: `TextQuote.rich_texts`, `ReplyParameters.quote_rich_texts`.
- TON wallet: `TonWalletCard`, `TonWalletCardSticker`, `TonNft`, `TonNftAttribute`, `ChatFullInfo.ton_wallet_card`, `TonWalletTransfer` with `Message.ton_wallet_transfer`.
- Chat share themes: `ChatShareTheme`, `ChatShareThemeEmoji`, `ChatShareThemeUniqueGift`, `ChatShareThemeBackdrop`, `ChatShareThemeBackdrops`, `EmojiType` (`EmojiTypeEmoji`, `EmojiTypeCustomEmoji`), `ChatFullInfo.share_theme`, `get_chat_share_theme_backdrops`.
- Gifts: `get_unique_gift`, `delete_business_account_gift`.
- General: `RichTextTonAddress`, the `ton_address` and `bank_card_number` types of `MessageEntity`, `custom_description_parse_mode` / `custom_description_entities` on `verify_user` and `verify_chat`, `PaidMessagesWaived` with `Message.paid_messages_waived`.

Renamed upstream: `StoryAreaPosition` is now `AreaPosition`. The types mirror Telegram, so the old name is gone — update imports.
