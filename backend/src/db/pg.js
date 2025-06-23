import { PrismaClient } from "../../generated/postgres-client/index.js";

const pgClient = new PrismaClient();

const connectPostgress = async ()=>{
    try {
        await pgClient.$connect();
        console.log("✅ PostgresSQL connected With Prisma")
    } catch (error) {
        console.log("❌ PostgresSQL connection error:", error);
        throw error;
    }
}

export {pgClient, connectPostgress};