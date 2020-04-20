export type NotNil = bigint | boolean | number | object | string | symbol

export type OnResponse = ((res: Response) => void) | null
export type PayloadAs = ((payload: NotNil) => BodyInit) | null
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
  method?:
    | 'CONNECT'
    | 'DELETE'
    | 'GET'
    | 'HEAD'
    | 'OPTIONS'
    | 'PATCH'
    | 'POST'
    | 'PUT'
    | 'TRACE';
}

export type Options = {
  payloadAs?: PayloadAs;
  resolveAs?: ResolveAs;
  onResponse?: OnResponse;
}

export type Container = {
  init: Init;
  options: Options;
  url: string;
}

export type QueryParams = {
  [key: string]: number | boolean | string;
}
