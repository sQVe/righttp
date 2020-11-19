import {
  IContainer,
  IQueryParams,
  TNotNil,
  TOnResponse,
  TResolveAs,
  TResolveMethod,
} from './types'
import { isNonEmptyString } from './utility'

/** combineUrls :: [String] -> String */
export const combineUrls = (urls: Array<string | undefined>) => {
  const addTrailingSlash = (x: string) => (x.endsWith('/') ? x : `${x}/`)
  const removeLeadingSlash = (x: string) =>
    x.startsWith('/') ? x.substring(1) : x

  const validUrls = (urls ?? []).filter(isNonEmptyString)

  if (validUrls.length === 0) return ''
  if (validUrls.length === 1) return validUrls[0]

  return validUrls.reduce(
    (acc, url) => addTrailingSlash(acc) + removeLeadingSlash(url)
  )
}

/** createQuery :: {k: v} -> String */
export const createQuery = (params: IQueryParams) => {
  const arr = Object.entries(params ?? {}).map(([k, v]) =>
    [k, encodeURIComponent(v)].join('=')
  )

  return arr.length > 0 ? arr.join('&') : ''
}

/** getResolveAsMethodName :: String -> String */
export const getResolveAsMethodName = (resolveAs?: TResolveAs) => {
  const methodNameLookup: { [index: string]: TResolveMethod } = {
    arraybuffer: 'arrayBuffer',
    blob: 'blob',
    formdata: 'formData',
    json: 'json',
    response: 'response',
    text: 'text',
  }

  if (resolveAs == null) return methodNameLookup.response

  const caseSafeResolveAs = resolveAs.toLowerCase()
  return methodNameLookup[caseSafeResolveAs] ?? resolveAs
}

/** handleResponse :: Response r => (r a -> void) -> r a -> void */
export const handleResponse = (onResponse?: TOnResponse) => (res: Response) =>
  onResponse?.(res)

/** preparePayload :: Container -> a -> b */
export const preparePayload = (container: IContainer) => (payload: TNotNil) => {
  const { payloadAs } = container.options

  return payloadAs?.(payload)
}

/** loadPayload :: Container -> a -> Container */
export const loadPayload = (container: IContainer) => (payload?: TNotNil) =>
  payload == null
    ? container
    : {
        ...container,
        init: { ...container.init, body: preparePayload(container)(payload) },
      }

/** resolveResponse :: Response a -> String -> Promise b */
export const resolveResponse = (res: Response) => async (
  resolveAs?: TResolveAs
) => {
  const resolveAsMethodName = getResolveAsMethodName(resolveAs)

  if (resolveAsMethodName === 'response') return res
  if (resolveAsMethodName === 'json') {
    const text = await res.clone().text()

    if (text.length === 0) return undefined // eslint-disable-line fp/no-nil
    return await res.json()
  }

  return await res[resolveAsMethodName]()
}

/** combineContainers :: Container -> Container -> Container */
export const combineContainers = (a: Partial<IContainer>) => (
  b: Partial<IContainer>
): IContainer => ({
  url: combineUrls([a.url, b.url]),
  init: { ...(a.init ?? {}), ...(b.init ?? {}) },
  options: { ...(a.options ?? {}), ...(b.options ?? {}) },
})
