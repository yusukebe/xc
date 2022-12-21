interface XcResponse extends Promise<Response> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: <T = any>() => Promise<T>
  text: () => Promise<string>
}

type Handler = ((c: Context) => Request | void) | Record<string, unknown>
type Hook = (res: Response) => unknown | undefined

class Context {
  private url: URL
  private method: string
  private contentType: string | undefined
  private _header: Headers = new Headers()
  private _body: BodyInit | undefined

  constructor({ url, method }: { url: URL; method: string }) {
    this.url = url
    this.method = method ?? 'GET'
  }

  request(body?: object | string) {
    const init: RequestInit = {
      method: this.method,
    }
    if (this._body) {
      init.body = this._body ?? (body as BodyInit)
    }
    if (this.contentType) {
      this._header.set('Content-Type', this.contentType)
    }
    init.headers = this._header
    return new Request(this.url, init)
  }

  query(key: string, value: string) {
    const searchParams = this.url.searchParams
    searchParams.append(key, value)
    this.url.search = searchParams.toString()
  }

  param(key: string, value: string) {
    let path = this.url.pathname
    const paths = path.split('/')
    const reg = new RegExp(':' + key)
    for (const p of paths) {
      if (reg.test(p)) {
        path = path.replace(p, value)
        this.url.pathname = path
        break
      }
    }
  }

  header(key: string, value: string) {
    this._header.set(key, value)
  }

  json(data: unknown) {
    this._body = JSON.stringify(data)
    this.contentType = 'application/json'
  }

  body(data: Record<string, string>) {
    const fd = new FormData()
    for (const [k, v] of Object.entries(data)) {
      fd.append(k, v)
    }
    this._body = fd
  }
}

const METHODS = ['get', 'post', 'put', 'delete', 'head', 'path'] as const
function defineDynamicClass(): {
  new (): {
    [K in typeof METHODS[number]]: (path: string, handler?: Handler) => XcResponse
  }
} {
  return class {} as never
}

export class Xc extends defineDynamicClass() {
  private url?: URL
  private _hook?: Hook

  constructor(urlString?: string) {
    super()
    if (urlString) {
      this.url = new URL(urlString)
    }
    ;[...METHODS].map((method) => {
      this[method] = (path: string, handler?: Handler) => this.on(method, path, handler)
    })
  }

  on(method: string, path: string, handler?: Handler): XcResponse {
    if (this.url) {
      this.url.pathname = path
    } else {
      this.url = new URL(path)
    }

    const c = new Context({ url: this.url, method })

    let request: Request

    if (typeof handler === 'function') {
      const r = handler(c)
      request = r instanceof Request ? r : c.request(handler)
    } else {
      if (typeof handler === 'object') {
        c.json(handler)
        request = c.request()
      } else {
        request = c.request(handler)
      }
    }

    const fn = async (request: Request): Promise<Response> => {
      const response = await fetch(request)

      if (this._hook) {
        const hookResponse = this._hook(response)

        if (hookResponse instanceof Response) {
          return hookResponse
        }

        const init = {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...response.headers,
          },
        }

        if (typeof hookResponse === 'object') {
          const newResponse = new Response(JSON.stringify(hookResponse), init)
          newResponse.headers.set('Content-Type', 'application/json')
          return newResponse
        } else if (typeof hookResponse === 'string') {
          const newResponse = new Response(hookResponse, init)
          newResponse.headers.set('Content-Type', 'text/plain')
          return newResponse
        }
      }

      if (response.status >= 300) {
        throw new Error(await response.text())
      }
      return response
    }

    const result = fn(request) as XcResponse

    for (const type of ['json', 'text'] as const) {
      result[type] = async () => {
        const response = await result
        return response[type]()
      }
    }
    return result
  }

  hook(hook: Hook): Xc {
    this._hook = hook
    return this
  }
}
