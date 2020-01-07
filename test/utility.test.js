import { compose } from '../src/utility'

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

  describe('isString', () => {})
})
