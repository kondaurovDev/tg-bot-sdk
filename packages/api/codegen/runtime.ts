/**
 * @module runtime
 *
 * Effect runtimes that wire together all services and configuration for
 * Bot API and WebApp code generation.
 */
import { ConfigProvider, Layer, Logger, ManagedRuntime } from "effect"
import {
  BotApiCodeWriterService,
  PageProviderService,
  WebAppCodeWriterService
} from "./service"
import { MarkdownWriterService } from "./service/markdown"
import { TsMorpthWriter } from "./service/code-writers"

const configProvider = ConfigProvider.fromJson({
  "scrapper-out-dir": ["."],
  "markdown-out-dir": ["..", "..", "docs"]
})

export const BotApiCodegenRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    PageProviderService.Default,
    BotApiCodeWriterService.Default,
    MarkdownWriterService.Default
  ).pipe(
    Layer.provideMerge(TsMorpthWriter.Default),
    Layer.provide(Layer.setConfigProvider(configProvider)),
    Layer.provide(Logger.pretty)
  )
)

export const WebAppCodegenRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    PageProviderService.Default,
    WebAppCodeWriterService.Default
  ).pipe(
    Layer.provideMerge(TsMorpthWriter.Default),
    Layer.provide(Layer.setConfigProvider(configProvider)),
    Layer.provide(Logger.pretty)
  )
)
