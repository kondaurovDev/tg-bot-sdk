# StoryAreaTypeSuggestedReaction

Describes a story area pointing to a suggested reaction Currently, a story can have up to 5 suggested reaction areas.

[Telegram docs](https://core.telegram.org/bots/api#storyareatypesuggestedreaction)

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"suggested_reaction"` | Yes | Type of the area, always “suggested_reaction” |
| reaction_type | [`ReactionType`](reaction-type.md) | Yes | Type of the reaction |
| is_dark | `boolean` | No | Pass True if the reaction area has a dark background |
| is_flipped | `boolean` | No | Pass True if reaction area corner is flipped |
