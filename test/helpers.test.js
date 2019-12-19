import {
  createQuery,
  getResolveMethodName,
  resolveResponse,
  sanitizeUrl,
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

  describe('resolveResponse', () => {
    const fooMock = jest.fn(() => 'foo')

    beforeEach(fooMock.mockClear)

    Object.entries(resolveMethodMap)
      .filter(([type]) => !['JSON', 'Response'].includes(type))
      .forEach(([type, method]) => {
        const mock = fooMock
        const res = { [method]: mock }

        it(`should resolve as ${type}`, () => {
          expect(resolveResponse(res, type)).resolves.toBe('foo')
          expect(mock).toHaveBeenCalledTimes(1)
        })
      })

    it('should resolve as JSON', () => {
      const textMock = fooMock
      const cloneMock = jest.fn(() => ({ text: textMock }))
      const jsonMock = fooMock
      const res = { json: jsonMock, clone: cloneMock }

      expect(resolveResponse(res, 'JSON')).resolves.toBe('foo')
      expect(textMock).toHaveBeenCalledTimes(1)
      expect(cloneMock).toHaveBeenCalledTimes(1)
      expect(jsonMock).toHaveBeenCalledTimes(1)
    })

    it('should return undefined when resolved as JSON with empty response', () => {
      const textMock = jest.fn(() => '')
      const cloneMock = jest.fn(() => ({ text: textMock }))
      const jsonMock = fooMock
      const res = { json: jsonMock, clone: cloneMock }

      expect(resolveResponse(res, 'JSON')).resolves.toBeUndefined()
    })

    it('should resolve as Response', () => {
      const res = 'foo'

      expect(resolveResponse(res, 'Response')).resolves.toBe(res)
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
