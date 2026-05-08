---
"@effect-ak/tg-bot-api": minor
---

Update generated types to Telegram Bot API 10.0

- Guest mode: `answerGuestQuery`, `SentGuestMessage`, `guest_message` updates, `supports_guest_queries`
- Live Photos: `sendLivePhoto`, `LivePhoto`, `InputMediaLivePhoto`, `PaidMediaLivePhoto`, `InputPaidMediaLivePhoto`
- Polls with media: `media` on `Poll`/`PollOption`/`InputPollOption`, `explanation_media`, `members_only`, `country_codes`
- Reactions: `deleteMessageReaction`, `deleteAllMessageReactions`, `can_react_to_messages` permission
- Managed bot access: `getManagedBotAccessSettings`, `setManagedBotAccessSettings`, `BotAccessSettings`
- Other: `getUserPersonalChatMessages`, `return_bots` on `getChatAdministrators`, empty-text `sendMessageDraft`, business bots without Premium, bot-to-bot messaging via username
