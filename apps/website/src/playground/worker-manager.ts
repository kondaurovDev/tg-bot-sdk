import type { WorkerCommand, WorkerEvent } from "./protocol"

export interface WorkerManager {
  send(command: WorkerCommand): void
  onEvent(listener: (event: WorkerEvent) => void): void
  terminate(): void
}

export function createWorkerManager(): WorkerManager {
  const worker = new Worker(new URL("./bot-worker.ts", import.meta.url), { type: "module" })

  return {
    send(command) {
      worker.postMessage(command)
    },
    onEvent(listener) {
      worker.addEventListener("message", (e: MessageEvent<WorkerEvent>) => listener(e.data))
    },
    terminate() {
      worker.terminate()
    }
  }
}
