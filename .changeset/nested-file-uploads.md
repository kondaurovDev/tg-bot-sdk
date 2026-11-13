---
"@effect-ak/tg-bot-api": minor
"@effect-ak/tg-bot-client": minor
---

Upload files that sit inside objects: album items in `send_media_group`, the media of `edit_message_media`, `send_paid_media`, stickers in `create_new_sticker_set` / `add_sticker_to_set` / `replace_sticker_in_set`, `set_my_profile_photo`, story content, and the thumbnails and covers of `InputMedia*`.

**`@effect-ak/tg-bot-api`** — the 25 fields the docs describe as `attach://<file_attach_name>` uploads are typed `InputFile | string` instead of `string`, so a file can be passed there.

**`@effect-ak/tg-bot-client`** — a file found inside an object is sent as its own multipart part, and the JSON carries `attach://file<N>` in its place, as the Bot API expects. Before, it was serialized into the JSON and the upload failed.

```ts
await client.execute("send_media_group", {
  chat_id,
  media: [
    { type: "photo", media: { file_content: first, file_name: "1.jpg" } },
    { type: "photo", media: new File([second], "2.jpg") }
  ]
})
```
