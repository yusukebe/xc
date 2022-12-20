# Xc - Express-like HTTP Client

Xc is a HTTP Client based on Fetch API which you can write with the Express-like syntax.

```ts
import { Xc } from 'xcjs'

const client = new Xc('https://ramen-api.dev/')

const data = await client
  .get('/shops/:shopId', (c) => {
    c.header('User-Agent', 'Xc')
    c.param('shopId', 'yoshimuraya')
  })
  .json<{ shop: { name: string } }>()

console.log(`You may like ${data.shop.name}`)
```

Or you can write shortly.

```ts
import { xc } from 'xcjs'

const data = xc('https://ramen-api.dev/').json()
```

## Related Projects

- Express - <https://expressjs.com>
- Ky - <https://github.com/sindresorhus/ky>
- Ramen API - <https://github.com/yusukebe/ramen-api>

## Author

Yusuke Wada <https://github.com/yusukebe>

## License

MIT
