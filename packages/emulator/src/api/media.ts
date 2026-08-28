/**
 * @module api-media
 * Media send methods. Uploaded `file_content` payloads are stored, so a
 * later `get_file` / `client.getFile` round-trips the actual bytes;
 * other inputs get stub file descriptors.
 */
import type {
  Message,
  SendAnimationInput,
  SendAudioInput,
  SendContactInput,
  SendDiceInput,
  SendDocumentInput,
  SendLocationInput,
  SendPhotoInput,
  SendStickerInput,
  SendVideoInput,
  SendVoiceInput
} from "@effect-ak/tg-bot-api"

import { EmulatorApiError } from "../errors"
import { captionFields, isFileContent, outgoingBase } from "../outgoing"
import type { EmulatorState } from "../state"

interface StoredFile {
  file_id: string
  file_name?: string
  file_size?: number
}

/** Register the payload (when it carries bytes) and mint a file descriptor. */
const storeFile = (state: EmulatorState, media: unknown, fallbackName: string): StoredFile => {
  if (isFileContent(media)) {
    const file_id = state.registerUpload({
      content: media.file_content,
      file_name: media.file_name
    })
    return { file_id, file_name: media.file_name, file_size: media.file_content.byteLength }
  }
  if (typeof media === "string") {
    // an existing file_id or a URL — pass it through
    return { file_id: media, file_name: fallbackName }
  }
  return { file_id: `emu-file-${state.nextFileId++}`, file_name: fallbackName }
}

const sendMedia = (
  state: EmulatorState,
  input: Parameters<typeof outgoingBase>[1],
  fields: Partial<Message>
): Message => {
  state.clearDraft()
  return state.storeMessage({
    ...outgoingBase(state, input),
    ...captionFields(input),
    ...fields
  })
}

export const mediaMethods = (state: EmulatorState) => ({
  send_photo: (input: SendPhotoInput): Message => {
    const file = storeFile(state, input.photo, "photo.jpg")
    return sendMedia(state, input, {
      photo: [
        {
          file_id: file.file_id,
          file_unique_id: `${file.file_id}-u`,
          width: 800,
          height: 600,
          ...(file.file_size !== undefined ? { file_size: file.file_size } : {})
        }
      ]
    })
  },

  send_document: (input: SendDocumentInput): Message => {
    const file = storeFile(state, input.document, "file.bin")
    return sendMedia(state, input, {
      document: {
        file_id: file.file_id,
        file_unique_id: `${file.file_id}-u`,
        ...(file.file_name ? { file_name: file.file_name } : {}),
        ...(file.file_size !== undefined ? { file_size: file.file_size } : {})
      }
    })
  },

  send_video: (input: SendVideoInput): Message => {
    const file = storeFile(state, input.video, "video.mp4")
    return sendMedia(state, input, {
      video: {
        file_id: file.file_id,
        file_unique_id: `${file.file_id}-u`,
        width: 1280,
        height: 720,
        duration: 0
      }
    })
  },

  send_audio: (input: SendAudioInput): Message => {
    const file = storeFile(state, input.audio, "audio.mp3")
    return sendMedia(state, input, {
      audio: { file_id: file.file_id, file_unique_id: `${file.file_id}-u`, duration: 0 }
    })
  },

  send_voice: (input: SendVoiceInput): Message => {
    const file = storeFile(state, input.voice, "voice.ogg")
    return sendMedia(state, input, {
      voice: { file_id: file.file_id, file_unique_id: `${file.file_id}-u`, duration: 0 }
    })
  },

  send_animation: (input: SendAnimationInput): Message => {
    const file = storeFile(state, input.animation, "animation.mp4")
    return sendMedia(state, input, {
      animation: {
        file_id: file.file_id,
        file_unique_id: `${file.file_id}-u`,
        width: 480,
        height: 480,
        duration: 0
      }
    })
  },

  send_sticker: (input: SendStickerInput): Message => {
    const file = storeFile(state, input.sticker, "sticker.webp")
    return sendMedia(state, input, {
      sticker: {
        file_id: file.file_id,
        file_unique_id: `${file.file_id}-u`,
        type: "regular",
        width: 512,
        height: 512,
        is_animated: false,
        is_video: false
      }
    })
  },

  send_dice: (input: SendDiceInput): Message =>
    sendMedia(state, input, {
      dice: {
        emoji: input.emoji ?? "🎲",
        value: 1 + Math.floor(Math.random() * 6)
      }
    }),

  send_location: (input: SendLocationInput): Message =>
    sendMedia(state, input, {
      location: { latitude: input.latitude, longitude: input.longitude }
    }),

  send_contact: (input: SendContactInput): Message =>
    sendMedia(state, input, {
      contact: {
        phone_number: input.phone_number,
        first_name: input.first_name,
        ...(input.last_name ? { last_name: input.last_name } : {})
      }
    }),

  get_file: (input: { file_id: string }) => {
    const upload = state.uploads.get(input.file_id)
    if (!upload) {
      throw new EmulatorApiError(400, "Bad Request: file not found in the emulator")
    }
    return {
      file_id: input.file_id,
      file_unique_id: `${input.file_id}-u`,
      file_size: upload.content.byteLength,
      file_path: upload.file_name
    }
  }
})
