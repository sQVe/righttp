import {
  combineContainers,
  combineUrls,
  createQuery,
  getResolveAsMethodName,
  handleResponse,
  loadPayload,
  preparePayload,
  resolveResponse,
} from '../src/helpers'
import { falsyValues, resolveAsMethodNameMap } from './setup/constants'
import { barContainer, fooContainer } from './setup/mocks'

describe('Helpers', () => {
  afterEach(jest.clearAllMocks)

  describe('loadPayload', () => {
    const mockPayloadAs = jest.fn((x) => x)

    it('should arm init with a payload', () => {
      const subject = loadPayload({
        init: { foo: true },
        options: { payloadAs: mockPayloadAs },
      })('bar')

      expect(subject.init).toEqual({
        body: 'bar',
        foo: true,
      })
      expect(mockPayloadAs).toHaveReturnedTimes(1)
    })

    it('should return container when payload is nil', () => {
      ;[undefined, null].forEach((x) =>
        expect(
          loadPayload({
            init: {
              foo: true,
            },
            options: { payloadAs: mockPayloadAs },
          })(x)
        ).toMatchSnapshot()
      )
      expect(mockPayloadAs).toHaveReturnedTimes(0)
    })
  })

  describe('combineContainers', () => {
    it('should return a combined container', () => {
      expect(combineContainers(fooContainer)(barContainer)).toMatchSnapshot()
    })

    it('should handle missing values gracefully', () => {
      expect(combineContainers({})({})).toEqual({
        url: '',
        init: {},
        options: {},
      })
    })
  })

  describe('combineUrls', () => {
    it('should return combined urls', () => {
      expect(combineUrls(['https://www.foo.com', 'bar', 'baz'])).toBe(
        'https://www.foo.com/bar/baz'
      )
    })

    it('should sanitize leading and ending slashes between urls', () => {
      expect(combineUrls(['foo/', 'bar'])).toBe('foo/bar')
      expect(combineUrls(['foo', '/bar'])).toBe('foo/bar')
      expect(combineUrls(['foo/', '/bar'])).toBe('foo/bar')
    })

    it('should not sanitize leading slash of first url', () => {
      expect(combineUrls(['foo', 'bar'])).toBe('foo/bar')
      expect(combineUrls(['/foo', 'bar'])).toBe('/foo/bar')
    })

    it('should not sanitize leading slash of last url', () => {
      expect(combineUrls(['foo', 'bar'])).toBe('foo/bar')
      expect(combineUrls(['foo', 'bar/'])).toBe('foo/bar/')
    })

    it('should return empty string when given no valid urls', () => {
      expect(combineUrls(undefined)).toBe('')
      expect(combineUrls([])).toBe('')
      expect(combineUrls(falsyValues)).toBe('')
    })

    it('should return first url when given a single valid url', () => {
      expect(combineUrls(['foo'])).toBe('foo')
      expect(combineUrls(['/foo'])).toBe('/foo')
      expect(combineUrls(['foo/'])).toBe('foo/')
      expect(combineUrls(['/foo/'])).toBe('/foo/')
    })

    it('should discard empty urls', () => {
      expect(combineUrls(['', 'foo', ''])).toBe('foo')
      expect(combineUrls(['', '/foo', ''])).toBe('/foo')
      expect(combineUrls(['', 'foo/', ''])).toBe('foo/')
      expect(combineUrls(['', '/foo/', ''])).toBe('/foo/')
    })
  })

  describe('createQuery', () => {
    it('should return query string', () => {
      const query = createQuery({ foo: true, bar: 'baz' })

      expect(query).toBe('foo=true&bar=baz')
    })

    it('should return empty query', () => {
      falsyValues.forEach((x) => {
        const query = createQuery(x)

        expect(query).toBe('')
      })
    })
  })

  describe('getResolveMethodName', () => {
    it('should return matched method name', () => {
      Object.entries(resolveAsMethodNameMap).forEach(([type, method]) => {
        expect(getResolveAsMethodName(type)).toBe(method)
      })
    })

    it('should return resolveAs when no match found', () => {
      expect(getResolveAsMethodName('foo')).toBe('foo')
      expect(getResolveAsMethodName('BAR')).toBe('BAR')
      expect(getResolveAsMethodName('fooBar')).toBe('fooBar')
    })

    it('should return method response given no resolveAs', () => {
      expect(getResolveAsMethodName()).toBe('response')
    })
  })

  describe('handleReponse', () => {
    const payload = 'foo'

    it('should handle the given response', () => {
      const mockOnResponse = jest.fn()

      handleResponse(mockOnResponse)('foo')

      expect(mockOnResponse).toHaveBeenCalledTimes(1)
      expect(mockOnResponse).toHaveBeenCalledWith(payload)
    })

    it('should return onResponse when onResponse is nil', () => {
      expect(handleResponse(undefined)(payload)).toBeUndefined()
      expect(handleResponse(null)(payload)).toBeNull()
    })
  })

  describe('preparePayload', () => {
    const container = {
      options: { payloadAs: (payload) => 'foo' + payload },
    }

    it('should return a prepared payload', () => {
      expect(preparePayload(container)('bar')).toBe('foobar')
    })

    it('should return payloadAs when payloadAs option is nil', () => {
      expect(preparePayload({ options: {} })('foo')).toBeUndefined()
      expect(preparePayload({ options: { payloadAs: null } })('foo')).toBeNull()
    })
  })

  describe('resolveResponse', () => {
    const fooMock = jest.fn(() => 'foo')

    Object.entries(resolveAsMethodNameMap)
      .filter(([type]) => !['JSON', 'Response'].includes(type))
      .forEach(([type, method]) => {
        const mock = fooMock
        const res = { [method]: mock }

        it(`should resolve as ${type}`, () => {
          expect(resolveResponse(res)(type)).resolves.toBe('foo')
          expect(mock).toHaveBeenCalledTimes(1)
        })
      })

    it('should resolve as JSON', () => {
      const textMock = fooMock
      const cloneMock = jest.fn(() => ({ text: textMock }))
      const jsonMock = fooMock
      const res = { json: jsonMock, clone: cloneMock }

      expect(resolveResponse(res)('JSON')).resolves.toBe('foo')
      expect(textMock).toHaveBeenCalledTimes(1)
      expect(cloneMock).toHaveBeenCalledTimes(1)
      expect(jsonMock).toHaveBeenCalledTimes(1)
    })

    it('should return undefined when resolved as JSON with empty response', () => {
      const textMock = jest.fn(() => '')
      const cloneMock = jest.fn(() => ({ text: textMock }))
      const jsonMock = fooMock
      const res = { json: jsonMock, clone: cloneMock }

      expect(resolveResponse(res)('JSON')).resolves.toBeUndefined()
    })

    it('should resolve as Response', () => {
      const res = 'foo'

      expect(resolveResponse(res)('Response')).resolves.toBe(res)
    })
  })
})
