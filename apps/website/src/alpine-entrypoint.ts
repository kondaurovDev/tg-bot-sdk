import type { Alpine } from "alpinejs"
import { registerPlayground } from "./playground/main"
import { registerApiRunner } from "./playground/api-runner"

export default (Alpine: Alpine) => {
  registerPlayground(Alpine)
  registerApiRunner(Alpine)
}
