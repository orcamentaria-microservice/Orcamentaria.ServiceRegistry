import { MongoClient, Db, ServerApiVersion } from "mongodb";

class MongoContext {

    private client: MongoClient;
    private db: Db | null;
    private dbName: string;

    constructor(uri: string, dbName: string) {
      this.dbName = dbName;
      this.client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });

      this.db = null;
    }
  
    async connect(): Promise<void> {
      this.client = await this.client.connect();
    }
  
    getDatabase(): Db {
      if (!this.db) {
        this.db = this.client.db(this.dbName)
      }
      return this.db;
    }
  
    async disconnect(): Promise<void> {
      await this.client.close();
    }
}

export default MongoContext