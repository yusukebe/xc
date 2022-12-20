import { Xc } from './xc'

const createInstance = (url?: string) => {
  return new Xc(url)
}

const xc = createInstance()

export { Xc, xc }
