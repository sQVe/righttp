import {
  Container,
  NotNil,
  OnResponse,
  QueryParams,
  ResolveAs,
  ResolveMethod,
} from './types'
import { isNonEmptyString } from './utility'

/** combineUrls :: [String] -> String */
export const combineUrls = (urls: (string | undefined)[]) => {
  const addTrailingSlash = (x: string) => (x.endsWith('/') ? x : `${x}/`)
  const removeLeadingSlash = (x: string) =>
    x.startsWith('/') ? x.substring(1) : x

  const validUrls = (urls || []).filter(isNonEmptyString)

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

/** handleResponse :: Response r => (r a -> void) -> r a -> void */
export const handleResponse = (onResponse?: OnResponse) => (res: Response) =>
  onResponse && onResponse(res)

/** preparePayload :: Container -> a -> b */
export const preparePayload = (container: Container) => (payload: NotNil) => {
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
export const combineContainers = (a: Partial<Container>) => (
  b: Partial<Container>
): Container => ({
  url: combineUrls([a.url, b.url]),
  init: { ...(a.init || {}), ...(b.init || {}) },
  options: { ...(a.options || {}), ...(b.options || {}) },
})
