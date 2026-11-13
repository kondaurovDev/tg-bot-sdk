import type { Alpine } from "alpinejs"
import { registerApiRunner } from "./api-runner"

// The API reference's "try it" widget; the playground is a React island
export default (Alpine: Alpine) => {
  registerApiRunner(Alpine)
}
