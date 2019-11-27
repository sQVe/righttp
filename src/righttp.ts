import { Container, Init, Options } from './types'
import { combineContainers } from './helpers'
import { defaultContainer } from './constants'

/** preset :: ({a} -> Promise b) -> {a} -> Promise b */
const preset = (
  fn: (container: Container) => Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any
) => (container: Container) => (url: string, init: Init, options: Options) =>
  fn(combineContainers(container)({ url, init, options }))

/** request :: {a} -> Promise b */
const request = async (container: Container) => {
  const {
    url,
    init,
    options: { resolveAs },
  } = container

  // TODO: Why does it complain about throwing?
  if (url.length === 0)
    throw new Error('Righttp needs an URL to make a request.') // eslint-disable-line fp/no-throw

  const res = await fetch(url, init)

  // TODO: Handle status...

  if (!res.ok) throw res // eslint-disable-line fp/no-throw
  return resolveAs && resolveAs.toLowerCase() === 'response'
    ? res
    : /* TODO: Parse response here... */ res
}

/**
 * righttp :: (String, {a}, {b}) -> {k: v}
 *
 * TODO: Write proper JSDocs for `righttp` function and the functions it
 * returns.
 */
export function righttp(url = '', init: Init, options: Options) {
  const container: Container = combineContainers(defaultContainer)({
    url,
    init,
    options,
  })

  return {
    request: preset(request)(container),
    // TODO: onStatus ::
  }
}

// const res = righttp('', { method: 'GET' }, { resolveAs: 'JSON' })
