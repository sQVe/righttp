import {
  Container,
  Init,
  NotNil,
  Options,
  QueryParams,
  ResolveAs,
  ResolveMethod,
} from './types'
import { isString } from './utility'

/** combineUrls :: [String] -> String */
export const combineUrls = (urls: string[]) => {
  const addTrailingSlash = (x: string) => (x.endsWith('/') ? x : `${x}/`)
  const removeLeadingSlash = (x: string) =>
    x.startsWith('/') ? x.substring(1) : x

  const validUrls = (urls || []).filter(x => isString(x) && x.length > 0)

  if (validUrls.length === 0) return ''
  if (validUrls.length === 1) return validUrls[0]

  return validUrls.reduce(
    (acc, url) => addTrailingSlash(acc) + removeLeadingSlash(url)
  )
}

/** createQuery :: {k: v} -> String */
export const createQuery = (params: QueryParams) => {
  const arr = Object.entries(params || {}).map(([k, v]) =>
    [k, encodeURIComponent(v)].join('=')
  )

  return arr.length ? arr.join('&') : ''
}

/** getResolveAsMethodName :: String -> String */
export const getResolveAsMethodName = (resolveAs?: ResolveAs) => {
  const methodNameLookup: { [index: string]: ResolveMethod } = {
    arraybuffer: 'arrayBuffer',
    blob: 'blob',
    formdata: 'formData',
    json: 'json',
    response: 'response',
    text: 'text',
  }

  if (resolveAs == null) return methodNameLookup.response

  const caseSafeResolveAs = resolveAs.toLowerCase()
  return methodNameLookup[caseSafeResolveAs] || resolveAs
}

/** preparePayload :: Container -> a */
export const preparePayload = (payload: NotNil, container: Container) => {
  const { payloadAs } = container.options

  return payload != null && payloadAs != null ? payloadAs(payload) : payload
}

/** resolveResponse :: Response a -> String -> Promise b */
export const resolveResponse = (res: Response) => async (
  resolveAs?: ResolveAs
) => {
  const resolveAsMethodName = getResolveAsMethodName(resolveAs)

  if (resolveAsMethodName === 'response') return res
  if (resolveAsMethodName === 'json') {
    const text = await res.clone().text()

    if (text.length === 0) return undefined // eslint-disable-line fp/no-nil
    return res.json()
  }

  return res[resolveAsMethodName]()
}

/** combineContainers :: Container -> Container -> Container */
export const combineContainers = (a: Container) => (
  b: Container
): Container => ({
  url: combineUrls([a.url, b.url]),
  init: { ...(a.init || {}), ...(b.init || {}) },
  options: { ...(a.options || {}), ...(b.options || {}) },
})

/** preset :: Promise p => (Container -> p b) -> Container -> p c */
export const preset = (
  fn: (container: Container) => Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any
) => (container: Container) => (url: string, init: Init, options: Options) =>
  fn(combineContainers(container)({ url, init, options }))
