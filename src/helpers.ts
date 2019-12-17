import {
  Container,
  Init,
  Options,
  QueryParams,
  ResolveMethod,
  ResponseResolve,
} from './types'
import { compose, isString } from './utility'

/** createQuery :: {k:v} -> String */
export const createQuery = (params: QueryParams = {}) => {
  const arr = Object.entries(params).map(([k, v]) =>
    [k, encodeURIComponent(v)].join('=')
  )

  return arr.length ? arr.join('&') : ''
}

/** getResolveMethodName :: String -> String */
export const getResolveMethodName = (resolveAs: ResponseResolve) => {
  const caseSafeResolveAs = resolveAs.toLowerCase()
  const mixedCaseMethodNameLookup: { [index: string]: ResolveMethod } = {
    arraybuffer: 'arrayBuffer',
    formdata: 'formData',
  }

  return mixedCaseMethodNameLookup[caseSafeResolveAs] || caseSafeResolveAs
}

/** resolveMethod :: (Response, String) -> Promise a */
export const resolveResponse = async (
  res: Response,
  resolveAs: ResponseResolve
) => {
  const resolveMethodName = getResolveMethodName(resolveAs)

  if (resolveMethodName === 'response') return res
  if (resolveMethodName === 'json') {
    const text = await res.clone().text()

    if (text.length === 0) return {}
    return res.json()
  }

  return res[resolveMethodName]()
}

/** sanitizeUrl :: String -> String */
export function sanitizeUrl(url?: string) {
  const addTrailingSlash = (x: string) => (x.endsWith('/') ? x : `${x}/`)
  const removeLeadingSlash = (x: string) =>
    x.startsWith('/') ? x.substring(1) : x

  return isString(url)
    ? (compose(addTrailingSlash, removeLeadingSlash)(url) as string)
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

/** preset :: ({a} -> Promise b) -> {a} -> Promise b */
export const preset = (
  fn: (container: Container) => Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any
) => (container: Container) => (url: string, init: Init, options: Options) =>
  fn(combineContainers(container)({ url, init, options }))
