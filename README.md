# Xc - Express-like HTTP Client

Xc is a HTTP Client based on Fetch API which you can write with the Express-like syntax.

```ts
import { Xc } from 'xcjs'

const client = new Xc('https://ramen-api.dev/')

const json = await client
  .get('/shops/:shopId', (c) => {
    c.header('User-Agent', 'Xc')
    c.param('shopId', 'yoshimuraya')
  })
  .json<{ shop: { name: string } }>()

console.log(`You may like ${json.shop.name}`)
```

Or you can write shortly.

```ts
import { xc } from 'xcjs'

const json = await xc.get('https://ramen-api.dev/').json()
```

## Install

```
npm i xcjs
```

Or

```
yarn add xcjs
```

## Example

```ts
// Create an instance
const client = new Xc('https://httpbin.org')

// GET request with query params
const json = await client
  .get('/get', (c) => {
    c.query('page', '2')
    c.query('perPage', '10')
  })
  .json()

// POST request with JSON body
const text = await client
  .post('/post', (c) => {
    c.json({
      title: 'Hello!',
      body: 'I like a ramen.',
    })
  })
  .text()

// Or you can write shortly
await client.post('/post', {
  title: 'Hello!',
  body: 'I like a ramen.',
})

// PUT form data
const res = await client.put('/put', (c) => {
  c.body({
    id: '123',
    name: 'Xc',
  })
})

// Hook
const json = await xc
  .hook((res) => {
    if (res.status === 404) {
      return { error: 'No Ramen!' }
    }
  })
  .get('https://ramen-api.dev/not-found')
  .json()

console.log(json) // { error: 'No Ramen!' }
```

## Related Projects

- Express - <https://expressjs.com>
- Ky - <https://github.com/sindresorhus/ky>
- Ramen API - <https://github.com/yusukebe/ramen-api>

## Author

Yusuke Wada <https://github.com/yusukebe>

## License

MIT
