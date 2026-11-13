// Binary files bundled into the Worker as ArrayBuffer (the "Data" rule in wrangler.jsonc)
declare module "*.jpg" {
  const content: ArrayBuffer
  export default content
}
