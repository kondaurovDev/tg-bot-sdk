/**
 * @module api-profile
 * The bot's own profile: name, descriptions, the "/" menu and the profile
 * photo. `language_code` and command `scope` are accepted and ignored: the
 * emulator keeps the default-language, default-scope values.
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
  SetMyShortDescriptionInput,
  UserProfilePhotos
} from "@effect-ak/tg-bot-api"

import type { EmulatorState } from "../state"
import { storeFile } from "./media"

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

  // `get_chat` returns the full info, not the short `Chat` carried by messages:
  // the fields it requires on top get the values of a plain private chat.

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
