// import Database from "better-sqlite3";
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

import { env } from "@/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
// const globalForDb = globalThis as unknown as {
//   conn: Database.Database | undefined;
// };

const client = createClient({ url: env.DATABASE_URL, authToken: 'DATABASE_AUTH_TOKEN' });

// export const conn =
//   globalForDb.conn ?? new Database(env.DATABASE_URL, { fileMustExist: false });
// if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(client, { schema });
