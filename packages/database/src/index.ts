import { PrismaClient } from "./generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

let _client: PrismaClient | undefined;

function getClient(): PrismaClient {
  if (!_client) {
    const url = process.env.DATABASE_URL;
    console.log("[Database] DATABASE_URL:", url ? "ADA ✅" : "TIDAK ADA ❌");
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    _client = new PrismaClient({ adapter });
    console.log("[Database] client dibuat ✅");
  }
  return _client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop: string | symbol) {
    return (getClient() as any)[prop];
  },
});

export * from "./generated/prisma";
