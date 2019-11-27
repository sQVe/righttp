type HttpMethod =
  | 'CONNECT'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'TRACE'

type RequestResolve =
  | 'ArrayBuffer'
  | 'Blob'
  | 'FormData'
  | 'JSON'
  | 'Response'
  | 'Text'

export type Init = RequestInit & {
  method?: HttpMethod,
}

export type Options = {
  resolveAs?: RequestResolve,
}

export type Container = {
  url: string,
  init: Init,
  options: Options,
}

export type QueryParams = {
  [key: string]: string | number | boolean,
}
