# InlineKeyboardButton

This object represents one button of an inline keyboard Exactly one of the optional fields must be used to specify type of the button.

[Telegram docs](https://core.telegram.org/bots/api#inlinekeyboardbutton)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | `string` | Yes | Label text on the button |
| url | `string` | No | HTTP or tg:// URL to be opened when the button is pressed Links tg://user?id=&lt;user_id&gt; can be used to mention a user by their identifier without using a username, if this is allowed by their privacy settings. |
| callback_data | `string` | No | Data to be sent in a callback query to the bot when the button is pressed, 1-64 bytes |
| web_app | [`WebAppInfo`](web-app-info.md) | No | Description of the Web App that will be launched when the user presses the button The Web App will be able to send an arbitrary message on behalf of the user using the method answerWebAppQuery Available only in private chats between a user and the bot Not supported for messages sent on behalf of a Telegram Business account. |
| login_url | [`LoginUrl`](login-url.md) | No | An HTTPS URL used to automatically authorize the user Can be used as a replacement for the Telegram Login Widget. |
| switch_inline_query | `string` | No | If set, pressing the button will prompt the user to select one of their chats, open that chat and insert the bot&#39;s username and the specified inline query in the input field May be empty, in which case just the bot&#39;s username will be inserted Not supported for messages sent in channel direct messages chats and on behalf of a Telegram Business account. |
| switch_inline_query_current_chat | `string` | No | If set, pressing the button will insert the bot&#39;s username and the specified inline query in the current chat&#39;s input field May be empty, in which case only the bot&#39;s username will be inserted . This offers a quick way for the user to open your bot in inline mode in the same chat - good for selecting something from multiple options Not supported in channels and for messages sent in channel direct messages chats and on behalf of a Telegram Business account. |
| switch_inline_query_chosen_chat | [`SwitchInlineQueryChosenChat`](switch-inline-query-chosen-chat.md) | No | If set, pressing the button will prompt the user to select one of their chats of the specified type, open that chat and insert the bot&#39;s username and the specified inline query in the input field Not supported for messages sent in channel direct messages chats and on behalf of a Telegram Business account. |
| copy_text | [`CopyTextButton`](copy-text-button.md) | No | Description of the button that copies the specified text to the clipboard. |
| callback_game | [`CallbackGame`](callback-game.md) | No | Description of the game that will be launched when the user presses the button . NOTE: This type of button must always be the first button in the first row. |
| pay | `boolean` | No | Specify True, to send a Pay button Substrings “⭐” and “XTR” in the buttons&#39;s text will be replaced with a Telegram Star icon . NOTE: This type of button must always be the first button in the first row and can only be used in invoice messages. |
