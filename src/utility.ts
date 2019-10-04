// Allow explicit any for functions like compose.
/* eslint-disable @typescript-eslint/no-explicit-any */

/** compose :: (b -> c) -> (a -> b) -> a -> c */
export const compose = (...fns: any[]) =>
  fns.reduce((f, g) => (...args: any[]) => f(g(...args)))

/** isString :: String -> Boolean */
export const isString = (val: unknown): val is string => typeof val === 'string'

/** nth :: Number -> [a] -> a */
export const nth = (idx: number) => <T>(arr: T[]) => arr.slice(idx)[0]
