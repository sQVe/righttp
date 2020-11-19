export type TNotNil =
  | Record<string, unknown>
  | bigint
  | boolean
  | number
  | string
  | symbol

export type TOnResponse = ((res: Response) => void) | null
export type TPayloadAs = ((payload: TNotNil) => BodyInit) | null
export type TResolveAs =
  | 'ArrayBuffer'
  | 'Blob'
  | 'FormData'
  | 'JSON'
  | 'Response'
  | 'Text'

export type TResolveMethod =
  | 'arrayBuffer'
  | 'blob'
  | 'formData'
  | 'json'
  | 'response'
  | 'text'

export type TInit = RequestInit & {
  method?:
    | 'CONNECT'
    | 'DELETE'
    | 'GET'
    | 'HEAD'
    | 'OPTIONS'
    | 'PATCH'
    | 'POST'
    | 'PUT'
    | 'TRACE'
}

export interface IOptions {
  payloadAs?: TPayloadAs
  resolveAs?: TResolveAs
  onResponse?: TOnResponse
}

export interface IContainer {
  init: TInit
  options: IOptions
  url: string
}

export interface IQueryParams {
  [key: string]: number | boolean | string
}
