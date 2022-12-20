import { Xc } from '../src'

const client = new Xc('https://ramen-api.dev/')

const data = await client
  .get('/shops/:shopId', (c) => {
    c.header('User-Agent', 'Xc')
    c.param('shopId', 'yoshimuraya')
  })
  .json<{ shop: { name: string } }>()

console.log(`You may like ${data.shop.name}`)
