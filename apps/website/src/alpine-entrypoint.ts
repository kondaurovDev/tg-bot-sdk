import type { Alpine } from "alpinejs"
import { registerPlayground } from "./playground/playground"
import { registerApiRunner } from "./playground/api-runner"

export default (Alpine: Alpine) => {
  registerPlayground(Alpine)
  registerApiRunner(Alpine)
}
