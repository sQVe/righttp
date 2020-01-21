export type NotNil = bigint | boolean | number | object | string | symbol

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

type PayloadAsCallback = (payload: NotNil) => NotNil
export type PayloadAs = PayloadAsCallback | null

export type ResolveAs =
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
  payloadAs?: PayloadAs,
  resolveAs?: ResolveAs,
}

export type Container = {
  init: Init,
  options: Options,
  url: string,
}

export type QueryParams = {
  [key: string]: string | number | boolean,
}
