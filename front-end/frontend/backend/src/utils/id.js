import { randomUUID } from 'crypto'

export const nanoid = () => randomUUID().replace(/-/g, '').slice(0, 12)

