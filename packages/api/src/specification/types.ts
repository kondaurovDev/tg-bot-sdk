// GENERATED CODE

export type AllowedUpdateName = Exclude<keyof Update, "update_id">

/**
 * This object describes the types of gifts that can be gifted to a user or a chat.
 * @see https://tg-bot-sdk.website/api/types/accepted-gift-types/
 */
export interface AcceptedGiftTypes {
  unlimited_gifts: boolean
  limited_gifts: boolean
  unique_gifts: boolean
  premium_subscription: boolean
  gifts_from_channels: boolean
}

/**
 * Contains information about the affiliate that received a commission via this transaction.
 * @see https://tg-bot-sdk.website/api/types/affiliate-info/
 */
export interface AffiliateInfo {
  commission_per_mille: number
  amount: number
  affiliate_user?: User
  affiliate_chat?: Chat
  nanostar_amount?: number
}

/**
 * This object represents an animation file (GIF or H.264/MPEG-4 AVC video without sound).
 * @see https://tg-bot-sdk.website/api/types/animation/
 */
export interface Animation {
  file_id: string
  file_unique_id: string
  width: number
  height: number
  duration: number
  thumbnail?: PhotoSize
  file_name?: string
  mime_type?: string
  file_size?: number
}

/**
 * Describes the position of a rectangle area on a story media or a TON wallet card.
 * @see https://tg-bot-sdk.website/api/types/area-position/
 */
export interface AreaPosition {
  x_percentage: number
  y_percentage: number
  width_percentage: number
  height_percentage: number
  rotation_angle: number
  corner_radius_percentage: number
}

/**
 * This object represents an audio file to be treated as music by the Telegram clients.
 * @see https://tg-bot-sdk.website/api/types/audio/
 */
export interface Audio {
  file_id: string
  file_unique_id: string
  duration: number
  performer?: string
  title?: string
  file_name?: string
  mime_type?: string
  file_size?: number
  thumbnail?: PhotoSize
}

/**
 * This object describes the way a background is filled based on the selected colors
 * Currently, it can be one of
 * @see https://tg-bot-sdk.website/api/types/background-fill/
 */
export type BackgroundFill =
  | BackgroundFillSolid
  | BackgroundFillGradient
  | BackgroundFillFreeformGradient

/**
 * The background is a freeform gradient that rotates after every message in the chat.
 * @see https://tg-bot-sdk.website/api/types/background-fill-freeform-gradient/
 */
export interface BackgroundFillFreeformGradient {
  type: "freeform_gradient"
  colors: number[]
}

/**
 * The background is a gradient fill.
 * @see https://tg-bot-sdk.website/api/types/background-fill-gradient/
 */
export interface BackgroundFillGradient {
  type: "gradient"
  top_color: number
  bottom_color: number
  rotation_angle: number
}

/**
 * The background is filled using the selected color.
 * @see https://tg-bot-sdk.website/api/types/background-fill-solid/
 */
export interface BackgroundFillSolid {
  type: "solid"
  color: number
}

/**
 * This object describes the type of a background
 * Currently, it can be one of
 * @see https://tg-bot-sdk.website/api/types/background-type/
 */
export type BackgroundType =
  | BackgroundTypeFill
  | BackgroundTypeWallpaper
  | BackgroundTypePattern
  | BackgroundTypeChatTheme

/**
 * The background is taken directly from a built-in chat theme.
 * @see https://tg-bot-sdk.website/api/types/background-type-chat-theme/
 */
export interface BackgroundTypeChatTheme {
  type: "chat_theme"
  theme_name: string
}

/**
 * The background is automatically filled based on the selected colors.
 * @see https://tg-bot-sdk.website/api/types/background-type-fill/
 */
export interface BackgroundTypeFill {
  type: "fill"
  fill: BackgroundFill
  dark_theme_dimming: number
}

/**
 * The background is a .PNG or .TGV (gzipped subset of SVG with MIME type “application/x-tgwallpattern”) pattern to be combined with the background fill chosen by the user.
 * @see https://tg-bot-sdk.website/api/types/background-type-pattern/
 */
export interface BackgroundTypePattern {
  type: "pattern"
  document: Document
  fill: BackgroundFill
  intensity: number
  is_inverted?: boolean
  is_moving?: boolean
}

/**
 * The background is a wallpaper in the JPEG format.
 * @see https://tg-bot-sdk.website/api/types/background-type-wallpaper/
 */
export interface BackgroundTypeWallpaper {
  type: "wallpaper"
  document: Document
  dark_theme_dimming: number
  is_blurred?: boolean
  is_moving?: boolean
}

/**
 * Describes the birthdate of a user.
 * @see https://tg-bot-sdk.website/api/types/birthdate/
 */
export interface Birthdate {
  day: number
  month: number
  year?: number
}

/**
 * This object describes the access settings of a bot.
 * @see https://tg-bot-sdk.website/api/types/bot-access-settings/
 */
export interface BotAccessSettings {
  is_access_restricted: boolean
  added_users?: User[]
}

/**
 * This object represents a bot command.
 * @see https://tg-bot-sdk.website/api/types/bot-command/
 */
export interface BotCommand {
  command: string
  description: string
  is_ephemeral?: boolean
}

/**
 * This object represents the scope to which bot commands are applied
 * Currently, the following 7 scopes are supported:
 * @see https://tg-bot-sdk.website/api/types/bot-command-scope/
 */
export type BotCommandScope =
  | BotCommandScopeDefault
  | BotCommandScopeAllPrivateChats
  | BotCommandScopeAllGroupChats
  | BotCommandScopeAllChatAdministrators
  | BotCommandScopeChat
  | BotCommandScopeChatAdministrators
  | BotCommandScopeChatMember

/**
 * Represents the scope of bot commands, covering all group and supergroup chat administrators.
 * @see https://tg-bot-sdk.website/api/types/bot-command-scope-all-chat-administrators/
 */
export interface BotCommandScopeAllChatAdministrators {
  type: "all_chat_administrators"
}

/**
 * Represents the scope of bot commands, covering all group and supergroup chats.
 * @see https://tg-bot-sdk.website/api/types/bot-command-scope-all-group-chats/
 */
export interface BotCommandScopeAllGroupChats {
  type: "all_group_chats"
}

/**
 * Represents the scope of bot commands, covering all private chats.
 * @see https://tg-bot-sdk.website/api/types/bot-command-scope-all-private-chats/
 */
export interface BotCommandScopeAllPrivateChats {
  type: "all_private_chats"
}

/**
 * Represents the scope of bot commands, covering a specific chat.
 * @see https://tg-bot-sdk.website/api/types/bot-command-scope-chat/
 */
export interface BotCommandScopeChat {
  type: "chat"
  chat_id: number | string
}

/**
 * Represents the scope of bot commands, covering all administrators of a specific group or supergroup chat.
 * @see https://tg-bot-sdk.website/api/types/bot-command-scope-chat-administrators/
 */
export interface BotCommandScopeChatAdministrators {
  type: "chat_administrators"
  chat_id: number | string
}

/**
 * Represents the scope of bot commands, covering a specific member of a group or supergroup chat.
 * @see https://tg-bot-sdk.website/api/types/bot-command-scope-chat-member/
 */
export interface BotCommandScopeChatMember {
  type: "chat_member"
  chat_id: number | string
  user_id: number
}

/**
 * Represents the default scope of bot commands
 * Default commands are used if no commands with a narrower scope are specified for the user.
 * @see https://tg-bot-sdk.website/api/types/bot-command-scope-default/
 */
export interface BotCommandScopeDefault {
  type: "default"
}

/**
 * This object represents the bot's description.
 * @see https://tg-bot-sdk.website/api/types/bot-description/
 */
export interface BotDescription {
  description: string
}

/**
 * This object represents the bot's name.
 * @see https://tg-bot-sdk.website/api/types/bot-name/
 */
export interface BotName {
  name: string
}

/**
 * This object represents the bot's short description.
 * @see https://tg-bot-sdk.website/api/types/bot-short-description/
 */
export interface BotShortDescription {
  short_description: string
}

/**
 * This object contains information about changes to a user payment subscription toward the current bot.
 * @see https://tg-bot-sdk.website/api/types/bot-subscription-updated/
 */
export interface BotSubscriptionUpdated {
  user: User
  invoice_payload: string
  state: "canceled" | "active" | "failed"
}

/**
 * Represents the rights of a business bot.
 * @see https://tg-bot-sdk.website/api/types/business-bot-rights/
 */
export interface BusinessBotRights {
  can_reply?: boolean
  can_read_messages?: boolean
  can_delete_sent_messages?: boolean
  can_delete_all_messages?: boolean
  can_edit_name?: boolean
  can_edit_bio?: boolean
  can_edit_profile_photo?: boolean
  can_edit_username?: boolean
  can_change_gift_settings?: boolean
  can_view_gifts_and_stars?: boolean
  can_convert_gifts_to_stars?: boolean
  can_transfer_and_upgrade_gifts?: boolean
  can_transfer_stars?: boolean
  can_manage_stories?: boolean
}

/**
 * Describes the connection of the bot with a business account.
 * @see https://tg-bot-sdk.website/api/types/business-connection/
 */
export interface BusinessConnection {
  id: string
  user: User
  user_chat_id: number
  date: number
  is_enabled: boolean
  rights?: BusinessBotRights
}

/**
 * Contains information about the start page settings of a Telegram Business account.
 * @see https://tg-bot-sdk.website/api/types/business-intro/
 */
export interface BusinessIntro {
  title?: string
  message?: string
  sticker?: Sticker
}

/**
 * Contains information about the location of a Telegram Business account.
 * @see https://tg-bot-sdk.website/api/types/business-location/
 */
export interface BusinessLocation {
  address: string
  location?: Location
}

/**
 * This object is received when messages are deleted from a connected business account.
 * @see https://tg-bot-sdk.website/api/types/business-messages-deleted/
 */
export interface BusinessMessagesDeleted {
  business_connection_id: string
  chat: Chat
  message_ids: number[]
}

/**
 * Describes the opening hours of a business.
 * @see https://tg-bot-sdk.website/api/types/business-opening-hours/
 */
export interface BusinessOpeningHours {
  time_zone_name: string
  opening_hours: BusinessOpeningHoursInterval[]
}

/**
 * Describes an interval of time during which a business is open.
 * @see https://tg-bot-sdk.website/api/types/business-opening-hours-interval/
 */
export interface BusinessOpeningHoursInterval {
  opening_minute: number
  closing_minute: number
}

/**
 * A placeholder, currently holds no information
 * Use BotFather to set up your game.
 * @see https://tg-bot-sdk.website/api/types/callback-game/
 */
export type CallbackGame = Record<string, never>

/**
 * This object represents an incoming callback query from a callback button in an inline keyboard
 * If the button that originated the query was attached to a message sent by the bot, the field message will be present
 * If the button was attached to a message sent via the bot (in inline mode), the field inline_message_id will be present
 * Exactly one of the fields data or game_short_name will be present.
 * @see https://tg-bot-sdk.website/api/types/callback-query/
 */
export interface CallbackQuery {
  id: string
  from: User
  chat_instance: string
  message?: MaybeInaccessibleMessage
  inline_message_id?: string
  data?: string
  game_short_name?: string
}

/**
 * This object represents a chat.
 * @see https://tg-bot-sdk.website/api/types/chat/
 */
export interface Chat {
  id: number
  type: "private" | "group" | "supergroup" | "channel"
  title?: string
  username?: string
  first_name?: string
  last_name?: string
  is_forum?: boolean
  is_direct_messages?: boolean
}

/**
 * Represents the rights of an administrator in a chat.
 * @see https://tg-bot-sdk.website/api/types/chat-administrator-rights/
 */
export interface ChatAdministratorRights {
  is_anonymous: boolean
  can_manage_chat: boolean
  can_delete_messages: boolean
  can_manage_video_chats: boolean
  can_restrict_members: boolean
  can_promote_members: boolean
  can_change_info: boolean
  can_invite_users: boolean
  can_post_stories: boolean
  can_edit_stories: boolean
  can_delete_stories: boolean
  can_send_welcome_messages: boolean
  can_post_messages?: boolean
  can_edit_messages?: boolean
  can_pin_messages?: boolean
  can_manage_topics?: boolean
  can_manage_direct_messages?: boolean
  can_manage_tags?: boolean
}

/**
 * This object represents a chat background.
 * @see https://tg-bot-sdk.website/api/types/chat-background/
 */
export interface ChatBackground {
  type: BackgroundType
}

/**
 * This object contains information about a chat boost.
 * @see https://tg-bot-sdk.website/api/types/chat-boost/
 */
export interface ChatBoost {
  boost_id: string
  add_date: number
  expiration_date: number
  source: ChatBoostSource
}

/**
 * This object represents a service message about a user boosting a chat.
 * @see https://tg-bot-sdk.website/api/types/chat-boost-added/
 */
export interface ChatBoostAdded {
  boost_count: number
}

/**
 * This object represents a boost removed from a chat.
 * @see https://tg-bot-sdk.website/api/types/chat-boost-removed/
 */
export interface ChatBoostRemoved {
  chat: Chat
  boost_id: string
  remove_date: number
  source: ChatBoostSource
}

/**
 * This object describes the source of a chat boost
 * It can be one of
 * @see https://tg-bot-sdk.website/api/types/chat-boost-source/
 */
export type ChatBoostSource =
  | ChatBoostSourcePremium
  | ChatBoostSourceGiftCode
  | ChatBoostSourceGiveaway

/**
 * The boost was obtained by the creation of Telegram Premium gift codes to boost a chat
 * Each such code boosts the chat 4 times for the duration of the corresponding Telegram Premium subscription.
 * @see https://tg-bot-sdk.website/api/types/chat-boost-source-gift-code/
 */
export interface ChatBoostSourceGiftCode {
  source: "gift_code"
  user: User
}

/**
 * The boost was obtained by the creation of a Telegram Premium or a Telegram Star giveaway
 * This boosts the chat 4 times for the duration of the corresponding Telegram Premium subscription for Telegram Premium giveaways and prize_star_count / 500 times for one year for Telegram Star giveaways.
 * @see https://tg-bot-sdk.website/api/types/chat-boost-source-giveaway/
 */
export interface ChatBoostSourceGiveaway {
  source: "giveaway"
  giveaway_message_id: number
  user?: User
  prize_star_count?: number
  is_unclaimed?: boolean
}

/**
 * The boost was obtained by subscribing to Telegram Premium or by gifting a Telegram Premium subscription to another user.
 * @see https://tg-bot-sdk.website/api/types/chat-boost-source-premium/
 */
export interface ChatBoostSourcePremium {
  source: "premium"
  user: User
}

/**
 * This object represents a boost added to a chat or changed.
 * @see https://tg-bot-sdk.website/api/types/chat-boost-updated/
 */
export interface ChatBoostUpdated {
  chat: Chat
  boost: ChatBoost
}

/**
 * This object contains full information about a chat.
 * @see https://tg-bot-sdk.website/api/types/chat-full-info/
 */
export interface ChatFullInfo {
  id: number
  type: "private" | "group" | "supergroup" | "channel"
  accent_color_id: number
  max_reaction_count: number
  accepted_gift_types: AcceptedGiftTypes
  title?: string
  username?: string
  first_name?: string
  last_name?: string
  is_forum?: boolean
  is_direct_messages?: boolean
  photo?: ChatPhoto
  active_usernames?: string[]
  birthdate?: Birthdate
  business_intro?: BusinessIntro
  business_location?: BusinessLocation
  business_opening_hours?: BusinessOpeningHours
  personal_chat?: Chat
  parent_chat?: Chat
  available_reactions?: ReactionType[]
  background_custom_emoji_id?: string
  profile_accent_color_id?: number
  profile_background_custom_emoji_id?: string
  emoji_status_custom_emoji_id?: string
  emoji_status_expiration_date?: number
  bio?: string
  has_private_forwards?: boolean
  has_restricted_voice_and_video_messages?: boolean
  join_to_send_messages?: boolean
  join_by_request?: boolean
  description?: string
  invite_link?: string
  pinned_message?: Message
  permissions?: ChatPermissions
  can_send_paid_media?: boolean
  slow_mode_delay?: number
  unrestrict_boost_count?: number
  message_auto_delete_time?: number
  has_aggressive_anti_spam_enabled?: boolean
  has_hidden_members?: boolean
  has_protected_content?: boolean
  has_visible_history?: boolean
  sticker_set_name?: string
  can_set_sticker_set?: boolean
  custom_emoji_sticker_set_name?: string
  linked_chat_id?: number
  location?: ChatLocation
  rating?: UserRating
  first_profile_audio?: Audio
  unique_gift_colors?: UniqueGiftColors
  paid_message_star_count?: number
  guard_bot?: User
  community?: Community
  ton_wallet_card?: TonWalletCard
  share_theme?: ChatShareTheme
}

/**
 * Represents an invite link for a chat.
 * @see https://tg-bot-sdk.website/api/types/chat-invite-link/
 */
export interface ChatInviteLink {
  invite_link: string
  creator: User
  creates_join_request: boolean
  is_primary: boolean
  is_revoked: boolean
  name?: string
  expire_date?: number
  member_limit?: number
  pending_join_request_count?: number
  subscription_period?: number
  subscription_price?: number
}

/**
 * Represents a join request sent to a chat.
 * @see https://tg-bot-sdk.website/api/types/chat-join-request/
 */
export interface ChatJoinRequest {
  chat: Chat
  from: User
  user_chat_id: number
  date: number
  bio?: string
  invite_link?: ChatInviteLink
  query_id?: string
}

/**
 * Represents a location to which a chat is connected.
 * @see https://tg-bot-sdk.website/api/types/chat-location/
 */
export interface ChatLocation {
  location: Location
  address: string
}

/**
 * This object contains information about one member of a chat
 * Currently, the following 6 types of chat members are supported:
 * @see https://tg-bot-sdk.website/api/types/chat-member/
 */
export type ChatMember =
  | ChatMemberOwner
  | ChatMemberAdministrator
  | ChatMemberMember
  | ChatMemberRestricted
  | ChatMemberLeft
  | ChatMemberBanned

/**
 * Represents a chat member that has some additional privileges.
 * @see https://tg-bot-sdk.website/api/types/chat-member-administrator/
 */
export interface ChatMemberAdministrator {
  status: "administrator"
  user: User
  can_be_edited: boolean
  is_anonymous: boolean
  can_manage_chat: boolean
  can_delete_messages: boolean
  can_manage_video_chats: boolean
  can_restrict_members: boolean
  can_promote_members: boolean
  can_change_info: boolean
  can_invite_users: boolean
  can_post_stories: boolean
  can_edit_stories: boolean
  can_delete_stories: boolean
  can_send_welcome_messages: boolean
  can_post_messages?: boolean
  can_edit_messages?: boolean
  can_pin_messages?: boolean
  can_manage_topics?: boolean
  can_manage_direct_messages?: boolean
  can_manage_tags?: boolean
  custom_title?: string
}

/**
 * Represents a chat member that was banned in the chat and can't return to the chat or view chat messages.
 * @see https://tg-bot-sdk.website/api/types/chat-member-banned/
 */
export interface ChatMemberBanned {
  status: "kicked"
  user: User
  until_date: number
}

/**
 * Represents a chat member that isn't currently a member of the chat, but may join it themselves.
 * @see https://tg-bot-sdk.website/api/types/chat-member-left/
 */
export interface ChatMemberLeft {
  status: "left"
  user: User
}

/**
 * Represents a chat member that has no additional privileges or restrictions.
 * @see https://tg-bot-sdk.website/api/types/chat-member-member/
 */
export interface ChatMemberMember {
  status: "member"
  user: User
  tag?: string
  until_date?: number
}

/**
 * Represents a chat member that owns the chat and has all administrator privileges.
 * @see https://tg-bot-sdk.website/api/types/chat-member-owner/
 */
export interface ChatMemberOwner {
  status: "creator"
  user: User
  is_anonymous: boolean
  custom_title?: string
}

/**
 * Represents a chat member that is under certain restrictions in the chat
 * Supergroups only.
 * @see https://tg-bot-sdk.website/api/types/chat-member-restricted/
 */
export interface ChatMemberRestricted {
  status: "restricted"
  user: User
  is_member: boolean
  can_send_messages: boolean
  can_send_audios: boolean
  can_send_documents: boolean
  can_send_photos: boolean
  can_send_videos: boolean
  can_send_video_notes: boolean
  can_send_voice_notes: boolean
  can_send_polls: boolean
  can_send_other_messages: boolean
  can_add_web_page_previews: boolean
  can_react_to_messages: boolean
  can_edit_tag: boolean
  can_change_info: boolean
  can_invite_users: boolean
  can_pin_messages: boolean
  can_manage_topics: boolean
  until_date: number
  tag?: string
}

/**
 * This object represents changes in the status of a chat member.
 * @see https://tg-bot-sdk.website/api/types/chat-member-updated/
 */
export interface ChatMemberUpdated {
  chat: Chat
  from: User
  date: number
  old_chat_member: ChatMember
  new_chat_member: ChatMember
  invite_link?: ChatInviteLink
  via_join_request?: boolean
  via_chat_folder_invite_link?: boolean
}

/**
 * Describes a service message about an ownership change in the chat.
 * @see https://tg-bot-sdk.website/api/types/chat-owner-changed/
 */
export interface ChatOwnerChanged {
  new_owner: User
}

/**
 * Describes a service message about the chat owner leaving the chat.
 * @see https://tg-bot-sdk.website/api/types/chat-owner-left/
 */
export interface ChatOwnerLeft {
  new_owner?: User
}

/**
 * Describes actions that a non-administrator user is allowed to take in a chat.
 * @see https://tg-bot-sdk.website/api/types/chat-permissions/
 */
export interface ChatPermissions {
  can_send_messages?: boolean
  can_send_audios?: boolean
  can_send_documents?: boolean
  can_send_photos?: boolean
  can_send_videos?: boolean
  can_send_video_notes?: boolean
  can_send_voice_notes?: boolean
  can_send_polls?: boolean
  can_send_other_messages?: boolean
  can_add_web_page_previews?: boolean
  can_react_to_messages?: boolean
  can_edit_tag?: boolean
  can_change_info?: boolean
  can_invite_users?: boolean
  can_pin_messages?: boolean
  can_manage_topics?: boolean
}

/**
 * This object represents a chat photo.
 * @see https://tg-bot-sdk.website/api/types/chat-photo/
 */
export interface ChatPhoto {
  small_file_id: string
  small_file_unique_id: string
  big_file_id: string
  big_file_unique_id: string
}

/**
 * This object contains information about a chat that was shared with the bot using a KeyboardButtonRequestChat button.
 * @see https://tg-bot-sdk.website/api/types/chat-shared/
 */
export interface ChatShared {
  request_id: number
  chat_id: number
  title?: string
  username?: string
  photo?: PhotoSize[]
}

/**
 * This object describes the theme of the screen for sharing a link to a user or a chat
 * Currently, it can be one of
 * @see https://tg-bot-sdk.website/api/types/chat-share-theme/
 */
export type ChatShareTheme = ChatShareThemeEmoji | ChatShareThemeUniqueGift

/**
 * This object describes a backdrop, which can be used as the background of a theme of the screen for sharing a link to a user or a chat.
 * @see https://tg-bot-sdk.website/api/types/chat-share-theme-backdrop/
 */
export interface ChatShareThemeBackdrop {
  id: number
  name: string
  colors: UniqueGiftBackdropColors
}

/**
 * This object contains a list of backdrops, which can be used as the background of a theme of the screen for sharing a link to a user or a chat.
 * @see https://tg-bot-sdk.website/api/types/chat-share-theme-backdrops/
 */
export interface ChatShareThemeBackdrops {
  backdrops: ChatShareThemeBackdrop[]
}

/**
 * The theme with emoji placed on a background.
 * @see https://tg-bot-sdk.website/api/types/chat-share-theme-emoji/
 */
export interface ChatShareThemeEmoji {
  type: "emoji"
  emojis: EmojiType[]
  background_backdrop_id?: number
}

/**
 * The theme based on a unique gift owned by the user or the chat.
 * @see https://tg-bot-sdk.website/api/types/chat-share-theme-unique-gift/
 */
export interface ChatShareThemeUniqueGift {
  type: "unique_gift"
  gift: UniqueGift
}

/**
 * Describes a checklist.
 * @see https://tg-bot-sdk.website/api/types/checklist/
 */
export interface Checklist {
  title: string
  tasks: ChecklistTask[]
  title_entities?: MessageEntity[]
  others_can_add_tasks?: boolean
  others_can_mark_tasks_as_done?: boolean
}

/**
 * Describes a task in a checklist.
 * @see https://tg-bot-sdk.website/api/types/checklist-task/
 */
export interface ChecklistTask {
  id: number
  text: string
  text_entities?: MessageEntity[]
  completed_by_user?: User
  completed_by_chat?: Chat
  completion_date?: number
}

/**
 * Describes a service message about tasks added to a checklist.
 * @see https://tg-bot-sdk.website/api/types/checklist-tasks-added/
 */
export interface ChecklistTasksAdded {
  tasks: ChecklistTask[]
  checklist_message?: Message
}

/**
 * Describes a service message about checklist tasks marked as done or not done.
 * @see https://tg-bot-sdk.website/api/types/checklist-tasks-done/
 */
export interface ChecklistTasksDone {
  checklist_message?: Message
  marked_as_done_task_ids?: number[]
  marked_as_not_done_task_ids?: number[]
}

/**
 * Represents a result of an inline query that was chosen by the user and sent to their chat partner.
 * @see https://tg-bot-sdk.website/api/types/chosen-inline-result/
 */
export interface ChosenInlineResult {
  result_id: string
  from: User
  query: string
  location?: Location
  inline_message_id?: string
}

/**
 * Represents a community (a group of chats).
 * @see https://tg-bot-sdk.website/api/types/community/
 */
export interface Community {
  id: number
  name: string
}

/**
 * Describes a service message about a chat or a bot being added to a community.
 * @see https://tg-bot-sdk.website/api/types/community-chat-added/
 */
export interface CommunityChatAdded {
  community: Community
}

/**
 * Describes a service message about a chat being joined by a user from a community.
 * @see https://tg-bot-sdk.website/api/types/community-chat-joined/
 */
export interface CommunityChatJoined {
  community: Community
}

/**
 * Describes a service message about a chat or a bot being removed from a community
 * Currently holds no information.
 * @see https://tg-bot-sdk.website/api/types/community-chat-removed/
 */
export type CommunityChatRemoved = Record<string, never>

/**
 * This object represents a phone contact.
 * @see https://tg-bot-sdk.website/api/types/contact/
 */
export interface Contact {
  phone_number: string
  first_name: string
  last_name?: string
  user_id?: number
  vcard?: string
}

/**
 * This object represents an inline keyboard button that copies specified text to the clipboard.
 * @see https://tg-bot-sdk.website/api/types/copy-text-button/
 */
export interface CopyTextButton {
  text: string
}

/**
 * This object represents an animated emoji that displays a random value.
 * @see https://tg-bot-sdk.website/api/types/dice/
 */
export interface Dice {
  emoji: string
  value: number
}

/**
 * Describes a service message about a change in the price of direct messages sent to a channel chat.
 * @see https://tg-bot-sdk.website/api/types/direct-message-price-changed/
 */
export interface DirectMessagePriceChanged {
  are_direct_messages_enabled: boolean
  direct_message_star_count?: number
}

/**
 * Describes a topic of a direct messages chat.
 * @see https://tg-bot-sdk.website/api/types/direct-messages-topic/
 */
export interface DirectMessagesTopic {
  topic_id: number
  user?: User
}

/**
 * This object represents a disabled button which does nothing
 * Currently holds no information.
 * @see https://tg-bot-sdk.website/api/types/disabled-button/
 */
export type DisabledButton = Record<string, never>

/**
 * This object represents a general file (as opposed to photos, voice messages and audio files).
 * @see https://tg-bot-sdk.website/api/types/document/
 */
export interface Document {
  file_id: string
  file_unique_id: string
  thumbnail?: PhotoSize
  file_name?: string
  mime_type?: string
  file_size?: number
}

/**
 * This object describes an emoji
 * Currently, it can be one of
 * @see https://tg-bot-sdk.website/api/types/emoji-type/
 */
export type EmojiType = EmojiTypeEmoji | EmojiTypeCustomEmoji

/**
 * A custom emoji.
 * @see https://tg-bot-sdk.website/api/types/emoji-type-custom-emoji/
 */
export interface EmojiTypeCustomEmoji {
  type: "custom_emoji"
  custom_emoji_id: string
}

/**
 * A regular emoji.
 * @see https://tg-bot-sdk.website/api/types/emoji-type-emoji/
 */
export interface EmojiTypeEmoji {
  type: "emoji"
  emoji: string
}

/**
 * Describes data required for decrypting and authenticating EncryptedPassportElement
 * See the Telegram Passport Documentation for a complete description of the data decryption and authentication processes.
 * @see https://tg-bot-sdk.website/api/types/encrypted-credentials/
 */
export interface EncryptedCredentials {
  data: string
  hash: string
  secret: string
}

/**
 * Describes documents or other Telegram Passport elements shared with the bot by the user.
 * @see https://tg-bot-sdk.website/api/types/encrypted-passport-element/
 */
export interface EncryptedPassportElement {
  type:
    | "personal_details"
    | "passport"
    | "driver_license"
    | "identity_card"
    | "internal_passport"
    | "address"
    | "utility_bill"
    | "bank_statement"
    | "rental_agreement"
    | "passport_registration"
    | "temporary_registration"
    | "phone_number"
    | "email"
  hash: string
  data?: string
  phone_number?: string
  email?: string
  files?: PassportFile[]
  front_side?: PassportFile
  reverse_side?: PassportFile
  selfie?: PassportFile
  translation?: PassportFile[]
}

/**
 * @see https://tg-bot-sdk.website/api/types/ephemeral-message-parameters/
 */
export interface EphemeralMessageParameters {
  receiver_user_id?: number
  callback_query_id?: string
  replace_callback_query_message?: boolean
}

/**
 * This object contains information about a message that is being replied to, which may come from another chat or forum topic.
 * @see https://tg-bot-sdk.website/api/types/external-reply-info/
 */
export interface ExternalReplyInfo {
  origin: MessageOrigin
  chat?: Chat
  message_id?: number
  link_preview_options?: LinkPreviewOptions
  animation?: Animation
  audio?: Audio
  document?: Document
  live_photo?: LivePhoto
  paid_media?: PaidMediaInfo
  photo?: PhotoSize[]
  sticker?: Sticker
  story?: Story
  video?: Video
  video_note?: VideoNote
  voice?: Voice
  widget?: Widget
  has_media_spoiler?: boolean
  checklist?: Checklist
  contact?: Contact
  dice?: Dice
  game?: Game
  giveaway?: Giveaway
  giveaway_winners?: GiveawayWinners
  invoice?: Invoice
  location?: Location
  poll?: Poll
  venue?: Venue
}

/**
 * This object represents a file ready to be downloaded
 * The file can be downloaded via the link https://api.telegram.org/file/bot<token>/<file_path>
 * It is guaranteed that the link will be valid for at least 1 hour
 * When the link expires, a new one can be requested by calling getFile.
 * The maximum file size to download is 20 MB
 * @see https://tg-bot-sdk.website/api/types/file/
 */
export interface File {
  file_id: string
  file_unique_id: string
  file_size?: number
  file_path?: string
}

/**
 * Upon receiving a message with this object, Telegram clients will display a reply interface to the user (act as if the user has selected the bot's message and tapped 'Reply')
 * This can be extremely useful if you want to create user-friendly step-by-step interfaces without having to sacrifice privacy mode
 * Not supported in channels and for messages sent on behalf of a user account.
 * @see https://tg-bot-sdk.website/api/types/force-reply/
 */
export interface ForceReply {
  force_reply: boolean
  input_field_placeholder?: string
  selective?: boolean
}

/**
 * This object represents a forum topic.
 * @see https://tg-bot-sdk.website/api/types/forum-topic/
 */
export interface ForumTopic {
  message_thread_id: number
  name: string
  icon_color: number
  icon_custom_emoji_id?: string
  is_name_implicit?: boolean
}

/**
 * This object represents a service message about a forum topic closed in the chat
 * Currently holds no information.
 * @see https://tg-bot-sdk.website/api/types/forum-topic-closed/
 */
export type ForumTopicClosed = Record<string, never>

/**
 * This object represents a service message about a new forum topic created in the chat.
 * @see https://tg-bot-sdk.website/api/types/forum-topic-created/
 */
export interface ForumTopicCreated {
  name: string
  icon_color: number
  icon_custom_emoji_id?: string
  is_name_implicit?: boolean
}

/**
 * This object represents a service message about an edited forum topic.
 * @see https://tg-bot-sdk.website/api/types/forum-topic-edited/
 */
export interface ForumTopicEdited {
  name?: string
  icon_custom_emoji_id?: string
}

/**
 * This object represents a service message about a forum topic reopened in the chat
 * Currently holds no information.
 * @see https://tg-bot-sdk.website/api/types/forum-topic-reopened/
 */
export type ForumTopicReopened = Record<string, never>

/**
 * This object represents a game
 * Use BotFather to create and edit games, their short names will act as unique identifiers.
 * @see https://tg-bot-sdk.website/api/types/game/
 */
export interface Game {
  title: string
  description: string
  photo: PhotoSize[]
  text?: string
  text_entities?: MessageEntity[]
  animation?: Animation
}

/**
 * This object represents one row of the high scores table for a game.
 * @see https://tg-bot-sdk.website/api/types/game-high-score/
 */
export interface GameHighScore {
  position: number
  user: User
  score: number
}

/**
 * This object represents a service message about General forum topic hidden in the chat
 * Currently holds no information.
 * @see https://tg-bot-sdk.website/api/types/general-forum-topic-hidden/
 */
export type GeneralForumTopicHidden = Record<string, never>

/**
 * This object represents a service message about General forum topic unhidden in the chat
 * Currently holds no information.
 * @see https://tg-bot-sdk.website/api/types/general-forum-topic-unhidden/
 */
export type GeneralForumTopicUnhidden = Record<string, never>

/**
 * This object represents a gift that can be sent by the bot.
 * @see https://tg-bot-sdk.website/api/types/gift/
 */
export interface Gift {
  id: string
  sticker: Sticker
  star_count: number
  upgrade_star_count?: number
  is_premium?: boolean
  has_colors?: boolean
  total_count?: number
  remaining_count?: number
  personal_total_count?: number
  personal_remaining_count?: number
  background?: GiftBackground
  unique_gift_variant_count?: number
  publisher_chat?: Chat
}

/**
 * This object describes the background of a gift.
 * @see https://tg-bot-sdk.website/api/types/gift-background/
 */
export interface GiftBackground {
  center_color: number
  edge_color: number
  text_color: number
}

/**
 * Describes a service message about a regular gift that was sent or received.
 * @see https://tg-bot-sdk.website/api/types/gift-info/
 */
export interface GiftInfo {
  gift: Gift
  owned_gift_id?: string
  convert_star_count?: number
  prepaid_upgrade_star_count?: number
  is_upgrade_separate?: boolean
  can_be_upgraded?: boolean
  text?: string
  entities?: MessageEntity[]
  is_private?: boolean
  unique_gift_number?: number
}

/**
 * This object represent a list of gifts.
 * @see https://tg-bot-sdk.website/api/types/gifts/
 */
export interface Gifts {
  gifts: Gift[]
}

/**
 * This object represents a message about a scheduled giveaway.
 * @see https://tg-bot-sdk.website/api/types/giveaway/
 */
export interface Giveaway {
  chats: Chat[]
  winners_selection_date: number
  winner_count: number
  only_new_members?: boolean
  has_public_winners?: boolean
  prize_description?: string
  country_codes?: string[]
  prize_star_count?: number
  premium_subscription_month_count?: number
}

/**
 * This object represents a service message about the completion of a giveaway without public winners.
 * @see https://tg-bot-sdk.website/api/types/giveaway-completed/
 */
export interface GiveawayCompleted {
  winner_count: number
  unclaimed_prize_count?: number
  giveaway_message?: Message
  is_star_giveaway?: boolean
}

/**
 * This object represents a service message about the creation of a scheduled giveaway.
 * @see https://tg-bot-sdk.website/api/types/giveaway-created/
 */
export interface GiveawayCreated {
  prize_star_count?: number
}

/**
 * This object represents a message about the completion of a giveaway with public winners.
 * @see https://tg-bot-sdk.website/api/types/giveaway-winners/
 */
export interface GiveawayWinners {
  chat: Chat
  giveaway_message_id: number
  winners_selection_date: number
  winner_count: number
  winners: User[]
  additional_chat_count?: number
  prize_star_count?: number
  premium_subscription_month_count?: number
  unclaimed_prize_count?: number
  only_new_members?: boolean
  was_refunded?: boolean
  prize_description?: string
}

/**
 * This object describes a message that was deleted or is otherwise inaccessible to the bot.
 * @see https://tg-bot-sdk.website/api/types/inaccessible-message/
 */
export interface InaccessibleMessage {
  chat: Chat
  message_id: number
  date: number
}

/**
 * This object represents one button of an inline keyboard
 * Exactly one of the fields other than text, icon_custom_emoji_id, and style must be used to specify the type of the button.
 * @see https://tg-bot-sdk.website/api/types/inline-keyboard-button/
 */
export interface InlineKeyboardButton {
  text: string
  icon_custom_emoji_id?: string
  style?: "danger" | "success" | "primary"
  url?: string
  callback_data?: string
  web_app?: WebAppInfo
  login_url?: LoginUrl
  switch_inline_query?: string
  switch_inline_query_current_chat?: string
  switch_inline_query_chosen_chat?: SwitchInlineQueryChosenChat
  copy_text?: CopyTextButton
  callback_game?: CallbackGame
  pay?: boolean
  disabled?: DisabledButton
}

/**
 * This object represents an inline keyboard that appears right next to the message it belongs to.
 * @see https://tg-bot-sdk.website/api/types/inline-keyboard-markup/
 */
export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][]
  force_reply?: boolean
}

/**
 * This object represents an incoming inline query
 * When the user sends an empty query, your bot could return some default or trending results.
 * @see https://tg-bot-sdk.website/api/types/inline-query/
 */
export interface InlineQuery {
  id: string
  from: User
  query: string
  offset: string
  chat_type?: "sender" | "private" | "group" | "supergroup" | "channel"
  location?: Location
}

/**
 * This object represents one result of an inline query
 * Telegram clients currently support results of the following 20 types:
 * @see https://tg-bot-sdk.website/api/types/inline-query-result/
 */
export type InlineQueryResult =
  | InlineQueryResultCachedAudio
  | InlineQueryResultCachedDocument
  | InlineQueryResultCachedGif
  | InlineQueryResultCachedMpeg4Gif
  | InlineQueryResultCachedPhoto
  | InlineQueryResultCachedSticker
  | InlineQueryResultCachedVideo
  | InlineQueryResultCachedVoice
  | InlineQueryResultArticle
  | InlineQueryResultAudio
  | InlineQueryResultContact
  | InlineQueryResultGame
  | InlineQueryResultDocument
  | InlineQueryResultGif
  | InlineQueryResultLocation
  | InlineQueryResultMpeg4Gif
  | InlineQueryResultPhoto
  | InlineQueryResultVenue
  | InlineQueryResultVideo
  | InlineQueryResultVoice

/**
 * Represents a link to an article or web page.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-article/
 */
export interface InlineQueryResultArticle {
  type: "article"
  id: string
  title: string
  input_message_content: InputMessageContent
  reply_markup?: InlineKeyboardMarkup
  url?: string
  description?: string
  thumbnail_url?: string
  thumbnail_width?: number
  thumbnail_height?: number
}

/**
 * Represents a link to an MP3 audio file
 * By default, this audio file will be sent by the user
 * Alternatively, you can use input_message_content to send a message with the specified content instead of the audio.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-audio/
 */
export interface InlineQueryResultAudio {
  type: "audio"
  id: string
  audio_url: string
  title: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  performer?: string
  audio_duration?: number
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
}

/**
 * Represents a link to an MP3 audio file stored on the Telegram servers
 * By default, this audio file will be sent by the user
 * Alternatively, you can use input_message_content to send a message with the specified content instead of the audio.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-cached-audio/
 */
export interface InlineQueryResultCachedAudio {
  type: "audio"
  id: string
  audio_file_id: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
}

/**
 * Represents a link to a file stored on the Telegram servers
 * By default, this file will be sent by the user with an optional caption
 * Alternatively, you can use input_message_content to send a message with the specified content instead of the file.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-cached-document/
 */
export interface InlineQueryResultCachedDocument {
  type: "document"
  id: string
  title: string
  document_file_id: string
  description?: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
}

/**
 * Represents a link to an animated GIF file stored on the Telegram servers
 * By default, this animated GIF file will be sent by the user with an optional caption
 * Alternatively, you can use input_message_content to send a message with specified content instead of the animation.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-cached-gif/
 */
export interface InlineQueryResultCachedGif {
  type: "gif"
  id: string
  gif_file_id: string
  title?: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  show_caption_above_media?: boolean
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
}

/**
 * Represents a link to a video animation (H.264/MPEG-4 AVC video without sound) stored on the Telegram servers
 * By default, this animated MPEG-4 file will be sent by the user with an optional caption
 * Alternatively, you can use input_message_content to send a message with the specified content instead of the animation.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-cached-mpeg4-gif/
 */
export interface InlineQueryResultCachedMpeg4Gif {
  type: "mpeg4_gif"
  id: string
  mpeg4_file_id: string
  title?: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  show_caption_above_media?: boolean
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
}

/**
 * Represents a link to a photo stored on the Telegram servers
 * By default, this photo will be sent by the user with an optional caption
 * Alternatively, you can use input_message_content to send a message with the specified content instead of the photo.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-cached-photo/
 */
export interface InlineQueryResultCachedPhoto {
  type: "photo"
  id: string
  photo_file_id: string
  title?: string
  description?: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  show_caption_above_media?: boolean
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
}

/**
 * Represents a link to a sticker stored on the Telegram servers
 * By default, this sticker will be sent by the user
 * Alternatively, you can use input_message_content to send a message with the specified content instead of the sticker.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-cached-sticker/
 */
export interface InlineQueryResultCachedSticker {
  type: "sticker"
  id: string
  sticker_file_id: string
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
}

/**
 * Represents a link to a video file stored on the Telegram servers
 * By default, this video file will be sent by the user with an optional caption
 * Alternatively, you can use input_message_content to send a message with the specified content instead of the video.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-cached-video/
 */
export interface InlineQueryResultCachedVideo {
  type: "video"
  id: string
  video_file_id: string
  title: string
  description?: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  show_caption_above_media?: boolean
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
}

/**
 * Represents a link to a voice message stored on the Telegram servers
 * By default, this voice message will be sent by the user
 * Alternatively, you can use input_message_content to send a message with the specified content instead of the voice message.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-cached-voice/
 */
export interface InlineQueryResultCachedVoice {
  type: "voice"
  id: string
  voice_file_id: string
  title: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
}

/**
 * Represents a contact with a phone number
 * By default, this contact will be sent by the user
 * Alternatively, you can use input_message_content to send a message with the specified content instead of the contact.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-contact/
 */
export interface InlineQueryResultContact {
  type: "contact"
  id: string
  phone_number: string
  first_name: string
  last_name?: string
  vcard?: string
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
  thumbnail_url?: string
  thumbnail_width?: number
  thumbnail_height?: number
}

/**
 * Represents a link to a file
 * By default, this file will be sent by the user with an optional caption
 * Alternatively, you can use input_message_content to send a message with the specified content instead of the file
 * Currently, only .PDF and .ZIP files can be sent using this method.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-document/
 */
export interface InlineQueryResultDocument {
  type: "document"
  id: string
  title: string
  document_url: string
  mime_type: "application/pdf" | "application/zip"
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  description?: string
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
  thumbnail_url?: string
  thumbnail_width?: number
  thumbnail_height?: number
}

/**
 * Represents a Game.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-game/
 */
export interface InlineQueryResultGame {
  type: "game"
  id: string
  game_short_name: string
  reply_markup?: InlineKeyboardMarkup
}

/**
 * Represents a link to an animated GIF file
 * By default, this animated GIF file will be sent by the user with optional caption
 * Alternatively, you can use input_message_content to send a message with the specified content instead of the animation.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-gif/
 */
export interface InlineQueryResultGif {
  type: "gif"
  id: string
  gif_url: string
  thumbnail_url: string
  gif_width?: number
  gif_height?: number
  gif_duration?: number
  thumbnail_mime_type?: "image/jpeg" | "image/gif" | "video/mp4"
  title?: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  show_caption_above_media?: boolean
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
}

/**
 * Represents a location on a map
 * By default, the location will be sent by the user
 * Alternatively, you can use input_message_content to send a message with the specified content instead of the location.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-location/
 */
export interface InlineQueryResultLocation {
  type: "location"
  id: string
  latitude: number
  longitude: number
  title: string
  horizontal_accuracy?: number
  live_period?: number
  heading?: number
  proximity_alert_radius?: number
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
  thumbnail_url?: string
  thumbnail_width?: number
  thumbnail_height?: number
}

/**
 * Represents a link to a video animation (H.264/MPEG-4 AVC video without sound)
 * By default, this animated MPEG-4 file will be sent by the user with optional caption
 * Alternatively, you can use input_message_content to send a message with the specified content instead of the animation.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-mpeg4-gif/
 */
export interface InlineQueryResultMpeg4Gif {
  type: "mpeg4_gif"
  id: string
  mpeg4_url: string
  thumbnail_url: string
  mpeg4_width?: number
  mpeg4_height?: number
  mpeg4_duration?: number
  thumbnail_mime_type?: "image/jpeg" | "image/gif" | "video/mp4"
  title?: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  show_caption_above_media?: boolean
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
}

/**
 * Represents a link to a photo
 * By default, this photo will be sent by the user with optional caption
 * Alternatively, you can use input_message_content to send a message with the specified content instead of the photo.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-photo/
 */
export interface InlineQueryResultPhoto {
  type: "photo"
  id: string
  photo_url: string
  thumbnail_url: string
  photo_width?: number
  photo_height?: number
  title?: string
  description?: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  show_caption_above_media?: boolean
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
}

/**
 * This object represents a button to be shown above inline query results
 * You must use exactly one of the optional fields.
 * @see https://tg-bot-sdk.website/api/types/inline-query-results-button/
 */
export interface InlineQueryResultsButton {
  text: string
  web_app?: WebAppInfo
  start_parameter?: string
}

/**
 * Represents a venue
 * By default, the venue will be sent by the user
 * Alternatively, you can use input_message_content to send a message with the specified content instead of the venue.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-venue/
 */
export interface InlineQueryResultVenue {
  type: "venue"
  id: string
  latitude: number
  longitude: number
  title: string
  address: string
  foursquare_id?: string
  foursquare_type?: string
  google_place_id?: string
  google_place_type?: string
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
  thumbnail_url?: string
  thumbnail_width?: number
  thumbnail_height?: number
}

/**
 * Represents a link to a page containing an embedded video player or a video file
 * By default, this video file will be sent by the user with an optional caption
 * Alternatively, you can use input_message_content to send a message with the specified content instead of the video.
 * If an InlineQueryResultVideo message contains an embedded video (e.g., YouTube), you must replace its content using input_message_content.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-video/
 */
export interface InlineQueryResultVideo {
  type: "video"
  id: string
  video_url: string
  mime_type: string
  thumbnail_url: string
  title: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  show_caption_above_media?: boolean
  video_width?: number
  video_height?: number
  video_duration?: number
  description?: string
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
}

/**
 * Represents a link to a voice recording in an .OGG container encoded with OPUS
 * By default, this voice recording will be sent by the user
 * Alternatively, you can use input_message_content to send a message with the specified content instead of the the voice message.
 * @see https://tg-bot-sdk.website/api/types/inline-query-result-voice/
 */
export interface InlineQueryResultVoice {
  type: "voice"
  id: string
  voice_url: string
  title: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  voice_duration?: number
  reply_markup?: InlineKeyboardMarkup
  input_message_content?: InputMessageContent
}

/**
 * Describes a checklist to create.
 * @see https://tg-bot-sdk.website/api/types/input-checklist/
 */
export interface InputChecklist {
  title: string
  tasks: InputChecklistTask[]
  parse_mode?: "HTML" | "MarkdownV2"
  title_entities?: MessageEntity[]
  others_can_add_tasks?: boolean
  others_can_mark_tasks_as_done?: boolean
}

/**
 * Describes a task to add to a checklist.
 * @see https://tg-bot-sdk.website/api/types/input-checklist-task/
 */
export interface InputChecklistTask {
  id: number
  text: string
  parse_mode?: "HTML" | "MarkdownV2"
  text_entities?: MessageEntity[]
}

/**
 * Represents the content of a contact message to be sent as the result of an inline query.
 * @see https://tg-bot-sdk.website/api/types/input-contact-message-content/
 */
export interface InputContactMessageContent {
  phone_number: string
  first_name: string
  last_name?: string
  vcard?: string
}

/**
 * This object represents the contents of a file to be uploaded
 * Must be posted using multipart/form-data in the usual way that files are uploaded via the browser.
 * @see https://tg-bot-sdk.website/api/types/input-file/
 */
export type InputFile = { file_content: Uint8Array; file_name: string } | Blob

/**
 * Represents the content of an invoice message to be sent as the result of an inline query.
 * @see https://tg-bot-sdk.website/api/types/input-invoice-message-content/
 */
export interface InputInvoiceMessageContent {
  title: string
  description: string
  payload: string
  currency: string
  prices: LabeledPrice[]
  provider_token?: string
  max_tip_amount?: number
  suggested_tip_amounts?: number[]
  provider_data?: string
  photo_url?: string
  photo_size?: number
  photo_width?: number
  photo_height?: number
  need_name?: boolean
  need_phone_number?: boolean
  need_email?: boolean
  need_shipping_address?: boolean
  send_phone_number_to_provider?: boolean
  send_email_to_provider?: boolean
  is_flexible?: boolean
}

/**
 * Represents the content of a location message to be sent as the result of an inline query.
 * @see https://tg-bot-sdk.website/api/types/input-location-message-content/
 */
export interface InputLocationMessageContent {
  latitude: number
  longitude: number
  horizontal_accuracy?: number
  live_period?: number
  heading?: number
  proximity_alert_radius?: number
}

/**
 * This object represents the content of a media message to be sent
 * It should be one of
 * @see https://tg-bot-sdk.website/api/types/input-media/
 */
export type InputMedia =
  | InputMediaAnimation
  | InputMediaAudio
  | InputMediaDocument
  | InputMediaLivePhoto
  | InputMediaPhoto
  | InputMediaVideo

/**
 * Represents an animation file (GIF or H.264/MPEG-4 AVC video without sound) to be sent.
 * @see https://tg-bot-sdk.website/api/types/input-media-animation/
 */
export interface InputMediaAnimation {
  type: "animation"
  media: string
  thumbnail?: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  show_caption_above_media?: boolean
  width?: number
  height?: number
  duration?: number
  has_spoiler?: boolean
}

/**
 * Represents an audio file to be treated as music to be sent.
 * @see https://tg-bot-sdk.website/api/types/input-media-audio/
 */
export interface InputMediaAudio {
  type: "audio"
  media: string
  thumbnail?: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  duration?: number
  performer?: string
  title?: string
}

/**
 * Represents a general file to be sent.
 * @see https://tg-bot-sdk.website/api/types/input-media-document/
 */
export interface InputMediaDocument {
  type: "document"
  media: string
  thumbnail?: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  disable_content_type_detection?: boolean
}

/**
 * Represents an HTTP link to be sent.
 * @see https://tg-bot-sdk.website/api/types/input-media-link/
 */
export interface InputMediaLink {
  type: "link"
  url: string
}

/**
 * Represents a live photo to be sent.
 * @see https://tg-bot-sdk.website/api/types/input-media-live-photo/
 */
export interface InputMediaLivePhoto {
  type: "live_photo"
  media: string
  photo: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  show_caption_above_media?: boolean
  has_spoiler?: boolean
}

/**
 * Represents a location to be sent.
 * @see https://tg-bot-sdk.website/api/types/input-media-location/
 */
export interface InputMediaLocation {
  type: "location"
  latitude: number
  longitude: number
  horizontal_accuracy?: number
}

/**
 * Represents a photo to be sent.
 * @see https://tg-bot-sdk.website/api/types/input-media-photo/
 */
export interface InputMediaPhoto {
  type: "photo"
  media: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  show_caption_above_media?: boolean
  has_spoiler?: boolean
}

/**
 * Represents a sticker file to be sent.
 * @see https://tg-bot-sdk.website/api/types/input-media-sticker/
 */
export interface InputMediaSticker {
  type: "sticker"
  media: string
  emoji?: string
}

/**
 * Represents a venue to be sent.
 * @see https://tg-bot-sdk.website/api/types/input-media-venue/
 */
export interface InputMediaVenue {
  type: "venue"
  latitude: number
  longitude: number
  title: string
  address: string
  foursquare_id?: string
  foursquare_type?: string
  google_place_id?: string
  google_place_type?: string
}

/**
 * Represents a video to be sent.
 * @see https://tg-bot-sdk.website/api/types/input-media-video/
 */
export interface InputMediaVideo {
  type: "video"
  media: string
  thumbnail?: string
  cover?: string
  start_timestamp?: number
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  show_caption_above_media?: boolean
  width?: number
  height?: number
  duration?: number
  supports_streaming?: boolean
  has_spoiler?: boolean
}

/**
 * Represents a voice message file to be sent.
 * @see https://tg-bot-sdk.website/api/types/input-media-voice-note/
 */
export interface InputMediaVoiceNote {
  type: "voice_note"
  media: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  duration?: number
}

/**
 * This object represents the content of a message to be sent as a result of an inline query
 * Telegram clients currently support the following types:
 * @see https://tg-bot-sdk.website/api/types/input-message-content/
 */
export type InputMessageContent =
  | InputTextMessageContent
  | InputRichMessageContent
  | InputLocationMessageContent
  | InputVenueMessageContent
  | InputContactMessageContent
  | InputInvoiceMessageContent
  | InputWidgetMessageContent
  | InputSharedWidgetMessageContent

/**
 * This object describes the paid media to be sent
 * Currently, it can be one of
 * @see https://tg-bot-sdk.website/api/types/input-paid-media/
 */
export type InputPaidMedia = InputPaidMediaLivePhoto | InputPaidMediaPhoto | InputPaidMediaVideo

/**
 * The paid media to send is a live photo.
 * @see https://tg-bot-sdk.website/api/types/input-paid-media-live-photo/
 */
export interface InputPaidMediaLivePhoto {
  type: "live_photo"
  media: string
  photo: string
}

/**
 * The paid media to send is a photo.
 * @see https://tg-bot-sdk.website/api/types/input-paid-media-photo/
 */
export interface InputPaidMediaPhoto {
  type: "photo"
  media: string
}

/**
 * The paid media to send is a video.
 * @see https://tg-bot-sdk.website/api/types/input-paid-media-video/
 */
export interface InputPaidMediaVideo {
  type: "video"
  media: string
  thumbnail?: string
  cover?: string
  start_timestamp?: number
  width?: number
  height?: number
  duration?: number
  supports_streaming?: boolean
}

/**
 * This object represents the content of a poll description or a quiz explanation to be sent
 * It should be one of
 * @see https://tg-bot-sdk.website/api/types/input-poll-media/
 */
export type InputPollMedia =
  | InputMediaAnimation
  | InputMediaAudio
  | InputMediaDocument
  | InputMediaLivePhoto
  | InputMediaLocation
  | InputMediaPhoto
  | InputMediaVenue
  | InputMediaVideo

/**
 * This object contains information about one answer option in a poll to be sent.
 * @see https://tg-bot-sdk.website/api/types/input-poll-option/
 */
export interface InputPollOption {
  text: string
  text_parse_mode?: "HTML" | "MarkdownV2"
  text_entities?: MessageEntity[]
  media?: InputPollOptionMedia
}

/**
 * This object represents the content of a poll option to be sent
 * It should be one of
 * @see https://tg-bot-sdk.website/api/types/input-poll-option-media/
 */
export type InputPollOptionMedia =
  | InputMediaAnimation
  | InputMediaLink
  | InputMediaLivePhoto
  | InputMediaLocation
  | InputMediaPhoto
  | InputMediaSticker
  | InputMediaVenue
  | InputMediaVideo

/**
 * This object describes a profile photo to set
 * Currently, it can be one of
 * @see https://tg-bot-sdk.website/api/types/input-profile-photo/
 */
export type InputProfilePhoto = InputProfilePhotoStatic | InputProfilePhotoAnimated

/**
 * An animated profile photo in the MPEG4 format.
 * @see https://tg-bot-sdk.website/api/types/input-profile-photo-animated/
 */
export interface InputProfilePhotoAnimated {
  type: "animated"
  animation: string
  main_frame_timestamp?: number
}

/**
 * A static profile photo in the .JPG format.
 * @see https://tg-bot-sdk.website/api/types/input-profile-photo-static/
 */
export interface InputProfilePhotoStatic {
  type: "static"
  photo: string
}

/**
 * This object represents a block in a rich formatted message to be sent
 * Currently, it can be any of the following types:
 * @see https://tg-bot-sdk.website/api/types/input-rich-block/
 */
export type InputRichBlock =
  | InputRichBlockParagraph
  | InputRichBlockSectionHeading
  | InputRichBlockPreformatted
  | InputRichBlockFooter
  | InputRichBlockDivider
  | InputRichBlockMathematicalExpression
  | InputRichBlockAnchor
  | InputRichBlockList
  | InputRichBlockBlockQuotation
  | InputRichBlockExpandableBlockQuotation
  | InputRichBlockPullQuotation
  | InputRichBlockCollage
  | InputRichBlockSlideshow
  | InputRichBlockTable
  | InputRichBlockDetails
  | InputRichBlockMap
  | InputRichBlockButtons
  | InputRichBlockAnimation
  | InputRichBlockAudio
  | InputRichBlockDocument
  | InputRichBlockPhoto
  | InputRichBlockVideo
  | InputRichBlockVoiceNote
  | InputRichBlockThinking

/**
 * A block with an anchor, corresponding to the HTML tag <a> with the attribute name.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-anchor/
 */
export interface InputRichBlockAnchor {
  type: "anchor"
  name: string
}

/**
 * A block with an animation, corresponding to the HTML tag <video>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-animation/
 */
export interface InputRichBlockAnimation {
  type: "animation"
  animation: InputMediaAnimation
  caption?: RichBlockCaption
}

/**
 * A block with a music file, corresponding to the HTML tag <audio>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-audio/
 */
export interface InputRichBlockAudio {
  type: "audio"
  audio: InputMediaAudio
  caption?: RichBlockCaption
}

/**
 * A block quotation, corresponding to the HTML tag <blockquote>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-block-quotation/
 */
export interface InputRichBlockBlockQuotation {
  type: "blockquote"
  blocks: InputRichBlock[]
  credit?: RichText
}

/**
 * A block containing a list of buttons that are shown in one row, corresponding to the custom HTML tag <tg-button-row>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-buttons/
 */
export interface InputRichBlockButtons {
  type: "buttons"
  buttons: RichMessageButton[]
  align?: "left" | "center" | "right"
}

/**
 * A collage, corresponding to the custom HTML tag <tg-collage>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-collage/
 */
export interface InputRichBlockCollage {
  type: "collage"
  blocks: InputRichBlock[]
  caption?: RichBlockCaption
}

/**
 * An expandable block for details disclosure, corresponding to the HTML tag <details>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-details/
 */
export interface InputRichBlockDetails {
  type: "details"
  summary: RichText
  blocks: InputRichBlock[]
  is_open?: boolean
}

/**
 * A divider, corresponding to the HTML tag <hr/>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-divider/
 */
export interface InputRichBlockDivider {
  type: "divider"
}

/**
 * A block with a general file, corresponding to the custom HTML tag <tg-document>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-document/
 */
export interface InputRichBlockDocument {
  type: "document"
  document: InputMediaDocument
  caption?: RichBlockCaption
}

/**
 * A block quotation, corresponding to the HTML tag <blockquote> with custom attribute "expandable".
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-expandable-block-quotation/
 */
export interface InputRichBlockExpandableBlockQuotation {
  type: "expandable_blockquote"
  text: RichText
  credit?: RichText
}

/**
 * A footer, corresponding to the HTML tag <footer>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-footer/
 */
export interface InputRichBlockFooter {
  type: "footer"
  text: RichText
}

/**
 * A list of blocks, corresponding to the HTML tag <ul> or <ol> with multiple nested tags <li>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-list/
 */
export interface InputRichBlockList {
  type: "list"
  items: InputRichBlockListItem[]
}

/**
 * An item of a list to be sent.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-list-item/
 */
export interface InputRichBlockListItem {
  blocks: InputRichBlock[]
  has_checkbox?: boolean
  is_checked?: boolean
  value?: number
  type?: "a" | "A" | "i" | "I" | "1"
}

/**
 * A block with a map, corresponding to the custom HTML tag <tg-map>
 * The map's width and height must not exceed 10000 in total
 * The width and height ratio must be at most 20.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-map/
 */
export interface InputRichBlockMap {
  type: "map"
  location: Location
  zoom?: number
  width?: number
  height?: number
  caption?: RichBlockCaption
}

/**
 * A block with a mathematical expression in LaTeX format, corresponding to the custom HTML tag <tg-math-block>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-mathematical-expression/
 */
export interface InputRichBlockMathematicalExpression {
  type: "mathematical_expression"
  expression: string
}

/**
 * A text paragraph, corresponding to the HTML tag <p>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-paragraph/
 */
export interface InputRichBlockParagraph {
  type: "paragraph"
  text: RichText
}

/**
 * A block with a photo, corresponding to the HTML tag <img>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-photo/
 */
export interface InputRichBlockPhoto {
  type: "photo"
  photo: InputMediaPhoto
  caption?: RichBlockCaption
}

/**
 * A preformatted text block, corresponding to the nested HTML tags <pre> and <code>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-preformatted/
 */
export interface InputRichBlockPreformatted {
  type: "pre"
  text: RichText
  language?: string
}

/**
 * A quotation with centered text, loosely corresponding to the HTML tag <aside>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-pull-quotation/
 */
export interface InputRichBlockPullQuotation {
  type: "pullquote"
  text: RichText
  credit?: RichText
}

/**
 * A section heading, corresponding to the HTML tags <h1>, <h2>, <h3>, <h4>, <h5>, or <h6>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-section-heading/
 */
export interface InputRichBlockSectionHeading {
  type: "heading"
  text: RichText
  size: number
}

/**
 * A slideshow, corresponding to the custom HTML tag <tg-slideshow>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-slideshow/
 */
export interface InputRichBlockSlideshow {
  type: "slideshow"
  blocks: InputRichBlock[]
  caption?: RichBlockCaption
}

/**
 * A table, corresponding to the HTML tag <table>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-table/
 */
export interface InputRichBlockTable {
  type: "table"
  cells: RichBlockTableCell[][]
  is_bordered?: boolean
  is_striped?: boolean
  is_compact?: boolean
  caption?: RichText
}

/**
 * A block with a “Thinking…” placeholder, corresponding to the custom HTML tag <tg-thinking>
 * The block may be used only in sendRichMessageDraft, therefore it can't be received in messages
 * See https://t.me/addemoji/AIActions for examples of custom emoji that are recommended for usage in the block.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-thinking/
 */
export interface InputRichBlockThinking {
  type: "thinking"
  text: RichText
}

/**
 * A block with a video, corresponding to the HTML tag <video>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-video/
 */
export interface InputRichBlockVideo {
  type: "video"
  video: InputMediaVideo
  caption?: RichBlockCaption
}

/**
 * A block with a voice note, corresponding to the HTML tag <audio>.
 * @see https://tg-bot-sdk.website/api/types/input-rich-block-voice-note/
 */
export interface InputRichBlockVoiceNote {
  type: "voice_note"
  voice_note: InputMediaVoiceNote
  caption?: RichBlockCaption
}

/**
 * Describes a rich message to be sent
 * Exactly one of the fields html, markdown, or blocks must be used.
 * @see https://tg-bot-sdk.website/api/types/input-rich-message/
 */
export interface InputRichMessage {
  blocks?: InputRichBlock[]
  html?: string
  markdown?: string
  media?: InputRichMessageMedia[]
  is_rtl?: boolean
  skip_entity_detection?: boolean
}

/**
 * Represents the content of a rich message to be sent as the result of an inline query.
 * @see https://tg-bot-sdk.website/api/types/input-rich-message-content/
 */
export interface InputRichMessageContent {
  rich_message: InputRichMessage
}

/**
 * Describes a media element embedded in an outgoing rich message.
 * @see https://tg-bot-sdk.website/api/types/input-rich-message-media/
 */
export interface InputRichMessageMedia {
  id: string
  media:
    | InputMediaAnimation
    | InputMediaAudio
    | InputMediaDocument
    | InputMediaPhoto
    | InputMediaVideo
    | InputMediaVoiceNote
}

/**
 * Represents the content of a message with a shared widget to be sent as the result of an inline query
 * Currently, widgets can't be sent in response to inline queries in the production environment.
 * @see https://tg-bot-sdk.website/api/types/input-shared-widget-message-content/
 */
export interface InputSharedWidgetMessageContent {
  widget_id: string
  chat_data?: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  show_caption_above_media?: boolean
}

/**
 * This object describes a sticker to be added to a sticker set.
 * @see https://tg-bot-sdk.website/api/types/input-sticker/
 */
export interface InputSticker {
  sticker: string
  format: "static" | "animated" | "video"
  emoji_list: string[]
  mask_position?: MaskPosition
  keywords?: string[]
}

/**
 * This object describes the content of a story to post
 * Currently, it can be one of
 * @see https://tg-bot-sdk.website/api/types/input-story-content/
 */
export type InputStoryContent = InputStoryContentPhoto | InputStoryContentVideo

/**
 * Describes a photo to post as a story.
 * @see https://tg-bot-sdk.website/api/types/input-story-content-photo/
 */
export interface InputStoryContentPhoto {
  type: "photo"
  photo: string
}

/**
 * Describes a video to post as a story.
 * @see https://tg-bot-sdk.website/api/types/input-story-content-video/
 */
export interface InputStoryContentVideo {
  type: "video"
  video: string
  duration?: number
  cover_frame_timestamp?: number
  is_animation?: boolean
}

/**
 * Represents the content of a text message to be sent as the result of an inline query.
 * @see https://tg-bot-sdk.website/api/types/input-text-message-content/
 */
export interface InputTextMessageContent {
  message_text: string
  parse_mode?: "HTML" | "MarkdownV2"
  entities?: MessageEntity[]
  link_preview_options?: LinkPreviewOptions
}

/**
 * Represents the content of a venue message to be sent as the result of an inline query.
 * @see https://tg-bot-sdk.website/api/types/input-venue-message-content/
 */
export interface InputVenueMessageContent {
  latitude: number
  longitude: number
  title: string
  address: string
  foursquare_id?: string
  foursquare_type?: string
  google_place_id?: string
  google_place_type?: string
}

/**
 * Represents the content of a message with an HTML widget to be sent as the result of an inline query
 * Currently, widgets can't be sent in response to inline queries in the production environment.
 * @see https://tg-bot-sdk.website/api/types/input-widget-message-content/
 */
export interface InputWidgetMessageContent {
  html: string
  width?: number
  height?: number
  public_data?: string
  chat_data?: string
  caption?: string
  parse_mode?: "HTML" | "MarkdownV2"
  caption_entities?: MessageEntity[]
  show_caption_above_media?: boolean
  allow_queries?: boolean
  is_shared?: boolean
}

/**
 * This object contains basic information about an invoice.
 * @see https://tg-bot-sdk.website/api/types/invoice/
 */
export interface Invoice {
  title: string
  description: string
  start_parameter: string
  currency: string
  total_amount: number
}

/**
 * This object represents one button of the reply keyboard
 * At most one of the fields other than text, icon_custom_emoji_id, and style must be used to specify the type of the button
 * For simple text buttons, String can be used instead of this object to specify the button text.
 * @see https://tg-bot-sdk.website/api/types/keyboard-button/
 */
export interface KeyboardButton {
  text: string
  icon_custom_emoji_id?: string
  style?: "danger" | "success" | "primary"
  request_users?: KeyboardButtonRequestUsers
  request_chat?: KeyboardButtonRequestChat
  request_managed_bot?: KeyboardButtonRequestManagedBot
  request_contact?: boolean
  request_location?: boolean
  request_poll?: KeyboardButtonPollType
  web_app?: WebAppInfo
}

/**
 * This object represents type of a poll, which is allowed to be created and sent when the corresponding button is pressed.
 * @see https://tg-bot-sdk.website/api/types/keyboard-button-poll-type/
 */
export interface KeyboardButtonPollType {
  type?: string
}

/**
 * This object defines the criteria used to request a suitable chat
 * Information about the selected chat will be shared with the bot when the corresponding button is pressed
 * The bot will be granted requested rights in the chat if appropriate
 * More about requesting chats ».
 * @see https://tg-bot-sdk.website/api/types/keyboard-button-request-chat/
 */
export interface KeyboardButtonRequestChat {
  request_id: number
  chat_is_channel: boolean
  chat_is_forum?: boolean
  chat_has_username?: boolean
  chat_is_created?: boolean
  user_administrator_rights?: ChatAdministratorRights
  bot_administrator_rights?: ChatAdministratorRights
  bot_is_member?: boolean
  request_title?: boolean
  request_username?: boolean
  request_photo?: boolean
}

/**
 * This object defines the parameters for the creation of a managed bot
 * Information about the created bot will be shared with the bot using the update managed_bot and a Message with the field managed_bot_created.
 * @see https://tg-bot-sdk.website/api/types/keyboard-button-request-managed-bot/
 */
export interface KeyboardButtonRequestManagedBot {
  request_id: number
  suggested_name?: string
  suggested_username?: string
}

/**
 * This object defines the criteria used to request suitable users
 * Information about the selected users will be shared with the bot when the corresponding button is pressed
 * More about requesting users »
 * @see https://tg-bot-sdk.website/api/types/keyboard-button-request-users/
 */
export interface KeyboardButtonRequestUsers {
  request_id: number
  user_is_bot?: boolean
  user_is_premium?: boolean
  max_quantity?: number
  request_name?: boolean
  request_username?: boolean
  request_photo?: boolean
}

/**
 * This object represents a portion of the price for goods or services.
 * @see https://tg-bot-sdk.website/api/types/labeled-price/
 */
export interface LabeledPrice {
  label: string
  amount: number
}

/**
 * Represents an HTTP link.
 * @see https://tg-bot-sdk.website/api/types/link/
 */
export interface Link {
  url: string
}

/**
 * Describes the options used for link preview generation.
 * @see https://tg-bot-sdk.website/api/types/link-preview-options/
 */
export interface LinkPreviewOptions {
  is_disabled?: boolean
  url?: string
  prefer_small_media?: boolean
  prefer_large_media?: boolean
  show_above_text?: boolean
}

/**
 * This object represents a live photo.
 * @see https://tg-bot-sdk.website/api/types/live-photo/
 */
export interface LivePhoto {
  file_id: string
  file_unique_id: string
  width: number
  height: number
  duration: number
  photo?: PhotoSize[]
  mime_type?: string
  file_size?: number
}

/**
 * This object represents a point on the map.
 * @see https://tg-bot-sdk.website/api/types/location/
 */
export interface Location {
  latitude: number
  longitude: number
  horizontal_accuracy?: number
  live_period?: number
  heading?: number
  proximity_alert_radius?: number
}

/**
 * Describes the physical address of a location.
 * @see https://tg-bot-sdk.website/api/types/location-address/
 */
export interface LocationAddress {
  country_code: string
  state?: string
  city?: string
  street?: string
}

/**
 * This object represents a parameter of the inline keyboard button used to automatically authorize a user
 * It serves as a great replacement for the Telegram Login Widget when the user is coming from Telegram
 * All the user needs to do is tap/click a button and confirm that they want to log in:
 * Sample bot: @DiscussBot
 * @see https://tg-bot-sdk.website/api/types/login-url/
 */
export interface LoginUrl {
  url: string
  forward_text?: string
  bot_username?: string
  request_write_access?: boolean
}

/**
 * This object contains information about the bot that was created to be managed by the current bot.
 * @see https://tg-bot-sdk.website/api/types/managed-bot-created/
 */
export interface ManagedBotCreated {
  bot: User
}

/**
 * This object contains information about the creation, token update, or owner update of a bot that is managed by the current bot.
 * @see https://tg-bot-sdk.website/api/types/managed-bot-updated/
 */
export interface ManagedBotUpdated {
  user: User
  bot: User
}

/**
 * This object describes the position on faces where a mask should be placed by default.
 * @see https://tg-bot-sdk.website/api/types/mask-position/
 */
export interface MaskPosition {
  point: "forehead" | "eyes" | "mouth" | "chin"
  x_shift: number
  y_shift: number
  scale: number
}

/**
 * This object describes a message that can be inaccessible to the bot
 * It can be one of
 * @see https://tg-bot-sdk.website/api/types/maybe-inaccessible-message/
 */
export type MaybeInaccessibleMessage = Message | InaccessibleMessage

/**
 * This object describes the bot's menu button in a private chat
 * It should be one of
 * @see https://tg-bot-sdk.website/api/types/menu-button/
 */
export type MenuButton = MenuButtonCommands | MenuButtonWebApp | MenuButtonDefault

/**
 * Represents a menu button, which opens the bot's list of commands.
 * @see https://tg-bot-sdk.website/api/types/menu-button-commands/
 */
export interface MenuButtonCommands {
  type: "commands"
}

/**
 * Describes that no specific value for the menu button was set.
 * @see https://tg-bot-sdk.website/api/types/menu-button-default/
 */
export interface MenuButtonDefault {
  type: "default"
}

/**
 * Represents a menu button, which launches a Web App.
 * @see https://tg-bot-sdk.website/api/types/menu-button-web-app/
 */
export interface MenuButtonWebApp {
  type: "web_app"
  text: string
  web_app: WebAppInfo
}

/**
 * This object represents a message.
 * @see https://tg-bot-sdk.website/api/types/message/
 */
export interface Message {
  message_id: number
  date: number
  chat: Chat
  message_thread_id?: number
  direct_messages_topic?: DirectMessagesTopic
  from?: User
  sender_chat?: Chat
  sender_boost_count?: number
  sender_business_bot?: User
  sender_tag?: string
  receiver_user?: User
  ephemeral_message_id?: number
  guest_query_id?: string
  business_connection_id?: string
  forward_origin?: MessageOrigin
  is_topic_message?: boolean
  is_automatic_forward?: boolean
  reply_to_message?: Message
  external_reply?: ExternalReplyInfo
  quote?: TextQuote
  reply_to_story?: Story
  reply_to_checklist_task_id?: number
  reply_to_poll_option_id?: string
  via_bot?: User
  guest_bot_caller_user?: User
  guest_bot_caller_chat?: Chat
  edit_date?: number
  has_protected_content?: boolean
  is_from_offline?: boolean
  is_paid_post?: boolean
  media_group_id?: string
  author_signature?: string
  paid_star_count?: number
  text?: string
  entities?: MessageEntity[]
  link_preview_options?: LinkPreviewOptions
  suggested_post_info?: SuggestedPostInfo
  effect_id?: string
  rich_message?: RichMessage
  animation?: Animation
  audio?: Audio
  document?: Document
  live_photo?: LivePhoto
  paid_media?: PaidMediaInfo
  photo?: PhotoSize[]
  sticker?: Sticker
  story?: Story
  video?: Video
  video_note?: VideoNote
  voice?: Voice
  widget?: Widget
  caption?: string
  caption_entities?: MessageEntity[]
  show_caption_above_media?: boolean
  has_media_spoiler?: boolean
  checklist?: Checklist
  contact?: Contact
  dice?: Dice
  game?: Game
  poll?: Poll
  venue?: Venue
  location?: Location
  new_chat_members?: User[]
  left_chat_member?: User
  chat_owner_left?: ChatOwnerLeft
  chat_owner_changed?: ChatOwnerChanged
  new_chat_title?: string
  new_chat_photo?: PhotoSize[]
  delete_chat_photo?: boolean
  group_chat_created?: boolean
  supergroup_chat_created?: boolean
  channel_chat_created?: boolean
  message_auto_delete_timer_changed?: MessageAutoDeleteTimerChanged
  migrate_to_chat_id?: number
  migrate_from_chat_id?: number
  pinned_message?: MaybeInaccessibleMessage
  invoice?: Invoice
  successful_payment?: SuccessfulPayment
  refunded_payment?: RefundedPayment
  users_shared?: UsersShared
  chat_shared?: ChatShared
  gift?: GiftInfo
  unique_gift?: UniqueGiftInfo
  gift_upgrade_sent?: GiftInfo
  connected_website?: string
  write_access_allowed?: WriteAccessAllowed
  passport_data?: PassportData
  proximity_alert_triggered?: ProximityAlertTriggered
  boost_added?: ChatBoostAdded
  chat_background_set?: ChatBackground
  checklist_tasks_done?: ChecklistTasksDone
  checklist_tasks_added?: ChecklistTasksAdded
  community_chat_added?: CommunityChatAdded
  community_chat_joined?: CommunityChatJoined
  community_chat_removed?: CommunityChatRemoved
  direct_message_price_changed?: DirectMessagePriceChanged
  forum_topic_created?: ForumTopicCreated
  forum_topic_edited?: ForumTopicEdited
  forum_topic_closed?: ForumTopicClosed
  forum_topic_reopened?: ForumTopicReopened
  general_forum_topic_hidden?: GeneralForumTopicHidden
  general_forum_topic_unhidden?: GeneralForumTopicUnhidden
  giveaway_created?: GiveawayCreated
  giveaway?: Giveaway
  giveaway_winners?: GiveawayWinners
  giveaway_completed?: GiveawayCompleted
  managed_bot_created?: ManagedBotCreated
  paid_message_price_changed?: PaidMessagePriceChanged
  paid_messages_waived?: PaidMessagesWaived
  poll_option_added?: PollOptionAdded
  poll_option_deleted?: PollOptionDeleted
  suggested_post_approved?: SuggestedPostApproved
  suggested_post_approval_failed?: SuggestedPostApprovalFailed
  suggested_post_declined?: SuggestedPostDeclined
  suggested_post_paid?: SuggestedPostPaid
  suggested_post_refunded?: SuggestedPostRefunded
  ton_wallet_transfer?: TonWalletTransfer
  video_chat_scheduled?: VideoChatScheduled
  video_chat_started?: VideoChatStarted
  video_chat_ended?: VideoChatEnded
  video_chat_participants_invited?: VideoChatParticipantsInvited
  web_app_data?: WebAppData
  reply_markup?: InlineKeyboardMarkup
}

/**
 * This object represents a service message about a change in auto-delete timer settings.
 * @see https://tg-bot-sdk.website/api/types/message-auto-delete-timer-changed/
 */
export interface MessageAutoDeleteTimerChanged {
  message_auto_delete_time: number
}

/**
 * This object represents one special entity in a text message
 * For example, hashtags, usernames, URLs, etc.
 * @see https://tg-bot-sdk.website/api/types/message-entity/
 */
export interface MessageEntity {
  type:
    | "mention"
    | "hashtag"
    | "cashtag"
    | "bot_command"
    | "url"
    | "email"
    | "phone_number"
    | "bank_card_number"
    | "ton_address"
    | "bold"
    | "italic"
    | "underline"
    | "strikethrough"
    | "spoiler"
    | "blockquote"
    | "expandable_blockquote"
    | "code"
    | "pre"
    | "text_link"
    | "text_mention"
    | "custom_emoji"
    | "date_time"
  offset: number
  length: number
  url?: string
  user?: User
  language?: string
  custom_emoji_id?: string
  unix_time?: number
  date_time_format?: string
}

/**
 * This object describes an update about a user stopping message generation.
 * @see https://tg-bot-sdk.website/api/types/message-generation-stopped/
 */
export interface MessageGenerationStopped {
  chat: Chat
  draft_id: number
  message_thread_id?: number
}

/**
 * This object represents a unique message identifier.
 * @see https://tg-bot-sdk.website/api/types/message-id/
 */
export interface MessageId {
  message_id: number
}

/**
 * This object describes the origin of a message
 * It can be one of
 * @see https://tg-bot-sdk.website/api/types/message-origin/
 */
export type MessageOrigin =
  | MessageOriginUser
  | MessageOriginHiddenUser
  | MessageOriginChat
  | MessageOriginChannel

/**
 * The message was originally sent to a channel chat.
 * @see https://tg-bot-sdk.website/api/types/message-origin-channel/
 */
export interface MessageOriginChannel {
  type: "channel"
  date: number
  chat: Chat
  message_id: number
  author_signature?: string
}

/**
 * The message was originally sent on behalf of a chat to a group chat.
 * @see https://tg-bot-sdk.website/api/types/message-origin-chat/
 */
export interface MessageOriginChat {
  type: "chat"
  date: number
  sender_chat: Chat
  author_signature?: string
}

/**
 * The message was originally sent by an unknown user.
 * @see https://tg-bot-sdk.website/api/types/message-origin-hidden-user/
 */
export interface MessageOriginHiddenUser {
  type: "hidden_user"
  date: number
  sender_user_name: string
}

/**
 * The message was originally sent by a known user.
 * @see https://tg-bot-sdk.website/api/types/message-origin-user/
 */
export interface MessageOriginUser {
  type: "user"
  date: number
  sender_user: User
}

/**
 * This object represents reaction changes on a message with anonymous reactions.
 * @see https://tg-bot-sdk.website/api/types/message-reaction-count-updated/
 */
export interface MessageReactionCountUpdated {
  chat: Chat
  message_id: number
  date: number
  reactions: ReactionCount[]
}

/**
 * This object represents a change of a reaction on a message performed by a user.
 * @see https://tg-bot-sdk.website/api/types/message-reaction-updated/
 */
export interface MessageReactionUpdated {
  chat: Chat
  message_id: number
  date: number
  old_reaction: ReactionType[]
  new_reaction: ReactionType[]
  user?: User
  actor_chat?: Chat
}

/**
 * This object represents information about an order.
 * @see https://tg-bot-sdk.website/api/types/order-info/
 */
export interface OrderInfo {
  name?: string
  phone_number?: string
  email?: string
  shipping_address?: ShippingAddress
}

/**
 * This object describes a gift received and owned by a user or a chat
 * Currently, it can be one of
 * @see https://tg-bot-sdk.website/api/types/owned-gift/
 */
export type OwnedGift = OwnedGiftRegular | OwnedGiftUnique

/**
 * Describes a regular gift owned by a user or a chat.
 * @see https://tg-bot-sdk.website/api/types/owned-gift-regular/
 */
export interface OwnedGiftRegular {
  type: "regular"
  gift: Gift
  send_date: number
  owned_gift_id?: string
  sender_user?: User
  text?: string
  entities?: MessageEntity[]
  is_private?: boolean
  is_saved?: boolean
  can_be_upgraded?: boolean
  was_refunded?: boolean
  convert_star_count?: number
  prepaid_upgrade_star_count?: number
  is_upgrade_separate?: boolean
  unique_gift_number?: number
}

/**
 * Contains the list of gifts received and owned by a user or a chat.
 * @see https://tg-bot-sdk.website/api/types/owned-gifts/
 */
export interface OwnedGifts {
  total_count: number
  gifts: OwnedGift[]
  next_offset?: string
}

/**
 * Describes a unique gift received and owned by a user or a chat.
 * @see https://tg-bot-sdk.website/api/types/owned-gift-unique/
 */
export interface OwnedGiftUnique {
  type: "unique"
  gift: UniqueGift
  send_date: number
  owned_gift_id?: string
  sender_user?: User
  is_saved?: boolean
  can_be_transferred?: boolean
  transfer_star_count?: number
  next_transfer_date?: number
}

/**
 * This object describes paid media
 * Currently, it can be one of
 * @see https://tg-bot-sdk.website/api/types/paid-media/
 */
export type PaidMedia = PaidMediaLivePhoto | PaidMediaPhoto | PaidMediaPreview | PaidMediaVideo

/**
 * Describes the paid media added to a message.
 * @see https://tg-bot-sdk.website/api/types/paid-media-info/
 */
export interface PaidMediaInfo {
  star_count: number
  paid_media: PaidMedia[]
}

/**
 * The paid media is a live photo.
 * @see https://tg-bot-sdk.website/api/types/paid-media-live-photo/
 */
export interface PaidMediaLivePhoto {
  type: "live_photo"
  live_photo: LivePhoto
}

/**
 * The paid media is a photo.
 * @see https://tg-bot-sdk.website/api/types/paid-media-photo/
 */
export interface PaidMediaPhoto {
  type: "photo"
  photo: PhotoSize[]
}

/**
 * The paid media isn't available before the payment.
 * @see https://tg-bot-sdk.website/api/types/paid-media-preview/
 */
export interface PaidMediaPreview {
  type: "preview"
  width?: number
  height?: number
  duration?: number
}

/**
 * This object contains information about a paid media purchase.
 * @see https://tg-bot-sdk.website/api/types/paid-media-purchased/
 */
export interface PaidMediaPurchased {
  from: User
  paid_media_payload: string
}

/**
 * The paid media is a video.
 * @see https://tg-bot-sdk.website/api/types/paid-media-video/
 */
export interface PaidMediaVideo {
  type: "video"
  video: Video
}

/**
 * Describes a service message about a change in the price of paid messages within a chat.
 * @see https://tg-bot-sdk.website/api/types/paid-message-price-changed/
 */
export interface PaidMessagePriceChanged {
  paid_message_star_count: number
}

/**
 * Describes a service message about the sender of the message using a link of the other user, which allows sending messages to the user without paying Telegram Stars
 * Currently holds no information.
 * @see https://tg-bot-sdk.website/api/types/paid-messages-waived/
 */
export type PaidMessagesWaived = Record<string, never>

/**
 * Describes Telegram Passport data shared with the bot by the user.
 * @see https://tg-bot-sdk.website/api/types/passport-data/
 */
export interface PassportData {
  data: EncryptedPassportElement[]
  credentials: EncryptedCredentials
}

/**
 * This object represents an error in the Telegram Passport element which was submitted that should be resolved by the user
 * It should be one of:
 * @see https://tg-bot-sdk.website/api/types/passport-element-error/
 */
export type PassportElementError =
  | PassportElementErrorDataField
  | PassportElementErrorFrontSide
  | PassportElementErrorReverseSide
  | PassportElementErrorSelfie
  | PassportElementErrorFile
  | PassportElementErrorFiles
  | PassportElementErrorTranslationFile
  | PassportElementErrorTranslationFiles
  | PassportElementErrorUnspecified

/**
 * Represents an issue in one of the data fields that was provided by the user
 * The error is considered resolved when the field's value changes.
 * @see https://tg-bot-sdk.website/api/types/passport-element-error-data-field/
 */
export interface PassportElementErrorDataField {
  source: "data"
  type:
    | "personal_details"
    | "passport"
    | "driver_license"
    | "identity_card"
    | "internal_passport"
    | "address"
  field_name: string
  data_hash: string
  message: string
}

/**
 * Represents an issue with a document scan
 * The error is considered resolved when the file with the document scan changes.
 * @see https://tg-bot-sdk.website/api/types/passport-element-error-file/
 */
export interface PassportElementErrorFile {
  source: "file"
  type:
    | "utility_bill"
    | "bank_statement"
    | "rental_agreement"
    | "passport_registration"
    | "temporary_registration"
  file_hash: string
  message: string
}

/**
 * Represents an issue with a list of scans
 * The error is considered resolved when the list of files containing the scans changes.
 * @see https://tg-bot-sdk.website/api/types/passport-element-error-files/
 */
export interface PassportElementErrorFiles {
  source: "files"
  type:
    | "utility_bill"
    | "bank_statement"
    | "rental_agreement"
    | "passport_registration"
    | "temporary_registration"
  file_hashes: string[]
  message: string
}

/**
 * Represents an issue with the front side of a document
 * The error is considered resolved when the file with the front side of the document changes.
 * @see https://tg-bot-sdk.website/api/types/passport-element-error-front-side/
 */
export interface PassportElementErrorFrontSide {
  source: "front_side"
  type: "passport" | "driver_license" | "identity_card" | "internal_passport"
  file_hash: string
  message: string
}

/**
 * Represents an issue with the reverse side of a document
 * The error is considered resolved when the file with reverse side of the document changes.
 * @see https://tg-bot-sdk.website/api/types/passport-element-error-reverse-side/
 */
export interface PassportElementErrorReverseSide {
  source: "reverse_side"
  type: "driver_license" | "identity_card"
  file_hash: string
  message: string
}

/**
 * Represents an issue with the selfie with a document
 * The error is considered resolved when the file with the selfie changes.
 * @see https://tg-bot-sdk.website/api/types/passport-element-error-selfie/
 */
export interface PassportElementErrorSelfie {
  source: "selfie"
  type: "passport" | "driver_license" | "identity_card" | "internal_passport"
  file_hash: string
  message: string
}

/**
 * Represents an issue with one of the files that constitute the translation of a document
 * The error is considered resolved when the file changes.
 * @see https://tg-bot-sdk.website/api/types/passport-element-error-translation-file/
 */
export interface PassportElementErrorTranslationFile {
  source: "translation_file"
  type:
    | "passport"
    | "driver_license"
    | "identity_card"
    | "internal_passport"
    | "utility_bill"
    | "bank_statement"
    | "rental_agreement"
    | "passport_registration"
    | "temporary_registration"
  file_hash: string
  message: string
}

/**
 * Represents an issue with the translated version of a document
 * The error is considered resolved when a file with the document translation change.
 * @see https://tg-bot-sdk.website/api/types/passport-element-error-translation-files/
 */
export interface PassportElementErrorTranslationFiles {
  source: "translation_files"
  type:
    | "passport"
    | "driver_license"
    | "identity_card"
    | "internal_passport"
    | "utility_bill"
    | "bank_statement"
    | "rental_agreement"
    | "passport_registration"
    | "temporary_registration"
  file_hashes: string[]
  message: string
}

/**
 * Represents an issue in an unspecified place
 * The error is considered resolved when new data is added.
 * @see https://tg-bot-sdk.website/api/types/passport-element-error-unspecified/
 */
export interface PassportElementErrorUnspecified {
  source: "unspecified"
  type: string
  element_hash: string
  message: string
}

/**
 * This object represents a file uploaded to Telegram Passport
 * Currently all Telegram Passport files are in JPEG format when decrypted and don't exceed 10MB.
 * @see https://tg-bot-sdk.website/api/types/passport-file/
 */
export interface PassportFile {
  file_id: string
  file_unique_id: string
  file_size: number
  file_date: number
}

/**
 * This object represents one size of a photo or a file / sticker thumbnail.
 * @see https://tg-bot-sdk.website/api/types/photo-size/
 */
export interface PhotoSize {
  file_id: string
  file_unique_id: string
  width: number
  height: number
  file_size?: number
}

/**
 * This object contains information about a poll.
 * @see https://tg-bot-sdk.website/api/types/poll/
 */
export interface Poll {
  id: string
  question: string
  options: PollOption[]
  total_voter_count: number
  is_closed: boolean
  is_anonymous: boolean
  type: "regular" | "quiz"
  allows_multiple_answers: boolean
  allows_revoting: boolean
  members_only: boolean
  question_entities?: MessageEntity[]
  country_codes?: string[]
  correct_option_ids?: number[]
  explanation?: string
  explanation_entities?: MessageEntity[]
  explanation_media?: PollMedia
  open_period?: number
  close_date?: number
  description?: string
  description_entities?: MessageEntity[]
  media?: PollMedia
}

/**
 * This object represents an answer of a user in a non-anonymous poll.
 * @see https://tg-bot-sdk.website/api/types/poll-answer/
 */
export interface PollAnswer {
  poll_id: string
  option_ids: number[]
  option_persistent_ids: string[]
  voter_chat?: Chat
  user?: User
}

/**
 * At most one of the optional fields can be present in any given object.
 * @see https://tg-bot-sdk.website/api/types/poll-media/
 */
export interface PollMedia {
  animation?: Animation
  audio?: Audio
  document?: Document
  link?: Link
  live_photo?: LivePhoto
  location?: Location
  photo?: PhotoSize[]
  sticker?: Sticker
  venue?: Venue
  video?: Video
}

/**
 * This object contains information about one answer option in a poll.
 * @see https://tg-bot-sdk.website/api/types/poll-option/
 */
export interface PollOption {
  persistent_id: string
  text: string
  voter_count: number
  text_entities?: MessageEntity[]
  media?: PollMedia
  added_by_user?: User
  added_by_chat?: Chat
  addition_date?: number
}

/**
 * Describes a service message about an option added to a poll.
 * @see https://tg-bot-sdk.website/api/types/poll-option-added/
 */
export interface PollOptionAdded {
  option_persistent_id: string
  option_text: string
  poll_message?: MaybeInaccessibleMessage
  option_text_entities?: MessageEntity[]
}

/**
 * Describes a service message about an option deleted from a poll.
 * @see https://tg-bot-sdk.website/api/types/poll-option-deleted/
 */
export interface PollOptionDeleted {
  option_persistent_id: string
  option_text: string
  poll_message?: MaybeInaccessibleMessage
  option_text_entities?: MessageEntity[]
}

/**
 * This object contains information about an incoming pre-checkout query.
 * @see https://tg-bot-sdk.website/api/types/pre-checkout-query/
 */
export interface PreCheckoutQuery {
  id: string
  from: User
  currency: string
  total_amount: number
  invoice_payload: string
  shipping_option_id?: string
  order_info?: OrderInfo
}

/**
 * Describes an inline message to be sent by a user of a Mini App.
 * @see https://tg-bot-sdk.website/api/types/prepared-inline-message/
 */
export interface PreparedInlineMessage {
  id: string
  expiration_date: number
}

/**
 * Describes a keyboard button to be used by a user of a Mini App.
 * @see https://tg-bot-sdk.website/api/types/prepared-keyboard-button/
 */
export interface PreparedKeyboardButton {
  id: string
}

/**
 * This object represents the content of a service message, sent whenever a user in the chat triggers a proximity alert set by another user.
 * @see https://tg-bot-sdk.website/api/types/proximity-alert-triggered/
 */
export interface ProximityAlertTriggered {
  traveler: User
  watcher: User
  distance: number
}

/**
 * Represents a reaction added to a message along with the number of times it was added.
 * @see https://tg-bot-sdk.website/api/types/reaction-count/
 */
export interface ReactionCount {
  type: ReactionType
  total_count: number
}

/**
 * This object describes the type of a reaction
 * Currently, it can be one of
 * @see https://tg-bot-sdk.website/api/types/reaction-type/
 */
export type ReactionType = ReactionTypeEmoji | ReactionTypeCustomEmoji | ReactionTypePaid

/**
 * The reaction is based on a custom emoji.
 * @see https://tg-bot-sdk.website/api/types/reaction-type-custom-emoji/
 */
export interface ReactionTypeCustomEmoji {
  type: "custom_emoji"
  custom_emoji_id: string
}

/**
 * The reaction is based on an emoji.
 * @see https://tg-bot-sdk.website/api/types/reaction-type-emoji/
 */
export interface ReactionTypeEmoji {
  type: "emoji"
  emoji:
    | "❤"
    | "👍"
    | "👎"
    | "🔥"
    | "🥰"
    | "👏"
    | "😁"
    | "🤔"
    | "🤯"
    | "😱"
    | "🤬"
    | "😢"
    | "🎉"
    | "🤩"
    | "🤮"
    | "💩"
    | "🙏"
    | "👌"
    | "🕊"
    | "🤡"
    | "🥱"
    | "🥴"
    | "😍"
    | "🐳"
    | "❤‍🔥"
    | "🌚"
    | "🌭"
    | "💯"
    | "🤣"
    | "⚡"
    | "🍌"
    | "🏆"
    | "💔"
    | "🤨"
    | "😐"
    | "🍓"
    | "🍾"
    | "💋"
    | "🖕"
    | "😈"
    | "😴"
    | "😭"
    | "🤓"
    | "👻"
    | "👨‍💻"
    | "👀"
    | "🎃"
    | "🙈"
    | "😇"
    | "😨"
    | "🤝"
    | "✍"
    | "🤗"
    | "🫡"
    | "🎅"
    | "🎄"
    | "☃"
    | "💅"
    | "🤪"
    | "🗿"
    | "🆒"
    | "💘"
    | "🙉"
    | "🦄"
    | "😘"
    | "💊"
    | "🙊"
    | "😎"
    | "👾"
    | "🤷‍♂"
    | "🤷"
    | "🤷‍♀"
    | "😡"
}

/**
 * The reaction is paid.
 * @see https://tg-bot-sdk.website/api/types/reaction-type-paid/
 */
export interface ReactionTypePaid {
  type: "paid"
}

/**
 * This object contains basic information about a refunded payment.
 * @see https://tg-bot-sdk.website/api/types/refunded-payment/
 */
export interface RefundedPayment {
  currency: "XTR"
  total_amount: number
  invoice_payload: string
  telegram_payment_charge_id: string
  provider_payment_charge_id?: string
}

/**
 * This object represents a custom keyboard with reply options (see Introduction to bots for details and examples)
 * Not supported in channels and for messages sent on behalf of a business account.
 * @see https://tg-bot-sdk.website/api/types/reply-keyboard-markup/
 */
export interface ReplyKeyboardMarkup {
  keyboard: KeyboardButton[][]
  is_persistent?: boolean
  resize_keyboard?: boolean
  one_time_keyboard?: boolean
  input_field_placeholder?: string
  selective?: boolean
  force_reply?: boolean
}

/**
 * Upon receiving a message with this object, Telegram clients will remove the current custom keyboard and display the default letter-keyboard
 * By default, custom keyboards are displayed until a new keyboard is sent by a bot
 * An exception is made for one-time keyboards that are hidden immediately after the user presses a button (see ReplyKeyboardMarkup)
 * Not supported in channels and for messages sent on behalf of a business account.
 * @see https://tg-bot-sdk.website/api/types/reply-keyboard-remove/
 */
export interface ReplyKeyboardRemove {
  remove_keyboard: boolean
  selective?: boolean
}

/**
 * Describes reply parameters for the message that is being sent.
 * @see https://tg-bot-sdk.website/api/types/reply-parameters/
 */
export interface ReplyParameters {
  message_id?: number
  chat_id?: number | string
  ephemeral_message_id?: number
  allow_sending_without_reply?: boolean
  quote?: string
  quote_parse_mode?: "HTML" | "MarkdownV2"
  quote_entities?: MessageEntity[]
  quote_rich_texts?: RichText[]
  quote_position?: number
  checklist_task_id?: number
  poll_option_id?: string
}

/**
 * Describes why a request was unsuccessful.
 * @see https://tg-bot-sdk.website/api/types/response-parameters/
 */
export interface ResponseParameters {
  migrate_to_chat_id?: number
  retry_after?: number
}

/**
 * This object describes the state of a revenue withdrawal operation
 * Currently, it can be one of
 * @see https://tg-bot-sdk.website/api/types/revenue-withdrawal-state/
 */
export type RevenueWithdrawalState =
  | RevenueWithdrawalStatePending
  | RevenueWithdrawalStateSucceeded
  | RevenueWithdrawalStateFailed

/**
 * The withdrawal failed and the transaction was refunded.
 * @see https://tg-bot-sdk.website/api/types/revenue-withdrawal-state-failed/
 */
export interface RevenueWithdrawalStateFailed {
  type: "failed"
}

/**
 * The withdrawal is in progress.
 * @see https://tg-bot-sdk.website/api/types/revenue-withdrawal-state-pending/
 */
export interface RevenueWithdrawalStatePending {
  type: "pending"
}

/**
 * The withdrawal succeeded.
 * @see https://tg-bot-sdk.website/api/types/revenue-withdrawal-state-succeeded/
 */
export interface RevenueWithdrawalStateSucceeded {
  type: "succeeded"
  date: number
  url: string
}

/**
 * This object represents a block in a rich formatted message
 * Currently, it can be any of the following types:
 * @see https://tg-bot-sdk.website/api/types/rich-block/
 */
export type RichBlock =
  | RichBlockParagraph
  | RichBlockSectionHeading
  | RichBlockPreformatted
  | RichBlockFooter
  | RichBlockDivider
  | RichBlockMathematicalExpression
  | RichBlockAnchor
  | RichBlockList
  | RichBlockBlockQuotation
  | RichBlockExpandableBlockQuotation
  | RichBlockPullQuotation
  | RichBlockCollage
  | RichBlockSlideshow
  | RichBlockTable
  | RichBlockDetails
  | RichBlockMap
  | RichBlockButtons
  | RichBlockAnimation
  | RichBlockAudio
  | RichBlockDocument
  | RichBlockPhoto
  | RichBlockVideo
  | RichBlockVoiceNote
  | RichBlockThinking

/**
 * A block with an anchor, corresponding to the HTML tag <a> with the attribute name.
 * @see https://tg-bot-sdk.website/api/types/rich-block-anchor/
 */
export interface RichBlockAnchor {
  type: "anchor"
  name: string
}

/**
 * A block with an animation, corresponding to the HTML tag <video>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-animation/
 */
export interface RichBlockAnimation {
  type: "animation"
  animation: Animation
  has_spoiler?: boolean
  caption?: RichBlockCaption
}

/**
 * A block with a music file, corresponding to the HTML tag <audio>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-audio/
 */
export interface RichBlockAudio {
  type: "audio"
  audio: Audio
  caption?: RichBlockCaption
}

/**
 * A block quotation, corresponding to the HTML tag <blockquote>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-block-quotation/
 */
export interface RichBlockBlockQuotation {
  type: "blockquote"
  blocks: RichBlock[]
  credit?: RichText
}

/**
 * A block containing a list of buttons that are shown in one row, corresponding to the custom HTML tag <tg-button-row>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-buttons/
 */
export interface RichBlockButtons {
  type: "buttons"
  buttons: RichMessageButton[]
  align?: "left" | "center" | "right"
}

/**
 * Caption of a rich formatted block.
 * @see https://tg-bot-sdk.website/api/types/rich-block-caption/
 */
export interface RichBlockCaption {
  text: RichText
  credit?: RichText
}

/**
 * A collage, corresponding to the custom HTML tag <tg-collage>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-collage/
 */
export interface RichBlockCollage {
  type: "collage"
  blocks: RichBlock[]
  caption?: RichBlockCaption
}

/**
 * An expandable block for details disclosure, corresponding to the HTML tag <details>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-details/
 */
export interface RichBlockDetails {
  type: "details"
  summary: RichText
  blocks: RichBlock[]
  is_open?: boolean
}

/**
 * A divider, corresponding to the HTML tag <hr/>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-divider/
 */
export interface RichBlockDivider {
  type: "divider"
}

/**
 * A block with a general file, corresponding to the custom HTML tag <tg-document>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-document/
 */
export interface RichBlockDocument {
  type: "document"
  document: Document
  caption?: RichBlockCaption
}

/**
 * A block quotation, corresponding to the HTML tag <blockquote> with custom attribute "expandable".
 * @see https://tg-bot-sdk.website/api/types/rich-block-expandable-block-quotation/
 */
export interface RichBlockExpandableBlockQuotation {
  type: "expandable_blockquote"
  text: RichText
  credit?: RichText
}

/**
 * A footer, corresponding to the HTML tag <footer>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-footer/
 */
export interface RichBlockFooter {
  type: "footer"
  text: RichText
}

/**
 * A list of blocks, corresponding to the HTML tag <ul> or <ol> with multiple nested tags <li>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-list/
 */
export interface RichBlockList {
  type: "list"
  items: RichBlockListItem[]
}

/**
 * An item of a list.
 * @see https://tg-bot-sdk.website/api/types/rich-block-list-item/
 */
export interface RichBlockListItem {
  label: string
  blocks: RichBlock[]
  has_checkbox?: boolean
  is_checked?: boolean
  value?: number
  type?: "a" | "A" | "i" | "I" | "1"
}

/**
 * A block with a map, corresponding to the custom HTML tag <tg-map>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-map/
 */
export interface RichBlockMap {
  type: "map"
  location: Location
  zoom: number
  width: number
  height: number
  caption?: RichBlockCaption
}

/**
 * A block with a mathematical expression in LaTeX format, corresponding to the custom HTML tag <tg-math-block>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-mathematical-expression/
 */
export interface RichBlockMathematicalExpression {
  type: "mathematical_expression"
  expression: string
}

/**
 * A text paragraph, corresponding to the HTML tag <p>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-paragraph/
 */
export interface RichBlockParagraph {
  type: "paragraph"
  text: RichText
}

/**
 * A block with a photo, corresponding to the HTML tag <img>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-photo/
 */
export interface RichBlockPhoto {
  type: "photo"
  photo: PhotoSize[]
  has_spoiler?: boolean
  caption?: RichBlockCaption
}

/**
 * A preformatted text block, corresponding to the nested HTML tags <pre> and <code>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-preformatted/
 */
export interface RichBlockPreformatted {
  type: "pre"
  text: RichText
  language?: string
}

/**
 * A quotation with centered text, loosely corresponding to the HTML tag <aside>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-pull-quotation/
 */
export interface RichBlockPullQuotation {
  type: "pullquote"
  text: RichText
  credit?: RichText
}

/**
 * A section heading, corresponding to the HTML tags <h1>, <h2>, <h3>, <h4>, <h5>, or <h6>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-section-heading/
 */
export interface RichBlockSectionHeading {
  type: "heading"
  text: RichText
  size: number
}

/**
 * A slideshow, corresponding to the custom HTML tag <tg-slideshow>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-slideshow/
 */
export interface RichBlockSlideshow {
  type: "slideshow"
  blocks: RichBlock[]
  caption?: RichBlockCaption
}

/**
 * A table, corresponding to the HTML tag <table>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-table/
 */
export interface RichBlockTable {
  type: "table"
  cells: RichBlockTableCell[][]
  is_bordered?: boolean
  is_striped?: boolean
  is_compact?: boolean
  caption?: RichText
}

/**
 * Cell in a table.
 * @see https://tg-bot-sdk.website/api/types/rich-block-table-cell/
 */
export interface RichBlockTableCell {
  align: "left" | "center" | "right"
  valign: "top" | "middle" | "bottom"
  text?: RichText
  is_header?: boolean
  colspan?: number
  rowspan?: number
}

/**
 * A block with a “Thinking…” placeholder, corresponding to the custom HTML tag <tg-thinking>
 * The block may be used only in sendRichMessageDraft, therefore it can't be received in messages
 * See https://t.me/addemoji/AIActions for examples of custom emoji that are recommended for usage in the block.
 * @see https://tg-bot-sdk.website/api/types/rich-block-thinking/
 */
export interface RichBlockThinking {
  type: "thinking"
  text: RichText
}

/**
 * A block with a video, corresponding to the HTML tag <video>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-video/
 */
export interface RichBlockVideo {
  type: "video"
  video: Video
  has_spoiler?: boolean
  caption?: RichBlockCaption
}

/**
 * A block with a voice note, corresponding to the HTML tag <audio>.
 * @see https://tg-bot-sdk.website/api/types/rich-block-voice-note/
 */
export interface RichBlockVoiceNote {
  type: "voice_note"
  voice_note: Voice
  caption?: RichBlockCaption
}

/**
 * Rich formatted message.
 * @see https://tg-bot-sdk.website/api/types/rich-message/
 */
export interface RichMessage {
  blocks: RichBlock[]
  is_rtl?: boolean
}

/**
 * This object represents a button in a RichMessage
 * Exactly one of the fields other than text and style must be used to specify the type of the button.
 * @see https://tg-bot-sdk.website/api/types/rich-message-button/
 */
export interface RichMessageButton {
  text: RichText
  style?: "danger" | "success" | "primary" | "link"
  url?: string
  callback_data?: string
  web_app?: WebAppInfo
  login_url?: LoginUrl
  switch_inline_query?: string
  switch_inline_query_current_chat?: string
  switch_inline_query_chosen_chat?: SwitchInlineQueryChosenChat
  copy_text?: CopyTextButton
  disabled?: DisabledButton
}

/**
 * This object represents a rich formatted text
 * Currently, it can be either a String for plain text, an Array of RichText, or any of the following types:
 * @see https://tg-bot-sdk.website/api/types/rich-text/
 */
export type RichText =
  | string
  | RichText[]
  | RichTextBold
  | RichTextItalic
  | RichTextUnderline
  | RichTextStrikethrough
  | RichTextSpoiler
  | RichTextDateTime
  | RichTextTextMention
  | RichTextSubscript
  | RichTextSuperscript
  | RichTextMarked
  | RichTextCode
  | RichTextCustomEmoji
  | RichTextMathematicalExpression
  | RichTextUrl
  | RichTextEmailAddress
  | RichTextPhoneNumber
  | RichTextBankCardNumber
  | RichTextTonAddress
  | RichTextMention
  | RichTextHashtag
  | RichTextCashtag
  | RichTextBotCommand
  | RichTextButton
  | RichTextAnchor
  | RichTextAnchorLink
  | RichTextReference
  | RichTextReferenceLink

/**
 * An anchor.
 * @see https://tg-bot-sdk.website/api/types/rich-text-anchor/
 */
export interface RichTextAnchor {
  type: "anchor"
  name: string
}

/**
 * A link to an anchor.
 * @see https://tg-bot-sdk.website/api/types/rich-text-anchor-link/
 */
export interface RichTextAnchorLink {
  type: "anchor_link"
  text: RichText
  anchor_name: string
}

/**
 * A text with a bank card number.
 * @see https://tg-bot-sdk.website/api/types/rich-text-bank-card-number/
 */
export interface RichTextBankCardNumber {
  type: "bank_card_number"
  text: RichText
  bank_card_number: string
}

/**
 * A bold text.
 * @see https://tg-bot-sdk.website/api/types/rich-text-bold/
 */
export interface RichTextBold {
  type: "bold"
  text: RichText
}

/**
 * A bot command.
 * @see https://tg-bot-sdk.website/api/types/rich-text-bot-command/
 */
export interface RichTextBotCommand {
  type: "bot_command"
  text: RichText
  bot_command: string
}

/**
 * A button.
 * @see https://tg-bot-sdk.website/api/types/rich-text-button/
 */
export interface RichTextButton {
  type: "button"
  button: RichMessageButton
}

/**
 * A cashtag.
 * @see https://tg-bot-sdk.website/api/types/rich-text-cashtag/
 */
export interface RichTextCashtag {
  type: "cashtag"
  text: RichText
  cashtag: string
}

/**
 * A monowidth text.
 * @see https://tg-bot-sdk.website/api/types/rich-text-code/
 */
export interface RichTextCode {
  type: "code"
  text: RichText
}

/**
 * A custom emoji.
 * @see https://tg-bot-sdk.website/api/types/rich-text-custom-emoji/
 */
export interface RichTextCustomEmoji {
  type: "custom_emoji"
  custom_emoji_id: string
  alternative_text: string
}

/**
 * Formatted date and time.
 * @see https://tg-bot-sdk.website/api/types/rich-text-date-time/
 */
export interface RichTextDateTime {
  type: "date_time"
  text: RichText
  unix_time: number
  date_time_format: string
}

/**
 * A text with an email address.
 * @see https://tg-bot-sdk.website/api/types/rich-text-email-address/
 */
export interface RichTextEmailAddress {
  type: "email_address"
  text: RichText
  email_address: string
}

/**
 * A hashtag.
 * @see https://tg-bot-sdk.website/api/types/rich-text-hashtag/
 */
export interface RichTextHashtag {
  type: "hashtag"
  text: RichText
  hashtag: string
}

/**
 * An italicized text.
 * @see https://tg-bot-sdk.website/api/types/rich-text-italic/
 */
export interface RichTextItalic {
  type: "italic"
  text: RichText
}

/**
 * A marked text.
 * @see https://tg-bot-sdk.website/api/types/rich-text-marked/
 */
export interface RichTextMarked {
  type: "marked"
  text: RichText
}

/**
 * A mathematical expression.
 * @see https://tg-bot-sdk.website/api/types/rich-text-mathematical-expression/
 */
export interface RichTextMathematicalExpression {
  type: "mathematical_expression"
  expression: string
}

/**
 * A mention by a username.
 * @see https://tg-bot-sdk.website/api/types/rich-text-mention/
 */
export interface RichTextMention {
  type: "mention"
  text: RichText
  username: string
}

/**
 * A text with a phone number.
 * @see https://tg-bot-sdk.website/api/types/rich-text-phone-number/
 */
export interface RichTextPhoneNumber {
  type: "phone_number"
  text: RichText
  phone_number: string
}

/**
 * A reference.
 * @see https://tg-bot-sdk.website/api/types/rich-text-reference/
 */
export interface RichTextReference {
  type: "reference"
  text: RichText
  name: string
}

/**
 * A link to a reference.
 * @see https://tg-bot-sdk.website/api/types/rich-text-reference-link/
 */
export interface RichTextReferenceLink {
  type: "reference_link"
  text: RichText
  reference_name: string
}

/**
 * A text covered by a spoiler.
 * @see https://tg-bot-sdk.website/api/types/rich-text-spoiler/
 */
export interface RichTextSpoiler {
  type: "spoiler"
  text: RichText
}

/**
 * A strikethrough text.
 * @see https://tg-bot-sdk.website/api/types/rich-text-strikethrough/
 */
export interface RichTextStrikethrough {
  type: "strikethrough"
  text: RichText
}

/**
 * A subscript text.
 * @see https://tg-bot-sdk.website/api/types/rich-text-subscript/
 */
export interface RichTextSubscript {
  type: "subscript"
  text: RichText
}

/**
 * A superscript text.
 * @see https://tg-bot-sdk.website/api/types/rich-text-superscript/
 */
export interface RichTextSuperscript {
  type: "superscript"
  text: RichText
}

/**
 * A mention of a Telegram user by their identifier.
 * @see https://tg-bot-sdk.website/api/types/rich-text-text-mention/
 */
export interface RichTextTextMention {
  type: "text_mention"
  text: RichText
  user: User
}

/**
 * An address in the TON blockchain.
 * @see https://tg-bot-sdk.website/api/types/rich-text-ton-address/
 */
export interface RichTextTonAddress {
  type: "ton_address"
  text: RichText
  address: string
}

/**
 * An underlined text.
 * @see https://tg-bot-sdk.website/api/types/rich-text-underline/
 */
export interface RichTextUnderline {
  type: "underline"
  text: RichText
}

/**
 * A text with a link.
 * @see https://tg-bot-sdk.website/api/types/rich-text-url/
 */
export interface RichTextUrl {
  type: "url"
  text: RichText
  url: string
}

/**
 * Describes an inline message sent by a guest bot.
 * @see https://tg-bot-sdk.website/api/types/sent-guest-message/
 */
export interface SentGuestMessage {
  inline_message_id: string
}

/**
 * Describes an inline message sent by a Web App on behalf of a user.
 * @see https://tg-bot-sdk.website/api/types/sent-web-app-message/
 */
export interface SentWebAppMessage {
  inline_message_id?: string
}

/**
 * This object contains information about a user that was shared with the bot using a KeyboardButtonRequestUsers button.
 * @see https://tg-bot-sdk.website/api/types/shared-user/
 */
export interface SharedUser {
  user_id: number
  first_name?: string
  last_name?: string
  username?: string
  photo?: PhotoSize[]
}

/**
 * This object represents an incoming query from a forwarded message with a shared widget created by the bot
 * Use answerWidgetQuery to answer the query
 * Each user can send at most 5 queries per 5 seconds to the bot from all its widgets.
 * @see https://tg-bot-sdk.website/api/types/shared-widget-query/
 */
export interface SharedWidgetQuery {
  id: string
  from: User
  type: WidgetQueryType
  data: string
  widget_id: string
}

/**
 * This object represents a shipping address.
 * @see https://tg-bot-sdk.website/api/types/shipping-address/
 */
export interface ShippingAddress {
  country_code: string
  state: string
  city: string
  street_line1: string
  street_line2: string
  post_code: string
}

/**
 * This object represents one shipping option.
 * @see https://tg-bot-sdk.website/api/types/shipping-option/
 */
export interface ShippingOption {
  id: string
  title: string
  prices: LabeledPrice[]
}

/**
 * This object contains information about an incoming shipping query.
 * @see https://tg-bot-sdk.website/api/types/shipping-query/
 */
export interface ShippingQuery {
  id: string
  from: User
  invoice_payload: string
  shipping_address: ShippingAddress
}

/**
 * Describes an amount of Telegram Stars.
 * @see https://tg-bot-sdk.website/api/types/star-amount/
 */
export interface StarAmount {
  amount: number
  nanostar_amount?: number
}

/**
 * Describes a Telegram Star transaction
 * Note that if the buyer initiates a chargeback with the payment provider from whom they acquired Stars (e.g., Apple, Google) following this transaction, the refunded Stars will be deducted from the bot's balance
 * This is outside of Telegram's control.
 * @see https://tg-bot-sdk.website/api/types/star-transaction/
 */
export interface StarTransaction {
  id: string
  amount: number
  date: number
  nanostar_amount?: number
  source?: TransactionPartner
  receiver?: TransactionPartner
}

/**
 * Contains a list of Telegram Star transactions.
 * @see https://tg-bot-sdk.website/api/types/star-transactions/
 */
export interface StarTransactions {
  transactions: StarTransaction[]
}

/**
 * This object represents a sticker.
 * @see https://tg-bot-sdk.website/api/types/sticker/
 */
export interface Sticker {
  file_id: string
  file_unique_id: string
  type: "regular" | "mask" | "custom_emoji"
  width: number
  height: number
  is_animated: boolean
  is_video: boolean
  thumbnail?: PhotoSize
  emoji?: string
  set_name?: string
  premium_animation?: File
  mask_position?: MaskPosition
  custom_emoji_id?: string
  needs_repainting?: boolean
  file_size?: number
}

/**
 * This object represents a sticker set.
 * @see https://tg-bot-sdk.website/api/types/sticker-set/
 */
export interface StickerSet {
  name: string
  title: string
  sticker_type: "regular" | "mask" | "custom_emoji"
  stickers: Sticker[]
  thumbnail?: PhotoSize
}

/**
 * This object represents a story.
 * @see https://tg-bot-sdk.website/api/types/story/
 */
export interface Story {
  chat: Chat
  id: number
}

/**
 * Describes a clickable area on a story media.
 * @see https://tg-bot-sdk.website/api/types/story-area/
 */
export interface StoryArea {
  position: AreaPosition
  type: StoryAreaType
}

/**
 * Describes the type of a clickable area on a story
 * Currently, it can be one of
 * @see https://tg-bot-sdk.website/api/types/story-area-type/
 */
export type StoryAreaType =
  | StoryAreaTypeLocation
  | StoryAreaTypeSuggestedReaction
  | StoryAreaTypeLink
  | StoryAreaTypeWeather
  | StoryAreaTypeUniqueGift

/**
 * Describes a story area pointing to an HTTP or tg:// link
 * Currently, a story can have up to 3 link areas.
 * @see https://tg-bot-sdk.website/api/types/story-area-type-link/
 */
export interface StoryAreaTypeLink {
  type: "link"
  url: string
}

/**
 * Describes a story area pointing to a location
 * Currently, a story can have up to 10 location areas.
 * @see https://tg-bot-sdk.website/api/types/story-area-type-location/
 */
export interface StoryAreaTypeLocation {
  type: "location"
  latitude: number
  longitude: number
  address?: LocationAddress
}

/**
 * Describes a story area pointing to a suggested reaction
 * Currently, a story can have up to 5 suggested reaction areas.
 * @see https://tg-bot-sdk.website/api/types/story-area-type-suggested-reaction/
 */
export interface StoryAreaTypeSuggestedReaction {
  type: "suggested_reaction"
  reaction_type: ReactionType
  is_dark?: boolean
  is_flipped?: boolean
}

/**
 * Describes a story area pointing to a unique gift
 * Currently, a story can have at most 1 unique gift area.
 * @see https://tg-bot-sdk.website/api/types/story-area-type-unique-gift/
 */
export interface StoryAreaTypeUniqueGift {
  type: "unique_gift"
  name: string
}

/**
 * Describes a story area containing weather information
 * Currently, a story can have up to 3 weather areas.
 * @see https://tg-bot-sdk.website/api/types/story-area-type-weather/
 */
export interface StoryAreaTypeWeather {
  type: "weather"
  temperature: number
  emoji: string
  background_color: number
}

/**
 * This object contains basic information about a successful payment
 * Note that if the buyer initiates a chargeback with the relevant payment provider following this transaction, the funds may be debited from your balance
 * This is outside of Telegram's control.
 * @see https://tg-bot-sdk.website/api/types/successful-payment/
 */
export interface SuccessfulPayment {
  currency: string
  total_amount: number
  invoice_payload: string
  telegram_payment_charge_id: string
  provider_payment_charge_id: string
  subscription_expiration_date?: number
  is_recurring?: boolean
  is_first_recurring?: boolean
  shipping_option_id?: string
  order_info?: OrderInfo
}

/**
 * Describes a service message about the failed approval of a suggested post
 * Currently, only caused by insufficient user funds at the time of approval.
 * @see https://tg-bot-sdk.website/api/types/suggested-post-approval-failed/
 */
export interface SuggestedPostApprovalFailed {
  price: SuggestedPostPrice
  suggested_post_message?: Message
}

/**
 * Describes a service message about the approval of a suggested post.
 * @see https://tg-bot-sdk.website/api/types/suggested-post-approved/
 */
export interface SuggestedPostApproved {
  send_date: number
  suggested_post_message?: Message
  price?: SuggestedPostPrice
}

/**
 * Describes a service message about the rejection of a suggested post.
 * @see https://tg-bot-sdk.website/api/types/suggested-post-declined/
 */
export interface SuggestedPostDeclined {
  suggested_post_message?: Message
  comment?: string
}

/**
 * Contains information about a suggested post.
 * @see https://tg-bot-sdk.website/api/types/suggested-post-info/
 */
export interface SuggestedPostInfo {
  state: "pending" | "approved" | "declined"
  price?: SuggestedPostPrice
  send_date?: number
}

/**
 * Describes a service message about a successful payment for a suggested post.
 * @see https://tg-bot-sdk.website/api/types/suggested-post-paid/
 */
export interface SuggestedPostPaid {
  currency: "XTR" | "TON"
  suggested_post_message?: Message
  amount?: number
  star_amount?: StarAmount
}

/**
 * Contains parameters of a post that is being suggested by the bot.
 * @see https://tg-bot-sdk.website/api/types/suggested-post-parameters/
 */
export interface SuggestedPostParameters {
  price?: SuggestedPostPrice
  send_date?: number
}

/**
 * Describes the price of a suggested post.
 * @see https://tg-bot-sdk.website/api/types/suggested-post-price/
 */
export interface SuggestedPostPrice {
  currency: "XTR" | "TON"
  amount: number
}

/**
 * Describes a service message about a payment refund for a suggested post.
 * @see https://tg-bot-sdk.website/api/types/suggested-post-refunded/
 */
export interface SuggestedPostRefunded {
  reason: "post_deleted" | "payment_refunded"
  suggested_post_message?: Message
}

/**
 * This object represents an inline button that switches the current user to inline mode in a chosen chat, with an optional default inline query.
 * @see https://tg-bot-sdk.website/api/types/switch-inline-query-chosen-chat/
 */
export interface SwitchInlineQueryChosenChat {
  query?: string
  allow_user_chats?: boolean
  allow_bot_chats?: boolean
  allow_group_chats?: boolean
  allow_channel_chats?: boolean
}

/**
 * This object contains information about the quoted part of a message that is replied to by the given message.
 * @see https://tg-bot-sdk.website/api/types/text-quote/
 */
export interface TextQuote {
  text: string
  position: number
  entities?: MessageEntity[]
  rich_texts?: RichText[]
  is_manual?: boolean
}

/**
 * This object represents an NFT in the TON blockchain.
 * @see https://tg-bot-sdk.website/api/types/ton-nft/
 */
export interface TonNft {
  address: string
  index: string
  name: string
  description: string
  collection_address?: string
  attributes?: TonNftAttribute[]
  gift?: UniqueGift
}

/**
 * This object represents an attribute of an NFT in the TON blockchain.
 * @see https://tg-bot-sdk.website/api/types/ton-nft-attribute/
 */
export interface TonNftAttribute {
  trait_type: string
  value: string
}

/**
 * This object describes a TON wallet card, which is shown on the profile page of a user to everyone.
 * @see https://tg-bot-sdk.website/api/types/ton-wallet-card/
 */
export interface TonWalletCard {
  address: string
  amount: string
  stickers: TonWalletCardSticker[]
  background_nft_address?: string
}

/**
 * This object describes a sticker on a TON wallet card.
 * @see https://tg-bot-sdk.website/api/types/ton-wallet-card-sticker/
 */
export interface TonWalletCardSticker {
  position: AreaPosition
  nft: TonNft
}

/**
 * Describes a service message about a transfer with a TON wallet.
 * @see https://tg-bot-sdk.website/api/types/ton-wallet-transfer/
 */
export interface TonWalletTransfer {
  transaction_id: string
  peer_address: string
  amount: string
  comment?: string
}

/**
 * This object describes the source of a transaction, or its recipient for outgoing transactions
 * Currently, it can be one of
 * @see https://tg-bot-sdk.website/api/types/transaction-partner/
 */
export type TransactionPartner =
  | TransactionPartnerUser
  | TransactionPartnerChat
  | TransactionPartnerAffiliateProgram
  | TransactionPartnerFragment
  | TransactionPartnerTelegramAds
  | TransactionPartnerTelegramApi
  | TransactionPartnerOther

/**
 * Describes the affiliate program that issued the affiliate commission received via this transaction.
 * @see https://tg-bot-sdk.website/api/types/transaction-partner-affiliate-program/
 */
export interface TransactionPartnerAffiliateProgram {
  type: "affiliate_program"
  commission_per_mille: number
  sponsor_user?: User
}

/**
 * Describes a transaction with a chat.
 * @see https://tg-bot-sdk.website/api/types/transaction-partner-chat/
 */
export interface TransactionPartnerChat {
  type: "chat"
  chat: Chat
  gift?: Gift
}

/**
 * Describes a withdrawal transaction with Fragment.
 * @see https://tg-bot-sdk.website/api/types/transaction-partner-fragment/
 */
export interface TransactionPartnerFragment {
  type: "fragment"
  withdrawal_state?: RevenueWithdrawalState
}

/**
 * Describes a transaction with an unknown source or recipient.
 * @see https://tg-bot-sdk.website/api/types/transaction-partner-other/
 */
export interface TransactionPartnerOther {
  type: "other"
}

/**
 * Describes a withdrawal transaction to the Telegram Ads platform.
 * @see https://tg-bot-sdk.website/api/types/transaction-partner-telegram-ads/
 */
export interface TransactionPartnerTelegramAds {
  type: "telegram_ads"
}

/**
 * Describes a transaction with payment for paid broadcasting.
 * @see https://tg-bot-sdk.website/api/types/transaction-partner-telegram-api/
 */
export interface TransactionPartnerTelegramApi {
  type: "telegram_api"
  request_count: number
}

/**
 * Describes a transaction with a user.
 * @see https://tg-bot-sdk.website/api/types/transaction-partner-user/
 */
export interface TransactionPartnerUser {
  type: "user"
  transaction_type:
    | "invoice_payment"
    | "paid_media_payment"
    | "gift_purchase"
    | "premium_purchase"
    | "business_account_transfer"
  user: User
  affiliate?: AffiliateInfo
  invoice_payload?: string
  subscription_period?: number
  paid_media?: PaidMedia[]
  paid_media_payload?: string
  gift?: Gift
  premium_subscription_duration?: number
}

/**
 * This object describes a unique gift that was upgraded from a regular gift.
 * @see https://tg-bot-sdk.website/api/types/unique-gift/
 */
export interface UniqueGift {
  gift_id: string
  base_name: string
  name: string
  number: number
  model: UniqueGiftModel
  symbol: UniqueGiftSymbol
  backdrop: UniqueGiftBackdrop
  is_premium?: boolean
  is_burned?: boolean
  is_from_blockchain?: boolean
  colors?: UniqueGiftColors
  publisher_chat?: Chat
}

/**
 * This object describes the backdrop of a unique gift.
 * @see https://tg-bot-sdk.website/api/types/unique-gift-backdrop/
 */
export interface UniqueGiftBackdrop {
  name: string
  colors: UniqueGiftBackdropColors
  rarity_per_mille: number
}

/**
 * This object describes the colors of the backdrop of a unique gift.
 * @see https://tg-bot-sdk.website/api/types/unique-gift-backdrop-colors/
 */
export interface UniqueGiftBackdropColors {
  center_color: number
  edge_color: number
  symbol_color: number
  text_color: number
}

/**
 * This object contains information about the color scheme for a user's name, message replies and link previews based on a unique gift.
 * @see https://tg-bot-sdk.website/api/types/unique-gift-colors/
 */
export interface UniqueGiftColors {
  model_custom_emoji_id: string
  symbol_custom_emoji_id: string
  light_theme_main_color: number
  light_theme_other_colors: number[]
  dark_theme_main_color: number
  dark_theme_other_colors: number[]
}

/**
 * Describes a service message about a unique gift that was sent or received.
 * @see https://tg-bot-sdk.website/api/types/unique-gift-info/
 */
export interface UniqueGiftInfo {
  gift: UniqueGift
  origin: "upgrade" | "transfer" | "resale" | "gifted_upgrade" | "offer"
  text?: string
  entities?: MessageEntity[]
  is_private?: boolean
  last_resale_currency?: "XTR" | "TON"
  last_resale_amount?: number
  owned_gift_id?: string
  transfer_star_count?: number
  next_transfer_date?: number
}

/**
 * This object describes the model of a unique gift.
 * @see https://tg-bot-sdk.website/api/types/unique-gift-model/
 */
export interface UniqueGiftModel {
  name: string
  sticker: Sticker
  rarity_per_mille: number
  rarity?: "uncommon" | "rare" | "epic" | "legendary"
}

/**
 * This object describes the symbol shown on the pattern of a unique gift.
 * @see https://tg-bot-sdk.website/api/types/unique-gift-symbol/
 */
export interface UniqueGiftSymbol {
  name: string
  sticker: Sticker
  rarity_per_mille: number
}

/**
 * This object represents an incoming update
 * At most one of the optional fields can be present in any given update.
 * @see https://tg-bot-sdk.website/api/types/update/
 */
export interface Update {
  update_id: number
  message?: Message
  edited_message?: Message
  channel_post?: Message
  edited_channel_post?: Message
  business_connection?: BusinessConnection
  business_message?: Message
  edited_business_message?: Message
  deleted_business_messages?: BusinessMessagesDeleted
  guest_message?: Message
  message_reaction?: MessageReactionUpdated
  message_reaction_count?: MessageReactionCountUpdated
  inline_query?: InlineQuery
  chosen_inline_result?: ChosenInlineResult
  callback_query?: CallbackQuery
  widget_query?: WidgetQuery
  shared_widget_query?: SharedWidgetQuery
  shipping_query?: ShippingQuery
  pre_checkout_query?: PreCheckoutQuery
  purchased_paid_media?: PaidMediaPurchased
  poll?: Poll
  poll_answer?: PollAnswer
  my_chat_member?: ChatMemberUpdated
  chat_member?: ChatMemberUpdated
  chat_join_request?: ChatJoinRequest
  chat_boost?: ChatBoostUpdated
  removed_chat_boost?: ChatBoostRemoved
  managed_bot?: ManagedBotUpdated
  subscription?: BotSubscriptionUpdated
  stopped_message_generation?: MessageGenerationStopped
}

/**
 * This object represents a Telegram user or bot.
 * @see https://tg-bot-sdk.website/api/types/user/
 */
export interface User {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  added_to_attachment_menu?: boolean
  can_join_groups?: boolean
  can_read_all_group_messages?: boolean
  supports_guest_queries?: boolean
  supports_inline_queries?: boolean
  can_connect_to_business?: boolean
  has_main_web_app?: boolean
  has_topics_enabled?: boolean
  allows_users_to_create_topics?: boolean
  can_manage_bots?: boolean
  supports_join_request_queries?: boolean
}

/**
 * This object represents a list of boosts added to a chat by a user.
 * @see https://tg-bot-sdk.website/api/types/user-chat-boosts/
 */
export interface UserChatBoosts {
  boosts: ChatBoost[]
}

/**
 * This object represents the audios displayed on a user's profile.
 * @see https://tg-bot-sdk.website/api/types/user-profile-audios/
 */
export interface UserProfileAudios {
  total_count: number
  audios: Audio[]
}

/**
 * This object represent a user's profile pictures.
 * @see https://tg-bot-sdk.website/api/types/user-profile-photos/
 */
export interface UserProfilePhotos {
  total_count: number
  photos: PhotoSize[][]
}

/**
 * This object describes the rating of a user based on their Telegram Star spendings.
 * @see https://tg-bot-sdk.website/api/types/user-rating/
 */
export interface UserRating {
  level: number
  rating: number
  current_level_rating: number
  next_level_rating?: number
}

/**
 * This object contains information about the users whose identifiers were shared with the bot using a KeyboardButtonRequestUsers button.
 * @see https://tg-bot-sdk.website/api/types/users-shared/
 */
export interface UsersShared {
  request_id: number
  users: SharedUser[]
}

/**
 * This object represents a venue.
 * @see https://tg-bot-sdk.website/api/types/venue/
 */
export interface Venue {
  location: Location
  title: string
  address: string
  foursquare_id?: string
  foursquare_type?: string
  google_place_id?: string
  google_place_type?: string
}

/**
 * This object represents a video file.
 * @see https://tg-bot-sdk.website/api/types/video/
 */
export interface Video {
  file_id: string
  file_unique_id: string
  width: number
  height: number
  duration: number
  thumbnail?: PhotoSize
  cover?: PhotoSize[]
  start_timestamp?: number
  qualities?: VideoQuality[]
  file_name?: string
  mime_type?: string
  file_size?: number
}

/**
 * This object represents a service message about a video chat ended in the chat.
 * @see https://tg-bot-sdk.website/api/types/video-chat-ended/
 */
export interface VideoChatEnded {
  duration: number
}

/**
 * This object represents a service message about new members invited to a video chat.
 * @see https://tg-bot-sdk.website/api/types/video-chat-participants-invited/
 */
export interface VideoChatParticipantsInvited {
  users: User[]
}

/**
 * This object represents a service message about a video chat scheduled in the chat.
 * @see https://tg-bot-sdk.website/api/types/video-chat-scheduled/
 */
export interface VideoChatScheduled {
  start_date: number
}

/**
 * This object represents a service message about a video chat started in the chat
 * Currently holds no information.
 * @see https://tg-bot-sdk.website/api/types/video-chat-started/
 */
export type VideoChatStarted = Record<string, never>

/**
 * This object represents a video message.
 * @see https://tg-bot-sdk.website/api/types/video-note/
 */
export interface VideoNote {
  file_id: string
  file_unique_id: string
  length: number
  duration: number
  thumbnail?: PhotoSize
  file_size?: number
}

/**
 * This object represents a video file of a specific quality.
 * @see https://tg-bot-sdk.website/api/types/video-quality/
 */
export interface VideoQuality {
  file_id: string
  file_unique_id: string
  width: number
  height: number
  codec: string
  file_size?: number
}

/**
 * This object represents a voice note.
 * @see https://tg-bot-sdk.website/api/types/voice/
 */
export interface Voice {
  file_id: string
  file_unique_id: string
  duration: number
  mime_type?: string
  file_size?: number
}

/**
 * Describes data sent from a Web App to the bot.
 * @see https://tg-bot-sdk.website/api/types/web-app-data/
 */
export interface WebAppData {
  data: string
  button_text: string
}

/**
 * Describes a Web App.
 * @see https://tg-bot-sdk.website/api/types/web-app-info/
 */
export interface WebAppInfo {
  url: string
}

/**
 * Describes the current status of a webhook.
 * @see https://tg-bot-sdk.website/api/types/webhook-info/
 */
export interface WebhookInfo {
  url: string
  has_custom_certificate: boolean
  pending_update_count: number
  ip_address?: string
  last_error_date?: number
  last_error_message?: string
  last_synchronization_error_date?: number
  max_connections?: number
  allowed_updates?: string[]
}

/**
 * This object describes an HTML widget.
 * @see https://tg-bot-sdk.website/api/types/widget/
 */
export interface Widget {
  html: string
  id?: string
  width?: number
  height?: number
  public_data?: string
  chat_data?: string
}

/**
 * This object represents an incoming query from a widget in a message sent by the bot or via the bot
 * Use answerWidgetQuery to answer the query
 * Each user can send at most 5 queries per 5 seconds to the bot from all its widgets.
 * @see https://tg-bot-sdk.website/api/types/widget-query/
 */
export interface WidgetQuery {
  id: string
  from: User
  chat_instance: string
  type: WidgetQueryType
  data: string
  chat?: Chat
  message_id?: number
  inline_message_id?: string
  chat_type?: "sender" | "private" | "group" | "supergroup" | "channel"
  widget_id?: string
}

/**
 * This object describes the type of a query from a widget
 * Currently, it can be one of
 * @see https://tg-bot-sdk.website/api/types/widget-query-type/
 */
export type WidgetQueryType =
  | WidgetQueryTypeData
  | WidgetQueryTypeSignData
  | WidgetQueryTypeSentTransaction

/**
 * The query contains data for the bot.
 * @see https://tg-bot-sdk.website/api/types/widget-query-type-data/
 */
export interface WidgetQueryTypeData {
  type: "data"
  wallet_card?: TonWalletCard
}

/**
 * The query notifies the bot about a transaction sent from a TON wallet of the user who sent the query.
 * @see https://tg-bot-sdk.website/api/types/widget-query-type-sent-transaction/
 */
export interface WidgetQueryTypeSentTransaction {
  type: "sent_transaction"
  wallet: WidgetQueryWallet
  msg_hash: string
}

/**
 * The query contains data signed by a TON wallet of the user who sent the query
 * The data is signed for the domain bot<bot_id>, where <bot_id> is the identifier of the bot.
 * @see https://tg-bot-sdk.website/api/types/widget-query-type-sign-data/
 */
export interface WidgetQueryTypeSignData {
  type: "sign_data"
  wallet: WidgetQueryWallet
  sign_data: string
}

/**
 * This object describes a TON wallet of the user, which is used in a query from a widget.
 * @see https://tg-bot-sdk.website/api/types/widget-query-wallet/
 */
export interface WidgetQueryWallet {
  address: string
  amount: string
  public_key?: string
  state_init?: string
}

/**
 * This object represents a service message about a user allowing a bot to write messages after adding it to the attachment menu, launching a Web App from a link, or accepting an explicit request from a Web App sent by the method requestWriteAccess.
 * @see https://tg-bot-sdk.website/api/types/write-access-allowed/
 */
export interface WriteAccessAllowed {
  from_request?: boolean
  web_app_name?: string
  from_attachment_menu?: boolean
}
