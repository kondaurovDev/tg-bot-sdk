/**
 * @module errors
 * Error type shared by the Bot API method handlers.
 */

/** Thrown by method handlers to produce a `NotOkResponse` client error. */
export class EmulatorApiError extends Error {
  constructor(
    readonly code: number,
    message: string
  ) {
    super(message)
    this.name = "EmulatorApiError"
  }
}
