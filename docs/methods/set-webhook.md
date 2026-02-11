# setWebhook

Use this method to specify a URL and receive incoming updates via an outgoing webhook Whenever there is an update for the bot, we will send an HTTPS POST request to the specified URL, containing a JSON-serialized Update In case of an unsuccessful request (a request with response HTTP status code different from 2XY), we will repeat the request and give up after a reasonable amount of attempts If you&#39;d like to make sure that the webhook was set by you, you can specify secret data in the parameter secret_token If specified, the request will contain a header “X-Telegram-Bot-Api-Secret-Token” with the secret token as content.

[Telegram docs](https://core.telegram.org/bots/api#setwebhook)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| url | `string` | Yes | HTTPS URL to send updates to Use an empty string to remove webhook integration |
| certificate | [`InputFile`](../types/input-file.md) | No | Upload your public key certificate so that the root certificate in use can be checked See our self-signed guide for details. |
| ip_address | `string` | No | The fixed IP address which will be used to send webhook requests instead of the IP address resolved through DNS |
| max_connections | `number` | No | The maximum allowed number of simultaneous HTTPS connections to the webhook for update delivery, 1-100 Defaults to 40 Use lower values to limit the load on your bot&#39;s server, and higher values to increase your bot&#39;s throughput. |
| allowed_updates | `T.AllowedUpdateName[]` | No | A JSON-serialized list of the update types you want your bot to receive For example, specify ["message", "edited_channel_post", "callback_query"] to only receive updates of these types See Update for a complete list of available update types Specify an empty list to receive all update types except chat_member, message_reaction, and message_reaction_count (default) If not specified, the previous setting will be used . Please note that this parameter doesn&#39;t affect updates created before the call to the setWebhook, so unwanted updates may be received for a short period of time. |
| drop_pending_updates | `boolean` | No | Pass True to drop all pending updates |
| secret_token | `string` | No | A secret token to be sent in a header “X-Telegram-Bot-Api-Secret-Token” in every webhook request, 1-256 characters Only characters A-Z, a-z, 0-9, _ and - are allowed The header is useful to ensure that the request comes from a webhook set by you. |

## Return type

`boolean`
