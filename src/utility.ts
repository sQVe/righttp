/** isNonEmptyString :: String -> Boolean */
export const isNonEmptyString = (val: unknown): val is string =>
  typeof val === 'string' && val.length > 0
