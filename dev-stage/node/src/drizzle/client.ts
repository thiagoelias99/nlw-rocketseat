import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../env'
import { schema } from './schema'

export const pg = postgres(env.DATABASE_URL)
export const db = drizzle(pg, { schema })


/**
 * CMDs
 * npx drizzle-kit generate -> generate migrations
 * npx drizzle-kit migrate -> run migrations
 * npx drizzle-kit rollback -> rollback migrations
 */