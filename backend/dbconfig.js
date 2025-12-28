import { MongoClient } from "mongodb";
import 'dotenv/config';
const url = process.env.MONGO;
if (!url) {
    console.error("ERROR: Missing 'MONGO' environment variable in .env file");
    process.exit(1); 
}
const dbName = "first-project";
export const collectionName = "todo";
const client = new MongoClient(url);

export const connection = async () => {
    const connect = await client.connect();
    return await connect.db(dbName);
}