import { Container, Init, Options } from './types'
import { sanitizeUrl } from './helpers'

/** shallowMergeArgs :: {a} -> {a} -> {a} */
const shallowMergeArgs = (a: Container) => (b: Container): Container => ({
  url: sanitizeUrl(a.url) + sanitizeUrl(b.url),
  init: { ...a.init, ...b.init },
  options: { ...a.options, ...b.options },
})

/** preset :: ({a} -> Promise b) -> {a} -> Promise b */
const preset = (
  fn: (container: Container) => Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any
) => (container: Container) => (url: string, init: Init, options: Options) =>
  fn(shallowMergeArgs(container)({ url, init, options }))

/** request :: (String, {a}, {b}) -> Promise c */
const request = () => Promise.resolve()

/** righttp :: (String, {a}, {b}) -> {k: v} */
export function righttp(url: string, init: Init, options: Options) {
  const container: Container = { url, init, options }

  return {
    request: preset(request)(container),
  }
}

// const res = righttp('', { method: 'GET' }, { resolveAs: 'JSON' })
