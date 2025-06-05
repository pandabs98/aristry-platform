import {PrismaClient} from "../../generated/mongo-client/index.js"

const mongoClient = new PrismaClient();

const connectMongoDb = async()=>{
  try {
    await mongoClient.$connect();
    console.log("✅ Mongodb Connected with Prisma")
  } catch (error) {
    console.error("❌ Mongodb Connection Error", error);
    throw error;
  }
};

export {mongoClient, connectMongoDb}