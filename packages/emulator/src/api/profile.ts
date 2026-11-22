/**
 * @module api-profile
 * The bot's own profile: name, descriptions, the "/" menu, the profile
 * photo and the settings `get_me` reports. `language_code` and command
 * `scope` are accepted and ignored: the emulator keeps the default-language,
 * default-scope values.
 */
import type {
  BotCommand,
  BotDescription,
  BotName,
  BotShortDescription,
  GetUserProfilePhotosInput,
  SetMyCommandsInput,
  SetMyDescriptionInput,
  SetMyNameInput,
  SetMyProfilePhotoInput,
  SetMySettingsInput,
  SetMyShortDescriptionInput,
  UserProfilePhotos
} from "@effect-ak/tg-bot-api"

import type { BotSettings, EmulatorState } from "../state"
import { storeFile } from "./media"

/** The `set_my_settings` parameters that `get_me` reports under the same name. */
const settingFlags = [
  "supports_inline_queries",
  "needs_inline_query_location",
  "can_join_groups",
  "can_read_all_group_messages",
  "can_connect_to_business",
  "can_manage_bots",
  "supports_guest_queries",
  "supports_join_request_queries",
  "has_topics_enabled",
  "allows_users_to_create_topics",
  "has_topic_sidebar"
] as const satisfies ReadonlyArray<keyof SetMySettingsInput & keyof BotSettings>

export const profileMethods = (state: EmulatorState) => ({
  get_my_name: (): BotName => ({ name: state.profile.name ?? state.bot.first_name }),
  set_my_name: (input: SetMyNameInput): boolean => {
    if (input.name) state.profile.name = input.name
    else delete state.profile.name
    return true
  },
  get_my_description: (): BotDescription => ({ description: state.profile.description }),
  set_my_description: (input: SetMyDescriptionInput): boolean => {
    state.profile.description = input.description ?? ""
    return true
  },
  get_my_short_description: (): BotShortDescription => ({
    short_description: state.profile.short_description
  }),
  set_my_short_description: (input: SetMyShortDescriptionInput): boolean => {
    state.profile.short_description = input.short_description ?? ""
    return true
  },
  get_my_commands: (): BotCommand[] => [...state.profile.commands],
  set_my_commands: (input: SetMyCommandsInput): boolean => {
    state.profile.commands = [...input.commands]
    state.emit({ type: "commands_changed", commands: [...input.commands] })
    return true
  },

  // Settings that are not passed stay as they are. `callback_query_mode`,
  // `inline_feedback_share_denominator` and `can_communicate_with_bots` are
  // accepted and ignored: nothing in the emulator depends on them.
  set_my_settings: (input: SetMySettingsInput): boolean => {
    const { settings } = state.profile
    for (const flag of settingFlags) {
      const value = input[flag]
      if (value !== undefined) settings[flag] = value
    }
    if (input.inline_query_placeholder) {
      settings.inline_query_placeholder = input.inline_query_placeholder
    } else if (input.inline_query_placeholder === "") {
      delete settings.inline_query_placeholder
    }
    return true
  },

  set_my_profile_photo: async (input: SetMyProfilePhotoInput): Promise<boolean> => {
    const media = input.photo.type === "static" ? input.photo.photo : input.photo.animation
    const fallbackName = input.photo.type === "static" ? "photo.jpg" : "photo.mp4"
    state.profile.photo = await storeFile(state, media, fallbackName)
    return true
  },

  remove_my_profile_photo: (): boolean => {
    delete state.profile.photo
    return true
  },

  /** Photos of the bot itself; other users have none in the emulator. */
  get_user_profile_photos: (input: GetUserProfilePhotosInput): UserProfilePhotos => {
    const photo = input.user_id === state.bot.id ? state.profile.photo : undefined
    if (!photo) return { total_count: 0, photos: [] }
    return {
      total_count: 1,
      photos: [
        [
          {
            file_id: photo.file_id,
            file_unique_id: `${photo.file_id}-u`,
            width: 640,
            height: 640,
            ...(photo.file_size !== undefined ? { file_size: photo.file_size } : {})
          }
        ]
      ]
    }
  }
})
