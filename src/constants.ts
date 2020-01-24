import { Container } from './types'

export const defaultContainer: Container = {
  url: '',
  init: {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'GET',
  },
  options: {
    payloadAs: payload => JSON.stringify(payload),
    resolveAs: 'JSON',
  },
}
