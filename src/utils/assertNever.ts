/** Exhaustiveness backstop: a call only compiles where `value` is narrowed to `never`. */
export function assertNever(value: never): never {
  throw new Error(`Unreachable case: ${JSON.stringify(value)}`)
}
