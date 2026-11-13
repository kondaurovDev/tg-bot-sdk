// The package ships as source to the website's Vite, which resolves these:
// `?raw` imports a file as a string (the examples, the SDK's .d.ts for Monaco)
declare module "*?raw" {
  const content: string
  export default content
}
