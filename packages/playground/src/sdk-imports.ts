/**
 * @module sdk-imports
 * The visitor's compiled bot imports the SDK by package name; the worker
 * runs it as a blob module with no network, so those imports are
 * rewritten to read the SDK the worker bundles from `globalThis`.
 */

export const SDK_GLOBAL = "__TG_BOT_SDK__"

/**
 * Rewrite `import … from "<package>"` for the given packages into reads
 * of `globalThis.__TG_BOT_SDK__["<package>"]`. Other imports stay.
 */
export const rewriteSdkImports = (code: string, packages: ReadonlySet<string>): string => {
  const importRe = /import\s*(?:(\*\s*as\s+\w+)|\{([^}]*)\}|(\w+))\s*from\s*["']([^"']+)["'];?/g
  return code.replace(
    importRe,
    (
      statement: string,
      namespace: string | undefined,
      named: string | undefined,
      defaultName: string | undefined,
      specifier: string
    ) => {
      if (!packages.has(specifier)) return statement
      const source = `globalThis.${SDK_GLOBAL}[${JSON.stringify(specifier)}]`
      if (namespace) return `const ${namespace.replace(/\*\s*as\s+/, "")} = ${source};`
      if (named !== undefined) return `const {${named.replaceAll(/\s+as\s+/g, ": ")}} = ${source};`
      return `const ${defaultName ?? "_default"} = ${source}.default ?? ${source};`
    }
  )
}
