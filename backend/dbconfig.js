import { MongoClient } from "mongodb";
const url = "mongodb+srv://admin:1JVCCTYRyZamtpQm@cluster0.bzu76lp.mongodb.net/?appName=Cluster0";
const dbName = "first-project";
export const collectionName = "todo";
const client = new MongoClient(url);

export const connection = async () => {
    const connect = await client.connect();
    return await connect.db(dbName);
}