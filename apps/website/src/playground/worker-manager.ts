export interface WorkerMessage {
  type: "from-worker"
  data: Record<string, unknown>
  message_id: number
}

export interface WorkerManager {
  runBot(code: string, token: string, logLevel?: string): void
  onMessage(listener: (msg: WorkerMessage) => void): void
  terminate(): void
}

export function createWorkerManager(): WorkerManager {
  const worker = new Worker(new URL("./bot-worker.ts", import.meta.url), { type: "module" })

  return {
    runBot(code, token, logLevel) {
      worker.postMessage({ command: "run-bot", code, token, logLevel })
    },
    onMessage(listener) {
      worker.addEventListener("message", (e) => listener(e.data))
    },
    terminate() {
      worker.terminate()
    }
  }
}
