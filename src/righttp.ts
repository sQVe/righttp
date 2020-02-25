import { Container, Init, Options, NotNil, QueryParams } from './types'
import {
  combineContainers,
  createQuery,
  handleResponse,
  loadPayload,
  resolveResponse,
} from './helpers'
import { defaultContainer } from './constants'

/** request :: Container -> Promise */
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
 * Create a fetch wrapper with easy-to-use request methods.
 *
 * @param {string} url - The URL to preset.
 * @param {object} [init] - The fetch init to preset.
 * @param {object} [options] - The request options to preset.
 * @return {object} A righttp object with preset url, init and options.
 */
export function righttp(url: string, init?: Init, options?: Options) {
  const presetContainer = combineContainers(defaultContainer)({
    url,
    init,
    options,
  })
  const presetCombine = combineContainers(presetContainer)

  return {
    /**
     * Send a DELETE request.
     *
     * @function del
     * @param {string} url - The URL to request.
     * @param {*} [payload] - The request payload to attach.
     * @return {Promise<*>} Promise with request result.
     */
    del: (url: string, payload?: NotNil) => {
      const container = loadPayload(
        presetCombine({ url, init: { method: 'DELETE' } })
      )(payload)

      return request(container)
    },

    /**
     * Send a GET request.
     *
     * @function get
     * @param {string} url - The URL to request.
     * @param {object} [queryParams] - The query parameters to append to the URL.
     * @return {Promise<*>} Promise with request result.
     */
    get: (url: string, queryParams?: QueryParams) => {
      const container = presetCombine({
        url: queryParams == null ? url : url + '?' + createQuery(queryParams),
        init: { method: 'GET' },
      })

      return request(container)
    },

    /**
     * Send a PATCH request.
     *
     * @function patch
     * @param {string} url - The URL to request.
     * @param {*} payload - The request payload to attach.
     * @return {Promise<*>} Promise with request result.
     */
    patch: (url: string, payload: NotNil) => {
      const container = loadPayload(
        presetCombine({ url, init: { method: 'PATCH' } })
      )(payload)

      return request(container)
    },

    /**
     * Send a POST request.
     *
     * @function patch
     * @param {string} url - The URL to request.
     * @param {*} payload - The request payload to attach.
     * @return {Promise<*>} Promise with request result.
     */
    post: (url: string, payload: NotNil) => {
      const container = loadPayload(
        presetCombine({ url, init: { method: 'POST' } })
      )(payload)

      return request(container)
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
     * @param {string} url - The URL to request.
     * @param {*} payload - The request payload to attach.
     * @return {Promise<*>} Promise with request result.
     */
    put: (url: string, payload: NotNil) => {
      const container = loadPayload(
        presetCombine({ url, init: { method: 'PUT' } })
      )(payload)

      return request(container)
    },

    /**
     * Send a request.
     *
     * @function request
     * @param {string} url - The URL to request.
     * @param {object} [init] - The fetch init.
     * @param {object} [options] - The request options.
     * @return {Promise<*>} Promise with request result.
     */
    request: (url: string, init?: Init, options?: Options) =>
      request(presetCombine({ url, init, options })),
  }
}
