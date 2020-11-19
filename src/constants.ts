import { IContainer } from './types'

export const defaultContainer: IContainer = {
  url: '',
  init: {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'GET',
  },
  options: {
    payloadAs: (x) => JSON.stringify(x),
    resolveAs: 'JSON',
  },
}
