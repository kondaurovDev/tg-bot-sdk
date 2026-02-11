# ExternalReplyInfo

This object contains information about a message that is being replied to, which may come from another chat or forum topic.

[Telegram docs](https://core.telegram.org/bots/api#externalreplyinfo)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| origin | [`MessageOrigin`](message-origin.md) | Yes | Origin of the message replied to by the given message |
| chat | [`Chat`](chat.md) | No | Chat the original message belongs to Available only if the chat is a supergroup or a channel. |
| message_id | `number` | No | Unique message identifier inside the original chat Available only if the original chat is a supergroup or a channel. |
| link_preview_options | [`LinkPreviewOptions`](link-preview-options.md) | No | Options used for link preview generation for the original message, if it is a text message |
| animation | [`Animation`](animation.md) | No | Message is an animation, information about the animation |
| audio | [`Audio`](audio.md) | No | Message is an audio file, information about the file |
| document | [`Document`](document.md) | No | Message is a general file, information about the file |
| paid_media | [`PaidMediaInfo`](paid-media-info.md) | No | Message contains paid media; information about the paid media |
| photo | [`PhotoSize`](photo-size.md)[] | No | Message is a photo, available sizes of the photo |
| sticker | [`Sticker`](sticker.md) | No | Message is a sticker, information about the sticker |
| story | [`Story`](story.md) | No | Message is a forwarded story |
| video | [`Video`](video.md) | No | Message is a video, information about the video |
| video_note | [`VideoNote`](video-note.md) | No | Message is a video note, information about the video message |
| voice | [`Voice`](voice.md) | No | Message is a voice message, information about the file |
| has_media_spoiler | `boolean` | No | True, if the message media is covered by a spoiler animation |
| checklist | [`Checklist`](checklist.md) | No | Message is a checklist |
| contact | [`Contact`](contact.md) | No | Message is a shared contact, information about the contact |
| dice | [`Dice`](dice.md) | No | Message is a dice with random value |
| game | [`Game`](game.md) | No | Message is a game, information about the game More about games » |
| giveaway | [`Giveaway`](giveaway.md) | No | Message is a scheduled giveaway, information about the giveaway |
| giveaway_winners | [`GiveawayWinners`](giveaway-winners.md) | No | A giveaway with public winners was completed |
| invoice | [`Invoice`](invoice.md) | No | Message is an invoice for a payment, information about the invoice More about payments » |
| location | [`Location`](location.md) | No | Message is a shared location, information about the location |
| poll | [`Poll`](poll.md) | No | Message is a native poll, information about the poll |
| venue | [`Venue`](venue.md) | No | Message is a venue, information about the venue |
