# ForceReply

Upon receiving a message with this object, Telegram clients will display a reply interface to the user (act as if the user has selected the bot&#39;s message and tapped &#39;Reply&#39;) This can be extremely useful if you want to create user-friendly step-by-step interfaces without having to sacrifice privacy mode Not supported in channels and for messages sent on behalf of a Telegram Business account.

[Telegram docs](https://core.telegram.org/bots/api#forcereply)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| force_reply | `boolean` | Yes | Shows reply interface to the user, as if they manually selected the bot&#39;s message and tapped &#39;Reply&#39; |
| input_field_placeholder | `string` | No | The placeholder to be shown in the input field when the reply is active; 1-64 characters |
| selective | `boolean` | No | Use this parameter if you want to force reply from specific users only Targets: 1) users that are @mentioned in the text of the Message object; 2) if the bot&#39;s message is a reply to a message in the same chat and forum topic, sender of the original message. |
