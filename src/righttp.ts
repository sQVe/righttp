import { Container, Init, Options } from './types'
import { combineContainers, resolveResponse, preset } from './helpers'
import { defaultContainer } from './constants'

/** request :: Container -> Promise a */
const request = async (container: Container) => {
  const {
    url,
    init,
    options: { resolveAs },
  } = container

  if (url.length === 0)
    throw new Error('Righttp needs an URL to make a request.')

  const res = await fetch(url, init)

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
  const container = combineContainers(defaultContainer)({
    url,
    init,
    options,
  })

  return {
    request: preset(request)(container),
  }
}
