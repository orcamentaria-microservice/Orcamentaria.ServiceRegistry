import { Db, DeleteResult, FindCursor, InsertOneResult, ObjectId, UpdateResult, WithId } from "mongodb";
import ServiceModel from "../../orcamentaria.serviceregistry.domain/models/ServiceModel";
import StateEnum from "../../orcamentaria.serviceregistry.domain/enums/StateEnum";
import dayjs from "dayjs";

class ServiceRepository {
    private db: Db;
    private collectionName: string;

    constructor(db: Db) {
        this.db = db
        this.collectionName = "services";
    }

    async createService(service: ServiceModel) : Promise<InsertOneResult<ServiceModel>> {
        return await this.db.collection<ServiceModel>(this.collectionName).insertOne(service);
    }

    async updateHeartbeat(id: string) : Promise<UpdateResult<ServiceModel>> {
        return  await this.db.collection<ServiceModel>(this.collectionName).updateOne(
            { _id: new ObjectId(id) }, { 
            $set: { 
                lastHeartbeat: dayjs().toDate(),
                state: StateEnum.UP
            } });
    }

    updateExistsService(service: ServiceModel, id: ObjectId) : Promise<UpdateResult<ServiceModel>> {
        return this.db.collection<ServiceModel>(this.collectionName).updateOne(
            { _id: id }, 
            { $set: 
                { 
                    lastHeartbeat: dayjs().toDate(), 
                    baseUrl: service.baseUrl,
                    endpoints: service.endpoints,
                    state: StateEnum.UP,
                } 
            });
    }

    async getServicesByName(nameService: string) : Promise<FindCursor<WithId<ServiceModel>> | null> {
        return await this.db.collection<ServiceModel>(this.collectionName).find({ name: nameService });
    }

    async getServiceByNameAndBaseUrl(nameService: string, baseUrl: string) : Promise<WithId<ServiceModel> | null> {
        return await this.db.collection<ServiceModel>(this.collectionName).findOne({ name: nameService, baseUrl: baseUrl });
    }

    async getServicesUpAndStarting() : Promise<FindCursor<{ id: ObjectId; serviceName: string; lastHeartbeat: Date; }>> {
        const result = await this.db.collection<ServiceModel>(this.collectionName)
            .find({ $or: [ { state: StateEnum.UP }, { state: StateEnum.STARTING } ]  });

        return result.map(i => {
            return {
                id: i._id,
                serviceName: i.name,
                lastHeartbeat: i.lastHeartbeat
            }
        })
    }

    async getServicesDown() : Promise<FindCursor<{ id: ObjectId; serviceName: string; lastHeartbeat: Date; }>> {
        const result = await this.db.collection<ServiceModel>(this.collectionName).find({ state: StateEnum.DOWN });

        return result.map(i => {
            return {
                id: i._id,
                serviceName: i.name,
                lastHeartbeat: i.lastHeartbeat
            }
        })
    }
    
    async removeService(id: ObjectId) : Promise<DeleteResult> {
        return await this.db.collection<ServiceModel>(this.collectionName).deleteOne({ _id: id });
    }

    updateState(id: ObjectId, newState: StateEnum) : Promise<UpdateResult<ServiceModel>> {
        return this.db.collection<ServiceModel>(this.collectionName).updateOne({ _id: id }, { $set: { state: newState } });
    }

    async deleteService(id: ObjectId) : Promise<DeleteResult> {
        return await this.db.collection<ServiceModel>(this.collectionName).deleteOne({ _id: id });
    }
}

export default ServiceRepository;