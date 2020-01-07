const mockLastCombineContainerUnary = jest.fn()
const mockLastPresetUnary = jest.fn()

jest.mock('../src/helpers', () => {
  const { combineContainers, resolveResponse, preset } = jest.requireActual(
    '../src/helpers'
  )

  return {
    combineContainers: jest.fn(x =>
      mockLastCombineContainerUnary.mockImplementation(y =>
        combineContainers(x)(y)
      )
    ),
    resolveResponse: jest.fn(resolveResponse),
    preset: jest.fn(x =>
      mockLastPresetUnary.mockImplementation(y => preset(x)(y))
    ),
  }
})

import mockJest from 'jest-fetch-mock'

import { combineContainers, resolveResponse, preset } from '../src/helpers'
import { defaultContainer } from '../src/constants'
import { righttp } from '../src/righttp'

mockJest.enableMocks()

describe('righttp', () => {
  // https://github.com/jefflau/jest-fetch-mock
  // TODO: Request:
  //        - Making a valid fetch.
  //          - Spy on resolveResponse.
  //        - URL empty.
  //        - Response not OK.

  beforeEach(() => {
    fetch.resetMocks()
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
      // it('should', () => {
      //   fetch.mockResponseOnce('foo')
      //   expect(fetch('https://www.foo.com').then(x => x.text())).resolves.toBe(
      //     'foo'
      //   )
      // })
    })
  })
})
