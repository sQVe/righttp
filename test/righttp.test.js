const mockLastCombineContainerUnary = jest.fn()
const mockLastPresetUnary = jest.fn()
const mockLastResolveResponseUnary = jest.fn()

jest.mock('../src/helpers', () => {
  const { combineContainers, resolveResponse, preset } = jest.requireActual(
    '../src/helpers'
  )

  return {
    combineContainers: jest.fn(a =>
      mockLastCombineContainerUnary.mockImplementation(b =>
        combineContainers(a)(b)
      )
    ),
    resolveResponse: jest.fn(res =>
      mockLastResolveResponseUnary.mockImplementation(resolveAs =>
        resolveResponse(
          resolveAs === 'FormData'
            ? // Mock formData method due to lack of support in node-fetch.
              { formData: () => resolveAs }
            : res
        )(resolveAs)
      )
    ),
    preset: jest.fn(fn =>
      mockLastPresetUnary.mockImplementation(container => preset(fn)(container))
    ),
  }
})

import mockJest from 'jest-fetch-mock'
import { Response } from 'cross-fetch'

import { combineContainers, resolveResponse, preset } from '../src/helpers'
import { commonHttpStatuses, resolveAsMethodNameMap } from './setup/constants'
import { defaultContainer } from '../src/constants'
import { resolveAsResponses } from './setup/mocks'
import { righttp } from '../src/righttp'

mockJest.enableMocks()

describe('righttp', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('righttp', () => {
    const container = {
      url: 'foo',
      init: { bar: true },
      options: { baz: true },
    }

    it('should return an API', () => {
      const subject = righttp(...Object.values(container))
      const apiMethods = ['request']

      expect(Object.keys(subject).length).toEqual(apiMethods.length)
      apiMethods.forEach(method => {
        expect(typeof subject[method]).toBe('function')
      })
    })

    it('should set defaults for our container', () => {
      righttp()

      expect(combineContainers).toHaveBeenCalledTimes(1)
      expect(combineContainers).toHaveBeenCalledWith(defaultContainer)
    })

    it('should combine url, init and options', () => {
      righttp(...Object.values(container))

      expect(combineContainers).toHaveBeenCalledTimes(1)
      expect(mockLastCombineContainerUnary).toHaveBeenCalledTimes(1)
      expect(mockLastCombineContainerUnary).toHaveBeenCalledWith(container)
      expect(mockLastCombineContainerUnary.mock.results).toMatchSnapshot()
    })

    it('should preset our API', () => {
      righttp(...Object.values(container))

      expect(preset).toHaveBeenCalledTimes(1)
      expect(preset.mock.calls).toMatchSnapshot()
      expect(mockLastPresetUnary).toHaveBeenCalledTimes(1)
      expect(mockLastPresetUnary.mock.calls).toMatchSnapshot()
      expect(mockLastPresetUnary.mock.results).toMatchSnapshot()
    })

    describe('request', () => {
      it('should make a request with our defaults', async () => {
        expect.assertions(3)
        fetch.mockResponse(resolveAsResponses.JSON)

        const subject = await righttp('foo').request('bar')

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
