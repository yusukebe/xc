import fetchMock from 'fetch-mock'
import { Xc } from '../src/xc'

Object.assign(fetchMock.config, { Headers, Request, Response, fetch, ReadableStream })

fetchMock.get('http://localhost/', { message: 'Hello!' })
fetchMock.post(
  {
    url: 'http://localhost/posts',
    headers: { Authorization: 'TOKEN', 'Content-Type': 'application/json' },
  },
  { message: 'Hello!' }
)

describe('Basic', () => {
  const client = new Xc('http://localhost/')
  it('GET /', async () => {
    const res = await client.get('/')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ message: 'Hello!' })
  })

  it('POST /posts', async () => {
    const res = await client.post('/posts', (req) => {
      req.header('Authorization', 'TOKEN')
      req.json({ foo: 'bar' })
    })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ message: 'Hello!' })
  })
})
