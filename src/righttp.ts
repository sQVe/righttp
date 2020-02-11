import { Container, Init, Options, NotNil, QueryParams } from './types'
import {
  combineContainers,
  createQuery,
  handleResponse,
  loadPayload,
  resolveResponse,
} from './helpers'
import { defaultContainer } from './constants'

/** request :: Container -> Promise a */
const request = async (container: Container) => {
  const {
    url,
    init,
    options: { onResponse, resolveAs },
  } = container

  if (url.length === 0)
    throw new Error('Righttp needs an URL to make a request.')

  const res = await fetch(url, init)

  handleResponse(onResponse)(res)

  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
  return resolveResponse(res)(resolveAs)
}

/**
 * righttp :: (String, Init, Options) -> {k: (Container -> Promise a)}
 *
 * TODO: Write proper JSDocs for `righttp` function and the functions it
 * returns.
 */
export function righttp(url: string, init: Init, options: Options) {
  const presetContainer = combineContainers(defaultContainer)({
    url,
    init,
    options,
  })
  const presetCombine = combineContainers(presetContainer)

  return {
    del: (url: string, payload?: NotNil) => {
      const container = loadPayload(
        presetCombine({ url, init: { method: 'DELETE' } })
      )(payload)

      return request(container)
    },
    get: (url: string, queryParams?: QueryParams) => {
      const container = presetCombine({
        url: queryParams == null ? url : url + '?' + createQuery(queryParams),
        init: { method: 'GET' },
      })

      return request(container)
    },
    patch: (url: string, payload: NotNil) => {
      const container = loadPayload(
        presetCombine({ url, init: { method: 'PATCH' } })
      )(payload)

      return request(container)
    },
    // TODO: post.
    preset: presetContainer,
    // TODO: put.
    request: (url: string, init: Init, options: Options) =>
      request(presetCombine({ url, init, options })),
  }
}
