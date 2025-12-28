import { MongoClient } from "mongodb";
import 'dotenv/config';
const url = MONGO;
const dbName = "first-project";
export const collectionName = "todo";
const client = new MongoClient(url);

export const connection = async () => {
    const connect = await client.connect();
    return await connect.db(dbName);
}