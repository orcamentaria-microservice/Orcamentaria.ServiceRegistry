import { Db, FindCursor, InsertOneResult } from "mongodb";
import StateEnum from "../../orcamentaria.serviceregistry.domain/enums/StateEnum";
import LogServiceModel from "../../orcamentaria.serviceregistry.domain/models/LogServiceModel";

class LogServiceRepository {
    private db: Db;
    private collectionName: string;

    constructor(db: Db) {
        this.db = db
        this.collectionName = "log-services";
    }

    async createLog(logService: LogServiceModel) : Promise<InsertOneResult<LogServiceModel>> {
        return await this.db.collection<LogServiceModel>(this.collectionName).insertOne(logService);
    }

    async getLogService() : Promise<FindCursor<LogServiceModel>> {
        return await this.db.collection<LogServiceModel>(this.collectionName).find({ state: StateEnum.UP });
    }

    async getLogServiceByServiceName(serviceName: string) : Promise<FindCursor<LogServiceModel>> {
        return await this.db.collection<LogServiceModel>(this.collectionName).find({ serviceName: serviceName });
    }
}

export default LogServiceRepository;