/* eslint-disable */

type Params = {
  [key: string]: string
}

type StatusCallbacks = {
  [key: string]: (res: Response) => void
}

interface Init extends RequestInit {
  method: Method
  onStatus?: StatusCallbacks
  responseAs: ResponseAs
}

export enum Method {
  connect = 'CONNECT',
  delete = 'DELETE',
  get = 'GET',
  head = 'HEAD',
  options = 'OPTIONS',
  patch = 'PATCH',
  post = 'POST',
  put = 'PUT',
  trace = 'TRACE',
}

export enum ResponseAs {
  arrayBuffer = 'arrayBuffer',
  blob = 'blob',
  formData = 'formData',
  json = 'json',
  response = 'response',
  text = 'text',
}

export class Http {
  private _url: string
  private _init: Init

  constructor(url = '', init: Partial<Init> = {}) {
    this._url = this._urlGuard(url)
    this._init = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: Method.get,
      responseAs: ResponseAs.json,
      ...init,
    }
  }

  public get url() {
    return this._url
  }

  public get init() {
    return this._init
  }

  public delete(url = '', data?: object): Promise<any> {
    return this.request(url, {
      method: Method.delete,
      body: this._preparePayload(data),
    })
  }

  public get(url = '', params?: Params): Promise<any> {
    return this.request(
      this._urlGuard(url, true) +
        (params == null ? '' : this._combineToQuery(params))
    )
  }

  public patch(url = '', data: object): Promise<any> {
    return this.request(url, {
      method: Method.patch,
      body: this._preparePayload(data),
    })
  }

  public post(url = '', data: object): Promise<any> {
    return this.request(url, {
      method: Method.post,
      body: this._preparePayload(data),
    })
  }

  public put(url = '', data: object): Promise<any> {
    return this.request(url, {
      method: Method.put,
      body: this._preparePayload(data),
    })
  }

  public async request(url: string = '', init?: Partial<Init>): Promise<any> {
    const [reqUrl, reqInit] = this._applyDefaults(url, init)

    if (reqUrl.length === 0)
      throw new Error('Http needs an URL to make an request')

    const res = await fetch(reqUrl, reqInit)

    this._handleStatus(res)
    if (res.ok) {
      return reqInit.responseAs === 'response'
        ? res
        : this._parseResponse(res, reqInit.responseAs)
    }
    throw res
  }

  public fork(fragment?: string, init?: Partial<Init>): Http {
    return new Http(this._url + this._urlGuard(fragment, true), init)
  }

  private _applyDefaults(url = '', init: Partial<Init> = {}): [string, Init] {
    return [
      this.url + this._urlGuard(url, true),
      { ...this.init, ...init } as Init,
    ]
  }

  private _combineToQuery(params: Params): string {
    const arr = Object.keys(params).map(
      k => k + '=' + encodeURIComponent(params[k])
    )

    return '?' + arr.join('&')
  }

  private get _currentContentType(): string | undefined {
    return this._init.headers && this._init.headers['Content-Type']
  }

  private _handleStatus(res: Response): boolean {
    const onStatus = this._init.onStatus || {}

    const isInStatusRange = (key: string): boolean => {
      const range = key.split('-')

      return (
        range.length > 1 && +range[0] < res.status && +range[1] > res.status
      )
    }

    return Object.keys(onStatus)
      .map(key => {
        if (onStatus[res.status] || isInStatusRange(key)) {
          onStatus[key](res)
          return true
        }
        return false
      })
      .some(Boolean)
  }

  private async _parseResponse(
    res: Response,
    parseMethod: ResponseAs
  ): Promise<any> {
    switch (parseMethod) {
      // TODO: HtmlDocument?
      case 'json':
        const text = await res.clone().text()

        if (text.length > 0) return res.json()
        return {}
      default:
        return res[parseMethod]()
    }
  }

  private _urlGuard(url = '', isFragment = false): string {
    const addTrailingSlash = (x: string) => (x.endsWith('/') ? x : x + '/')
    const removeLeadingSlash = (x: string) =>
      x.startsWith('/') ? x.substring(1) : x

    if (url.length === 0) return ''
    if (isFragment) url = removeLeadingSlash(url)
    return addTrailingSlash(url)
  }

  private _preparePayload(data): any {
    switch (this._currentContentType) {
      case 'application/json':
        return JSON.stringify(data)
      case 'application/x-www-form-urlencoded':
        return this._combineToQuery(data).substr(1)
      default:
        return data
    }
  }
}
