import { defaultContainer } from './constants'
import {
  combineContainers,
  createQuery,
  handleResponse,
  loadPayload,
  resolveResponse,
} from './helpers'
import { IContainer, IOptions, IQueryParams, TInit, TNotNil } from './types'

/** request :: Container -> Promise */
const request = async (container: IContainer) => {
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
  return await resolveResponse(res)(resolveAs)
}

/**
 * Create a fetch wrapper with easy-to-use request methods.
 *
 * @param The URL to preset.
 * @param The fetch init to preset.
 * @param The request options to preset.
 * @return righttp object with preset url, init and options.
 */
export function righttp(
  baseUrl: string,
  baseInit?: TInit,
  baseOptions?: IOptions
) {
  const presetContainer = combineContainers(defaultContainer)({
    url: baseUrl,
    init: baseInit,
    options: baseOptions,
  })
  const presetCombine = combineContainers(presetContainer)

  return {
    /**
     * Send a DELETE request.
     *
     * @function del
     * @param url The URL to request.
     * @param [payload] The request payload to attach.
     * @return Promise with request result.
     */
    del: async (url: string, payload?: TNotNil) => {
      const container = loadPayload(
        presetCombine({ url, init: { method: 'DELETE' } })
      )(payload)

      return await request(container)
    },

    /**
     * Send a GET request.
     *
     * @function get
     * @param url The URL to request.
     * @param [queryParams] The query parameters to append to the URL.
     * @return Promise with request result.
     */
    get: async (url: string, queryParams?: IQueryParams) => {
      const container = presetCombine({
        url: queryParams == null ? url : url + '?' + createQuery(queryParams),
        init: { method: 'GET' },
      })

      return await request(container)
    },

    /**
     * Send a PATCH request.
     *
     * @function patch
     * @param url The URL to request.
     * @param payload The request payload to attach.
     * @return Promise with request result.
     */
    patch: async (url: string, payload: TNotNil) => {
      const container = loadPayload(
        presetCombine({ url, init: { method: 'PATCH' } })
      )(payload)

      return await request(container)
    },

    /**
     * Send a POST request.
     *
     * @function patch
     * @param url The URL to request.
     * @param payload The request payload to attach.
     * @return Promise with request result.
     */
    post: async (url: string, payload: TNotNil) => {
      const container = loadPayload(
        presetCombine({ url, init: { method: 'POST' } })
      )(payload)

      return await request(container)
    },

    /**
     * The container which holds all preset url, init and option settings.
     *
     * @constant
     */
    preset: presetContainer,

    /**
     * Send a PUT request.
     *
     * @function patch
     * @param url The URL to request.
     * @param payload The request payload to attach.
     * @return Promise with request result.
     */
    put: async (url: string, payload: TNotNil) => {
      const container = loadPayload(
        presetCombine({ url, init: { method: 'PUT' } })
      )(payload)

      return await request(container)
    },

    /**
     * Send a request.
     *
     * @function request
     * @param url The URL to request.
     * @param [init] The fetch init.
     * @param [options] The request options.
     * @return Promise with request result.
     */
    request: async (url: string, init?: TInit, options?: IOptions) =>
      await request(presetCombine({ url, init, options })),
  }
}
