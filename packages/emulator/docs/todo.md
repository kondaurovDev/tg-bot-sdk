# Emulator: what's still missing

Gaps against Bot API 10.4, roughly by value. Guiding rule stays the same as
in [architecture.md](architecture.md): emulate faithfully what bots commonly
exercise in tests and the playground; stay lenient elsewhere.

## High value

- [x] **User-side interactions beyond text and buttons** (done):
  - [x] `editMessage(...)` → `edited_message` update
  - [x] `sendPhoto/sendDocument(...)` (bytes round-trip via `get_file`) → media update
  - [x] `react(...)` → `message_reaction` update (with `old_reaction`/`new_reaction`)
  - [x] `sendInlineQuery(...)` + `answer_inline_query` + `chooseInlineResult(...)`
        (posts the chosen `input_message_content.message_text` to the chat)
- [ ] **MarkdownV2 parse mode** — second most-used formatting; currently only
      HTML is parsed (Markdown returns 400 in rich input, passes through as
      plain text in `send_message`).
- [ ] **`send_poll` / poll answers** — polls are common in bots; needs
      user-side `answerPoll` too.
- [ ] **Reply keyboards** (`ReplyKeyboardMarkup`) — store them on messages and
      let the user "tap" a reply button (which is just a text message, but the
      playground could render the keyboard).
- [ ] **Rate-limit simulation** — opt-in `429` + `retry_after` injection to
      test backoff logic; same for arbitrary error injection
      (`emulator.failNext("send_message", ...)`).

- [ ] **Widgets (10.4)** — `send_widget`, `send_shared_widget`,
      `answer_widget_query`, `edit_message_widget_data`,
      `edit_shared_widget_data`, plus a user-side `widgetRequest(data)` that
      delivers a `widget_query` and resolves with the bot's answer (or
      `TIMEOUT`). In production widgets work only in the private chat with the
      bot, which is exactly the emulator's model.

## Medium

- [ ] **Draft TTL** — real drafts expire after ~30 s; an opt-in timer would
      catch bots that stream slower than the TTL.
- [ ] **Ephemeral messages** (10.2) — `ephemeral_message_parameters`,
      auto-delete semantics. Since 10.4 `chat_id` is optional for an ephemeral
      reply to a callback query.
- [ ] **`send_media_group`** — album messages with shared `media_group_id`.
- [ ] **Entity auto-detection** — real Telegram detects `url`, `mention`,
      `#hashtag` in plain text; the emulator only detects `bot_command`.
- [ ] **Pin/unpin** (`pin_chat_message`, `unpin_*`) + `pinned_message` service
      message.
- [ ] **`send_venue`, `send_video_note`** — trivial media stubs, just not done.
- [ ] **Rich blocks media resolution** — media ids inside
      `InputRichMessage.media` are passed through; resolve them against
      `uploads` like `get_file` does.
- [ ] **Markdown → rich blocks** — `InputRichMessage.markdown` (needs the
      MarkdownV2 parser first).

## Later / open questions

- [ ] **Multiple chats / groups / topics / communities (10.2)** — the biggest
      structural change; would turn `chat` into a collection and add member
      semantics. Worth doing only when someone actually tests group bots.
- [ ] **Payments** — invoices, `pre_checkout_query`, Stars.
- [ ] **Checklists (9.1), gifts, business messages, guest queries** — niche;
      add on demand.
- [ ] **Webhook-mode sugar** — `createWebhook` already works with
      `client: emulator.client`, but a `emulator.deliverTo(handler)` helper
      that feeds updates into a webhook handler would make that path
      first-class.
- [ ] **Chat administration** — `get_chat_member`, restrict/promote; mostly
      useful for group support (above).
