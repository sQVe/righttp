import { createQuery, sanitizeUrl } from '../src/helpers'

describe('Helpers', () => {
  describe('createQuery', () => {
    it('should return query string', () => {
      const query = createQuery({ foo: true, bar: 'baz' })

      expect(query).toBe('foo=true&bar=baz')
    })

    it('should return empty query', () => {
      ;[undefined, false, {}].forEach(x => {
        const query = createQuery(x)

        expect(query).toBe('')
      })
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
      ;[undefined, false, ''].forEach(x => {
        const url = sanitizeUrl(x)

        expect(url).toBe('')
      })
    })
  })
})
