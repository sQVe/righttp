import { compose } from './utility'

/**
 * createQuery :: {k:v} -> string
 */
export function createQuery(params) {
  if (!params) return ''

  const arr = Object.entries (params).map (([k, v]) =>
    [k, encodeURIComponent (v)].join ('=')
  )

  return arr.length ? arr.join ('&') : ''
}

/**
 * sanitizeUrl :: string -> string
 */
export function sanitizeUrl(url) {
  const addTrailingSlash = x => (x.endsWith ('/') ? x : `${x}/`)
  const removeLeadingSlash = x => (x.startsWith ('/') ? x.substring (1) : x)

  return url
    ? compose (
        addTrailingSlash,
        removeLeadingSlash
      ) (url)
    : ''
}
