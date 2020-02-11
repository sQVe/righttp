const mockLastCombineContainerUnary = jest.fn()
const mockLastHandleResponseUnary = jest.fn()
const mockLastResolveResponseUnary = jest.fn()
const mockLastLoadPayloadUnary = jest.fn()

jest.mock('../src/helpers', () => {
  const helpers = jest.requireActual('../src/helpers')

  return {
    ...helpers,
    combineContainers: jest.fn(a =>
      mockLastCombineContainerUnary.mockImplementation(b =>
        helpers.combineContainers(a)(b)
      )
    ),
    handleResponse: jest.fn(a =>
      mockLastHandleResponseUnary.mockImplementation(b =>
        helpers.handleResponse(a)(b)
      )
    ),
    loadPayload: jest.fn(a =>
      mockLastLoadPayloadUnary.mockImplementation(b =>
        helpers.loadPayload(a)(b)
      )
    ),
    resolveResponse: jest.fn(res =>
      mockLastResolveResponseUnary.mockImplementation(resolveAs =>
        helpers.resolveResponse(
          resolveAs === 'FormData'
            ? // Mock formData method due to lack of support in node-fetch.
              { formData: () => resolveAs }
            : res
        )(resolveAs)
      )
    ),
  }
})

import mockJest from 'jest-fetch-mock'
import { Response } from 'cross-fetch'

import {
  combineContainers,
  handleResponse,
  loadPayload,
  resolveResponse,
} from '../src/helpers'
import { commonHttpStatuses, resolveAsMethodNameMap } from './setup/constants'
import { defaultContainer } from '../src/constants'
import { resolveAsResponses } from './setup/mocks'
import { righttp } from '../src/righttp'

mockJest.enableMocks()

describe('righttp', () => {
  beforeEach(fetch.resetMocks)
  afterEach(jest.clearAllMocks)

  describe('righttp', () => {
    const container = {
      url: 'foo',
      init: { bar: true },
      options: { baz: true },
    }

    it('should return an API', () => {
      const subject = righttp(...Object.values(container))
      const apiMethods = [
        'del',
        'get',
        'patch',
        'post',
        'preset',
        'put',
        'request',
      ]

      expect(Object.keys(subject).length).toEqual(apiMethods.length)
      apiMethods.forEach(key => {
        expect(subject[key]).toBeDefined()
      })
    })

    it('should set preset defaults for our container', () => {
      righttp()

      expect(combineContainers).toHaveBeenCalledTimes(2)
      expect(combineContainers).toHaveBeenCalledWith(defaultContainer)
    })

    it('should combine url, init and options', () => {
      const subject = righttp(...Object.values(container))

      expect(subject.preset).toMatchSnapshot()
      expect(combineContainers).toHaveBeenCalledTimes(2)
      expect(mockLastCombineContainerUnary).toHaveBeenCalledTimes(1)
      expect(mockLastCombineContainerUnary).toHaveBeenCalledWith(container)
    })

    describe('del', () => {
      it('should use our preset defaults', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp().del('foo')

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(fetch.mock.calls).toMatchSnapshot()
      })

      it('should preset a URL', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp('preset').del('foo')
        const [firstCall] = fetch.mock.calls
        const [url] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(url).toBe('preset/foo')
      })

      it('should set DELETE as method in init', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp('foo', { method: 'GET' }).del('bar')
        const [firstCall] = fetch.mock.calls
        const [_, init] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(init.method).toBe('DELETE')
      })

      it('should load payload in init', async () => {
        expect.assertions(5)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp('foo', {}, { payloadAs: x => x }).del(
          'bar',
          'baz'
        )
        const [firstCall] = fetch.mock.calls
        const [_, init] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(loadPayload).toHaveBeenCalledTimes(1)
        expect(mockLastLoadPayloadUnary).toHaveBeenCalledWith('baz')
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(init.body).toBe('baz')
      })

      it('should not load payload in init when payload is nil', async () => {
        expect.assertions(7)
        fetch.mockResponse(resolveAsResponses.JSON)

        const firstSubject = await righttp(
          'foo',
          {},
          { payloadAs: x => x }
        ).del('bar')
        const secondSubject = await righttp(
          'foo',
          {},
          { payloadAs: x => x }
        ).del('bar', null)
        const [firstCall, secondCall] = fetch.mock.calls
        const [_, firstInit] = firstCall
        const [__, secondInit] = secondCall

        expect(firstSubject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(secondSubject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(loadPayload).toHaveBeenCalledTimes(2)
        expect(mockLastLoadPayloadUnary.mock.calls).toEqual([
          [undefined],
          [null],
        ])
        expect(fetch).toHaveBeenCalledTimes(2)
        expect(firstInit.body).toBeUndefined()
        expect(secondInit.body).toBeUndefined()
      })
    })

    describe('get', () => {
      it('should use our preset defaults', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp().get('foo')

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(fetch.mock.calls).toMatchSnapshot()
      })

      it('should preset a URL', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp('preset').get('foo')
        const [firstCall] = fetch.mock.calls
        const [url] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(url).toBe('preset/foo')
      })

      it('should set GET as method in init', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp('foo', { method: 'POST' }).get('bar')
        const [firstCall] = fetch.mock.calls
        const [_, init] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(init.method).toBe('GET')
      })

      it('should append query params to URL', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp().get('foo', {
          bar: 'baz',
          qux: 123,
        })
        const [firstCall] = fetch.mock.calls
        const [url] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(url).toBe('foo?bar=baz&qux=123')
      })
    })

    describe('patch', () => {
      it('should use our preset defaults', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp().patch('foo')

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(fetch.mock.calls).toMatchSnapshot()
      })

      it('should preset a URL', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp('preset').patch('foo')
        const [firstCall] = fetch.mock.calls
        const [url] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(url).toBe('preset/foo')
      })

      it('should set PATCH as method in init', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp('foo', { method: 'GET' }).patch('bar')
        const [firstCall] = fetch.mock.calls
        const [_, init] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(init.method).toBe('PATCH')
      })

      it('should load payload in init', async () => {
        expect.assertions(5)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp('foo', {}, { payloadAs: x => x }).patch(
          'bar',
          'baz'
        )
        const [firstCall] = fetch.mock.calls
        const [_, init] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(loadPayload).toHaveBeenCalledTimes(1)
        expect(mockLastLoadPayloadUnary).toHaveBeenCalledWith('baz')
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(init.body).toBe('baz')
      })
    })

    describe('post', () => {
      it('should use our preset defaults', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp().post('foo')

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(fetch.mock.calls).toMatchSnapshot()
      })

      it('should preset a URL', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp('preset').post('foo')
        const [firstCall] = fetch.mock.calls
        const [url] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(url).toBe('preset/foo')
      })

      it('should set PATCH as method in init', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp('foo', { method: 'GET' }).post('bar')
        const [firstCall] = fetch.mock.calls
        const [_, init] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(init.method).toBe('POST')
      })

      it('should load payload in init', async () => {
        expect.assertions(5)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp('foo', {}, { payloadAs: x => x }).post(
          'bar',
          'baz'
        )
        const [firstCall] = fetch.mock.calls
        const [_, init] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(loadPayload).toHaveBeenCalledTimes(1)
        expect(mockLastLoadPayloadUnary).toHaveBeenCalledWith('baz')
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(init.body).toBe('baz')
      })
    })

    describe('put', () => {
      it('should use our preset defaults', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp().put('foo')

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(fetch.mock.calls).toMatchSnapshot()
      })

      it('should preset a URL', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp('preset').put('foo')
        const [firstCall] = fetch.mock.calls
        const [url] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(url).toBe('preset/foo')
      })

      it('should set PATCH as method in init', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp('foo', { method: 'GET' }).put('bar')
        const [firstCall] = fetch.mock.calls
        const [_, init] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(init.method).toBe('PUT')
      })

      it('should load payload in init', async () => {
        expect.assertions(5)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp('foo', {}, { payloadAs: x => x }).put(
          'bar',
          'baz'
        )
        const [firstCall] = fetch.mock.calls
        const [_, init] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(loadPayload).toHaveBeenCalledTimes(1)
        expect(mockLastLoadPayloadUnary).toHaveBeenCalledWith('baz')
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(init.body).toBe('baz')
      })
    })

    describe('request', () => {
      it('should use our preset defaults', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp().request('foo')

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(fetch.mock.calls).toMatchSnapshot()
      })

      it('should preset a URL', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp('preset').request('foo')
        const [firstCall] = fetch.mock.calls
        const [url] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(url).toBe('preset/foo')
      })

      it('should preset init', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp(undefined, { method: 'POST' }).request(
          'foo'
        )
        const [firstCall] = fetch.mock.calls
        const [_, init] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(init.method).toBe('POST')
      })

      it('should preset options', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.Text)

        const subject = await righttp(undefined, undefined, {
          resolveAs: 'Text',
        }).request('foo')

        expect(subject).toBe(resolveAsResponses.Text)
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(mockLastResolveResponseUnary).toHaveBeenCalledWith('Text')
      })

      it('should make a request to specified URL', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp('foo/bar').request('baz/qux')
        const [firstCall] = fetch.mock.calls
        const [url] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(url).toBe('foo/bar/baz/qux')
      })

      it('should make a request with custom method in init', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp().request('foo', { method: 'POST' })
        const [firstCall] = fetch.mock.calls
        const [_, init] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(init.method).toBe('POST')
      })

      it('should make a request with custom headers in init', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp().request('foo', {
          headers: { bar: 'baz' },
        })

        const [firstCall] = fetch.mock.calls
        const [_, init] = firstCall

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(init.headers).toEqual({ bar: 'baz' })
      })

      it('should make a request with custom options', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.Text)

        const subject = await righttp().request('foo', undefined, {
          resolveAs: 'Text',
        })

        expect(subject).toBe(resolveAsResponses.Text)
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(mockLastResolveResponseUnary).toHaveBeenCalledWith('Text')
      })

      it('should call handleResponse with onResponse and response', async () => {
        expect.assertions(4)
        fetch.mockResponse(resolveAsResponses.JSON)

        const onResponse = () => {}
        const subject = await righttp().request('foo', undefined, {
          onResponse,
        })

        expect(subject).toEqual(JSON.parse(resolveAsResponses.JSON))
        expect(handleResponse).toHaveBeenCalledTimes(1)
        expect(handleResponse).toHaveBeenCalledWith(onResponse)
        expect(mockLastHandleResponseUnary.mock.calls).toMatchSnapshot()
      })

      Object.entries(resolveAsResponses).forEach(([resolveAs, res]) => {
        it(`should resolve request as ${resolveAs} when resolveAs option is ${resolveAs}`, async () => {
          expect.assertions(5)

          const methodName = resolveAsMethodNameMap[resolveAs]

          fetch.mockResponse(res)

          const subject = await righttp(undefined, undefined, {
            resolveAs,
          }).request('foo')

          expect(subject).toEqual(await new Response(res)[methodName]())
          expect(fetch).toHaveBeenCalledTimes(1)
          expect(resolveResponse).toHaveBeenCalledTimes(1)
          expect(resolveResponse.mock.calls).toMatchSnapshot()
          expect(mockLastResolveResponseUnary).toHaveBeenCalledWith(resolveAs)
        })
      })

      it('should resolve request as FormData when resolveAs option is FormData', async () => {
        expect.assertions(5)

        const formData = new FormData()
        formData.append('form', 'Data')

        fetch.mockResponse(formData)

        const subject = await righttp(undefined, undefined, {
          resolveAs: 'FormData',
        }).request('foo')

        expect(subject).toBe('FormData')
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(resolveResponse).toHaveBeenCalledTimes(1)
        expect(resolveResponse.mock.calls).toMatchSnapshot()
        expect(mockLastResolveResponseUnary).toHaveBeenCalledWith('FormData')
      })

      it('should resolve request as Response when resolveAs option is Response', async () => {
        expect.assertions(6)

        fetch.mockResponse(resolveAsResponses.Text)

        const subject = await righttp(undefined, undefined, {
          resolveAs: 'Response',
        }).request('foo')

        expect(subject).toMatchSnapshot()
        expect(subject.text()).resolves.toBe(resolveAsResponses.Text)
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(resolveResponse).toHaveBeenCalledTimes(1)
        expect(resolveResponse.mock.calls).toMatchSnapshot()
        expect(mockLastResolveResponseUnary).toHaveBeenCalledWith('Response')
      })

      it('should throw when given empty URL', () => {
        expect.assertions(1)

        expect(righttp().request()).rejects.toThrowError(
          new Error('Righttp needs an URL to make a request.')
        )
      })

      it('should throw when failing to fetch', () => {
        expect.assertions(1)

        const fetchRejectError = new TypeError('Fetch rejected.')

        fetch.mockReject(fetchRejectError)

        expect(righttp().request('foo')).rejects.toThrowError(fetchRejectError)
      })

      it('should throw when fetch is aborted', () => {
        expect.assertions(1)

        fetch.mockAbort()

        expect(righttp().request('foo')).rejects.toThrow()
      })

      it('should throw when response is unsuccessful', () => {
        const commonUnsuccessfulHttpStatuses = commonHttpStatuses.filter(
          ({ status }) => status > 299
        )

        expect.assertions(commonUnsuccessfulHttpStatuses.length)

        commonUnsuccessfulHttpStatuses.forEach(
          async ({ status, statusText }) => {
            fetch.mockResponse('', { status })

            expect(righttp().request('foo')).rejects.toThrowError(
              new Error(`${status}: ${statusText}`)
            )
          }
        )
      })
    })
  })
})
