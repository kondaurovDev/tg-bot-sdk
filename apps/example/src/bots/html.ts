/** Escape a text for a message sent with `parse_mode: "HTML"`. */
export const escapeHtml = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
