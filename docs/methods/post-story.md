# postStory

Posts a story on behalf of a managed business account Requires the can_manage_stories business bot right

[Telegram docs](https://core.telegram.org/bots/api#poststory)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| business_connection_id | `string` | Yes | Unique identifier of the business connection |
| content | [`InputStoryContent`](../types/input-story-content.md) | Yes | Content of the story |
| active_period | `number` | Yes | Period after which the story is moved to the archive, in seconds; must be one of 6 * 3600, 12 * 3600, 86400, or 2 * 86400 |
| caption | `string` | No | Caption of the story, 0-2048 characters after entities parsing |
| parse_mode | `"HTML" | "MarkdownV2"` | No | Mode for parsing entities in the story caption See formatting options for more details. |
| caption_entities | [`MessageEntity`](../types/message-entity.md)[] | No | A JSON-serialized list of special entities that appear in the caption, which can be specified instead of parse_mode |
| areas | [`StoryArea`](../types/story-area.md)[] | No | A JSON-serialized list of clickable areas to be shown on the story |
| post_to_chat_page | `boolean` | No | Pass True to keep the story accessible after it expires |
| protect_content | `boolean` | No | Pass True if the content of the story must be protected from forwarding and screenshotting |

## Return type

[`Story`](../types/story.md)
