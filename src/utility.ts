/** compose :: (b -> c) -> (a -> b) -> a -> c */
export const compose = (
  ...fns: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
) =>
  fns.reduce((f, g) => (
    ...args: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => f(g(...args)))

/** isNonEmptyString :: String -> Boolean */
export const isNonEmptyString = (val: unknown): val is string =>
  typeof val === 'string' && val.length > 0
