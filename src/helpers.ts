import { Container, QueryParams } from './types'
import { compose, isString } from './utility'

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

/** combineContainers :: {a} -> {a} -> {a} */
export const combineContainers = (a: Container) => (
  b: Container
): Container => ({
  url: sanitizeUrl(a.url) + sanitizeUrl(b.url),
  init: { ...a.init, ...b.init },
  options: { ...a.options, ...b.options },
})
