# sendPoll

Use this method to send a native poll

[Telegram docs](https://core.telegram.org/bots/api#sendpoll)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) Polls can&#39;t be sent to channel direct messages chats. |
| question | `string` | Yes | Poll question, 1-300 characters |
| options | [`InputPollOption`](../types/input-poll-option.md)[] | Yes | A JSON-serialized list of 2-12 answer options |
| business_connection_id | `string` | No | Unique identifier of the business connection on behalf of which the message will be sent |
| message_thread_id | `number` | No | Unique identifier for the target message thread (topic) of the forum; for forum supergroups only |
| question_parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the question See formatting options for more details Currently, only custom emoji entities are allowed |
| question_entities | [`MessageEntity`](../types/message-entity.md)[] | No | A JSON-serialized list of special entities that appear in the poll question It can be specified instead of question_parse_mode |
| is_anonymous | `boolean` | No | True, if the poll needs to be anonymous, defaults to True |
| type | `string` | No | Poll type, “quiz” or “regular”, defaults to “regular” |
| allows_multiple_answers | `boolean` | No | True, if the poll allows multiple answers, ignored for polls in quiz mode, defaults to False |
| correct_option_id | `number` | No | 0-based identifier of the correct answer option, required for polls in quiz mode |
| explanation | `string` | No | Text that is shown when a user chooses an incorrect answer or taps on the lamp icon in a quiz-style poll, 0-200 characters with at most 2 line feeds after entities parsing |
| explanation_parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the explanation See formatting options for more details. |
| explanation_entities | [`MessageEntity`](../types/message-entity.md)[] | No | A JSON-serialized list of special entities that appear in the poll explanation It can be specified instead of explanation_parse_mode |
| open_period | `number` | No | Amount of time in seconds the poll will be active after creation, 5-600 Can&#39;t be used together with close_date. |
| close_date | `number` | No | Point in time (Unix timestamp) when the poll will be automatically closed Must be at least 5 and no more than 600 seconds in the future Can&#39;t be used together with open_period. |
| is_closed | `boolean` | No | Pass True if the poll needs to be immediately closed This can be useful for poll preview. |
| disable_notification | `boolean` | No | Sends the message silently Users will receive a notification with no sound. |
| protect_content | `boolean` | No | Protects the contents of the sent message from forwarding and saving |
| allow_paid_broadcast | `boolean` | No | Pass True to allow up to 1000 messages per second, ignoring broadcasting limits for a fee of 0.1 Telegram Stars per message The relevant Stars will be withdrawn from the bot&#39;s balance |
| message_effect_id | `string` | No | Unique identifier of the message effect to be added to the message; for private chats only |
| reply_parameters | [`ReplyParameters`](../types/reply-parameters.md) | No | Description of the message to reply to |
| reply_markup | [`InlineKeyboardMarkup`](../types/inline-keyboard-markup.md) \| [`ReplyKeyboardMarkup`](../types/reply-keyboard-markup.md) \| [`ReplyKeyboardRemove`](../types/reply-keyboard-remove.md) \| [`ForceReply`](../types/force-reply.md) | No | Additional interface options A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user |

## Return type

[`Message`](../types/message.md)
