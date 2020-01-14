export const commonHttpStatuses = [
  { status: 200, statusText: 'OK' },
  { status: 201, statusText: 'Created' },
  { status: 204, statusText: 'No Content' },
  { status: 304, statusText: 'Not Modified' },
  { status: 400, statusText: 'Bad Request' },
  { status: 401, statusText: 'Unauthorized' },
  { status: 403, statusText: 'Forbidden' },
  { status: 404, statusText: 'Not Found' },
  { status: 409, statusText: 'Conflict' },
  { status: 500, statusText: 'Internal Server Error' },
]

export const falsyValues = ['', 0, NaN, false, null, undefined]
export const valuesWithDifferentTypes = [
  '',
  () => {},
  Symbol('symbol'),
  true,
  undefined,
  {},
]

export const resolveAsMethodNameMap = {
  ArrayBuffer: 'arrayBuffer',
  Blob: 'blob',
  FormData: 'formData',
  JSON: 'json',
  Response: 'response',
  Text: 'text',
}
