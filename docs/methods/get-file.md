# getFile

Use this method to get basic information about a file and prepare it for downloading For the moment, bots can download files of up to 20MB in size The file can then be downloaded via the link https://api.telegram.org/file/bot&lt;token&gt;/&lt;file_path&gt;, where &lt;file_path&gt; is taken from the response It is guaranteed that the link will be valid for at least 1 hour When the link expires, a new one can be requested by calling getFile again.

[Telegram docs](https://core.telegram.org/bots/api#getfile)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file_id | `string` | Yes | File identifier to get information about |

## Return type

[`File`](../types/file.md)
