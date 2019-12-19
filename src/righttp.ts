import { Container, Init, Options } from './types'
import { combineContainers, resolveResponse, preset } from './helpers'
import { defaultContainer } from './constants'

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

// const res = righttp('', { method: 'GET' }, { resolveAs: 'JSON' })
