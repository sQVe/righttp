import { compose, isString } from './utility'

type QueryParams = {
  [key: string]: string | number | boolean,
}

/** createQuery :: {k:v} -> String */
export const createQuery = (params: QueryParams = {}) => {
  const arr = Object.entries(params).map(([k, v]) =>
    [k, encodeURIComponent(v)].join('=')
  )

  return arr.length ? arr.join('&') : ''
}

/** sanitizeUrl :: String -> String */
export function sanitizeUrl(url?: string): string {
  const addTrailingSlash = (x: string) => (x.endsWith('/') ? x : `${x}/`)
  const removeLeadingSlash = (x: string) =>
    x.startsWith('/') ? x.substring(1) : x

  return isString(url)
    ? compose(
        addTrailingSlash,
        removeLeadingSlash
      )(url)
    : ''
}
