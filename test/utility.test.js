import { compose, isString } from '../src/utility'
import { valuesWithDifferentTypes } from './setup/constants'

describe('Utility', () => {
  describe('compose', () => {
    it('should compose unary functions right to left', () => {
      expect(
        compose(
          x => x + 'qux',
          x => x + 'baz',
          x => x + 'bar'
        )('foo')
      ).toBe('foobarbazqux')
    })
  })

  describe('isString', () => {
    it('should return true for strings', () => {
      expect(isString('foo')).toBe(true)
    })

    it('should return false for non strings', () => {
      valuesWithDifferentTypes
        .filter(x => typeof x !== 'string')
        .forEach(x => expect(isString(x)).toBe(false))
    })
  })
})
