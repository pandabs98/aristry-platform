import dotenv from 'dotenv'
import app from "./app.js";
import {connectMongoDb} from "./db/mongo.js";
import { connectPostgress } from './db/pg.js';

dotenv.config()

const port = process.env.PORT || 5001;

const startServer = async()=>{
    try {
        await connectMongoDb();
        await connectPostgress();

        console.log("🚀 Both DBs connected Successfully. Now start your app here.");
        app.listen(port,()=>{
            console.log(`server is running on port http://localhost:${port}`)
        })

    } catch (error) {
        console.error("❌ Server failed to start:", err)
    }
}

startServer();
