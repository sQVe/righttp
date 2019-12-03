import {
  Container,
  Init,
  Options,
  ResolveMethod,
  ResponseResolve,
} from './types'
import { combineContainers } from './helpers'
import { defaultContainer } from './constants'

/** preset :: ({a} -> Promise b) -> {a} -> Promise b */
const preset = (
  fn: (container: Container) => Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any
) => (container: Container) => (url: string, init: Init, options: Options) =>
  fn(combineContainers(container)({ url, init, options }))

const getResolveMethodName = (resolveAs: ResponseResolve) => {
  const caseSafeResolveAs = resolveAs.toLowerCase()
  const mixedCaseMethodNameLookup: { [index: string]: ResolveMethod } = {
    arraybuffer: 'arrayBuffer',
    formdata: 'formData',
  }

  return mixedCaseMethodNameLookup[caseSafeResolveAs] || caseSafeResolveAs
}

const resolveResponse = async (res: Response, resolveAs: ResponseResolve) => {
  const resolveMethodName = getResolveMethodName(resolveAs)

  if (resolveMethodName === 'json') {
    const text = await res.clone().text()

    if (text.length === 0) return {}
    return res.json()
  } else if (resolveMethodName === 'response') {
    return res
  }

  return res[resolveMethodName]()
}

/** request :: {a} -> Promise b */
const request = async (container: Container) => {
  const {
    url,
    init,
    options: { resolveAs = 'JSON' },
  } = container

  if (url.length === 0)
    throw new Error('Righttp needs an URL to make a request.')

  const res = await fetch(url, init)

  if (!res.ok) throw res
  return resolveResponse(res, resolveAs)
}

/**
 * righttp :: (String, {a}, {b}) -> {k: v}
 *
 * TODO: Write proper JSDocs for `righttp` function and the functions it
 * returns.
 */
export function righttp(url = '', init: Init = {}, options: Options = {}) {
  const container = combineContainers(defaultContainer)({
    url,
    init,
    options,
  })

  return {
    request: preset(request)(container),
  }
}

// const res = righttp('', { method: 'GET' }, { resolveAs: 'JSON' })
