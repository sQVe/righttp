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

export type ResponseResolve =
  | 'ArrayBuffer'
  | 'Blob'
  | 'FormData'
  | 'JSON'
  | 'Response'
  | 'Text'

export type ResolveMethod =
  | 'arrayBuffer'
  | 'blob'
  | 'formData'
  | 'json'
  | 'response'
  | 'text'

export type Init = RequestInit & {
  method?: HttpMethod,
}

export type Options = {
  resolveAs?: ResponseResolve,
}

export type Container = {
  init: Init,
  options: Options,
  url: string,
}

export type QueryParams = {
  [key: string]: string | number | boolean,
}
