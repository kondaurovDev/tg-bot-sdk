# setMessageReaction

Use this method to change the chosen reactions on a message Service messages of some types can&#39;t be reacted to Automatically forwarded messages from a channel to its discussion group have the same available reactions as messages in the channel Bots can&#39;t use paid reactions

[Telegram docs](https://core.telegram.org/bots/api#setmessagereaction)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_id | `number` \| `string` | Yes | Unique identifier for the target chat or username of the target channel (in the format @channelusername) |
| message_id | `number` | Yes | Identifier of the target message If the message belongs to a media group, the reaction is set to the first non-deleted message in the group instead. |
| reaction | [`ReactionType`](../types/reaction-type.md)[] | No | A JSON-serialized list of reaction types to set on the message Currently, as non-premium users, bots can set up to one reaction per message A custom emoji reaction can be used if it is either already present on the message or explicitly allowed by chat administrators Paid reactions can&#39;t be used by bots. |
| is_big | `boolean` | No | Pass True to set the reaction with a big animation |

## Return type

`boolean`
