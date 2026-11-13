/**
 * @module chat-media
 * Photos shown as images and documents as a file you can save. The bytes
 * come through the port (`getFile`), which the chat hands down here.
 */
import type { Document, PhotoSize } from "@effect-ak/tg-bot-api"
import { createContext, useContext, useEffect, useState } from "react"

import type { ChatFile } from "./port"

export const FileSourceContext = createContext<((file_id: string) => Promise<ChatFile>) | null>(
  null
)

const toBlob = (file: ChatFile, type?: string) =>
  new Blob([file.bytes], type === undefined ? {} : { type })

const formatSize = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`

export const ChatPhoto = ({ photo }: { photo: readonly PhotoSize[] }) => {
  const getFile = useContext(FileSourceContext)
  const largest = photo.at(-1)
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!getFile || !largest) return
    let objectUrl: string | undefined
    let cancelled = false
    getFile(largest.file_id).then(
      (file) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(toBlob(file))
        setUrl(objectUrl)
      },
      // A photo the emulator never stored (sent by URL, say): the label instead
      () => !cancelled && setFailed(true)
    )
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [getFile, largest])

  if (url) return <img className="tgc-photo" src={url} alt="" data-testid="photo" />
  if (failed || !getFile) return <span className="tgc-media">🖼 photo </span>
  return <span className="tgc-photo tgc-photo-loading" />
}

export const ChatDocument = ({ document }: { document: Document }) => {
  const getFile = useContext(FileSourceContext)
  const name = document.file_name ?? "document"
  const [error, setError] = useState(false)

  const save = async () => {
    if (!getFile) return
    try {
      const file = await getFile(document.file_id)
      const url = URL.createObjectURL(toBlob(file, document.mime_type))
      const link = window.document.createElement("a")
      link.href = url
      link.download = document.file_name ?? file.file_name
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setError(true)
    }
  }

  return (
    <button
      type="button"
      className="tgc-document"
      data-testid="document"
      title={getFile ? `Save ${name}` : name}
      disabled={!getFile || error}
      onClick={() => void save()}
    >
      <span className="tgc-document-icon">{error ? "!" : "↓"}</span>
      <span className="tgc-document-text">
        <span className="tgc-document-name">{name}</span>
        <span className="tgc-document-size">
          {error
            ? "not available"
            : document.file_size === undefined
              ? "file"
              : formatSize(document.file_size)}
        </span>
      </span>
    </button>
  )
}
