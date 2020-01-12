/** compose :: (b -> c) -> (a -> b) -> a -> c */
export const compose = (
  ...fns: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
) =>
  fns.reduce((f, g) => (
    ...args: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => f(g(...args)))

/** isString :: String -> Boolean */
export const isString = (val: unknown): val is string => typeof val === 'string'
