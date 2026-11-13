/**
 * @module theme
 * Light or dark, the way the docs pick it: Starlight's saved choice
 * (`starlight-theme` in localStorage: "light", "dark", or empty for auto),
 * else the system's. Switching here saves the choice there, so the docs
 * follow the playground and the other way round.
 */
import { useEffect, useState } from "react"

export type Theme = "light" | "dark"

const KEY = "starlight-theme"

const saved = (): Theme | null => {
  try {
    const value = localStorage.getItem(KEY)
    return value === "light" || value === "dark" ? value : null
  } catch {
    return null
  }
}

const system = (): Theme =>
  typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"

export const useTheme = (): [Theme, (theme: Theme) => void] => {
  const [theme, setTheme] = useState<Theme>(() => saved() ?? system())

  // On auto, follow the system as it changes
  useEffect(() => {
    if (typeof matchMedia !== "function") return
    const query = matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      if (saved() === null) setTheme(system())
    }
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  // The page's own background (overscroll, the area around the island)
  useEffect(() => {
    document.documentElement.dataset["theme"] = theme
  }, [theme])

  const choose = (next: Theme) => {
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Storage is a convenience: the theme still switches for this visit
    }
    setTheme(next)
  }
  return [theme, choose]
}
