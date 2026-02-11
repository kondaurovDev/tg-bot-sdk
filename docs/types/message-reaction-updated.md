# MessageReactionUpdated

This object represents a change of a reaction on a message performed by a user.

[Telegram docs](https://core.telegram.org/bots/api#messagereactionupdated)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| chat | [`Chat`](chat.md) | Yes | The chat containing the message the user reacted to |
| message_id | `number` | Yes | Unique identifier of the message inside the chat |
| date | `number` | Yes | Date of the change in Unix time |
| old_reaction | [`ReactionType`](reaction-type.md)[] | Yes | Previous list of reaction types that were set by the user |
| new_reaction | [`ReactionType`](reaction-type.md)[] | Yes | New list of reaction types that have been set by the user |
| user | [`User`](user.md) | No | The user that changed the reaction, if the user isn&#39;t anonymous |
| actor_chat | [`Chat`](chat.md) | No | The chat on behalf of which the reaction was changed, if the user is anonymous |
