# Playground UX/UI improvement ideas

## Done

- [x] Neutral "not connected" text — gray instead of red
- [x] Bot state badge — pulsing green dot (running), red (error), gray (idle)
- [x] Run / Stop buttons + Cmd+Enter shortcut
- [x] Log entry styling — color-coded left border, timestamps
- [x] Inline token input — styled modal instead of `prompt()`/`confirm()`
- [x] Contextual Run/Stop — only one button visible at a time
- [x] Token persistence — localStorage auto-connect, pre-fill, "Forget" button

## Medium effort

- [x] **Resizable panels** — draggable divider between editor and logs
- [x] **Collapsible log entries** — large JSON collapsed by default, click to expand
- [x] **Toast notifications** — "Bot started" / "Bot stopped" as small toasts instead of log entries
- [x] **Auto-save code to localStorage** — persist user edits across page reloads
- [x] **Keyboard shortcut hints** — show `Cmd+Enter` hint in the Run button tooltip or as a subtle label

## Bigger ideas

- [ ] **"Try without token" mode** — mock Telegram API responses so users can explore the editor without a real bot
- [ ] **Split logs: Events vs Console** — two tabs: lifecycle events and incoming Telegram updates
- [ ] **Mobile layout** — stack editor on top, logs below with tab toggle
- [ ] **Share snippet** — URL-encode editor content for shareable playground links
- [ ] **Custom theme** — dark/light mode toggle for the editor and surrounding UI
- [ ] **Error overlay** — show TypeScript compilation errors inline in the editor, not just in logs
- [ ] **Multi-file support** — tabs for splitting bot code across multiple files
