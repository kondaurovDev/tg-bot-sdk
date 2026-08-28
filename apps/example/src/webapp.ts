import type { WebApp } from "@effect-ak/tg-bot-api"

interface Telegram {
  WebApp: WebApp
}

declare const Telegram: Telegram

export const saveData = () => {
  Telegram.WebApp.CloudStorage.setItem("key1", "some data", (error) => {
    if (error == null) {
      console.log("Saved!")
    }
  })
}

export const exit = () => {
  Telegram.WebApp.close()
}
