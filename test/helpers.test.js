import {
  createQuery,
  sanitizeUrl,
  getResolveMethodName,
  resolveResponse,
} from '../src/helpers'
import { falsyValues } from './setup/constants'

const resolveMethodMap = {
  ArrayBuffer: 'arrayBuffer',
  Blob: 'blob',
  FormData: 'formData',
  JSON: 'json',
  Response: 'response',
  Text: 'text',
}

describe('Helpers', () => {
  describe('createQuery', () => {
    it('should return query string', () => {
      const query = createQuery({ foo: true, bar: 'baz' })

      expect(query).toBe('foo=true&bar=baz')
    })

    it('should return empty query', () => {
      falsyValues.forEach(x => {
        const query = createQuery(x)

        expect(query).toBe('')
      })
    })
  })

  describe('getResolveMethodName', () => {
    it('should return matched method name', () => {
      Object.entries(resolveMethodMap).forEach(([type, method]) => {
        expect(getResolveMethodName(type)).toBe(method)
      })
    })

    it('should return resolveAs when no match found', () => {
      expect(getResolveMethodName('foo')).toBe('foo')
      expect(getResolveMethodName('BAR')).toBe('BAR')
      expect(getResolveMethodName('fooBar')).toBe('fooBar')
    })
  })

  describe('sanitizeUrl', () => {
    it('should remove leading slash from url', () => {
      const url = sanitizeUrl('/foo/')

      expect(url).toBe('foo/')
    })

    it('should add trailing slash to url', () => {
      const url = sanitizeUrl('https://www.foo.com')

      expect(url).toBe('https://www.foo.com/')
    })

    it('should return empty string', () => {
      falsyValues.forEach(x => {
        const url = sanitizeUrl(x)

        expect(url).toBe('')
      })
    })
  })
})
