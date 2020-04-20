import { isNonEmptyString } from '../src/utility'
import { valuesWithDifferentTypes } from './setup/constants'

describe('Utility', () => {
  describe('isNonEmptyString', () => {
    it('should return true for strings', () => {
      expect(isNonEmptyString('foo')).toBe(true)
    })

    it('should return false for empty strings', () => {
      expect(isNonEmptyString('')).toBe(false)
    })

    it('should return false for non strings', () => {
      valuesWithDifferentTypes
        .filter((x) => typeof x !== 'string')
        .forEach((x) => expect(isNonEmptyString(x)).toBe(false))
    })
  })
})
