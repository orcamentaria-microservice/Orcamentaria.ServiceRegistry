import { createContainer, asValue, asClass, asFunction } from "awilix";
import { ObjectId, WithId, InsertOneResult, UpdateResult, DeleteResult, FindCursor } from "mongodb";
import ServiceModel from "../../src/orcamentaria.serviceregistry.domain/models/ServiceModel";
import ServiceRepository from "../../src/orcamentaria.serviceregistry.infrastructure/repositories/ServiceRepository";
import ServiceValidator from "../../src/orcamentaria.serviceregistry.application/validators/ServiceValidator";
import EndpointValidator from "../../src/orcamentaria.serviceregistry.application/validators/EndpointValidator";
import ServiceService from "../../src/orcamentaria.serviceregistry.application/services/ServiceService";
import ServiceController from "../../src/orcamentaria.serviceregistry.api/controllers/ServiceController";
import AuthMiddleware from "../../src/orcamentaria.serviceregistry.infrastructure/midlewares/AuthMidleware";
import StateEnum from "../../src/orcamentaria.serviceregistry.domain/enums/StateEnum";

class FakeCursor<T> {
    private readonly items: T[];
    constructor(items: T[]) { this.items = items; }
    async toArray(): Promise<T[]> { return [...this.items]; }
    [Symbol.asyncIterator]() {
        const items = [...this.items];
        let index = 0;
        return {
            next(): Promise<IteratorResult<T>> {
                if (index < items.length) {
                    return Promise.resolve({ value: items[index++], done: false as const });
                }
                return Promise.resolve({ value: undefined as unknown as T, done: true as const });
            }
        };
    }
}

function emptyUpdateResult(): UpdateResult<ServiceModel> {
    return { acknowledged: true, matchedCount: 0, modifiedCount: 0, upsertedCount: 0, upsertedId: null };
}

export class InMemoryServiceRepository {
    public readonly services: Array<WithId<ServiceModel>>;

    constructor(initialServices: Array<WithId<ServiceModel>> = []) {
        this.services = [...initialServices];
    }

    async createService(service: ServiceModel): Promise<InsertOneResult<ServiceModel>> {
        const id = new ObjectId();
        const withId = { ...service, _id: id };
        this.services.push(withId);
        return { acknowledged: true, insertedId: id };
    }

    async getServicesByName(nameService: string): Promise<FindCursor<WithId<ServiceModel>> | null> {
        const results = this.services.filter(s => s.name === nameService);
        return new FakeCursor(results) as unknown as FindCursor<WithId<ServiceModel>>;
    }

    async getServiceByNameAndBaseUrl(nameService: string, baseUrl: string): Promise<WithId<ServiceModel> | null> {
        return this.services.find(s => s.name === nameService && s.baseUrl === baseUrl) ?? null;
    }

    async updateHeartbeat(id: string): Promise<UpdateResult<ServiceModel>> {
        const idx = this.services.findIndex(s => s._id?.toString() === id);
        if (idx === -1) return emptyUpdateResult();
        this.services[idx].lastHeartbeat = new Date();
        this.services[idx].state = StateEnum.UP;
        return { acknowledged: true, matchedCount: 1, modifiedCount: 1, upsertedCount: 0, upsertedId: null };
    }

    async updateExistsService(service: ServiceModel, id: ObjectId): Promise<UpdateResult<ServiceModel>> {
        const idx = this.services.findIndex(s => s._id?.equals(id));
        if (idx === -1) return emptyUpdateResult();
        this.services[idx] = { ...this.services[idx], ...service };
        return { acknowledged: true, matchedCount: 1, modifiedCount: 1, upsertedCount: 0, upsertedId: null };
    }

    async getServicesUpAndStarting(): Promise<FindCursor<{ id: ObjectId; serviceName: string; lastHeartbeat: Date }>> {
        return new FakeCursor([]) as unknown as FindCursor<{ id: ObjectId; serviceName: string; lastHeartbeat: Date }>;
    }

    async getServicesDown(): Promise<FindCursor<{ id: ObjectId; serviceName: string; lastHeartbeat: Date }>> {
        return new FakeCursor([]) as unknown as FindCursor<{ id: ObjectId; serviceName: string; lastHeartbeat: Date }>;
    }

    updateState(): Promise<UpdateResult<ServiceModel>> { return Promise.resolve(emptyUpdateResult()); }
    deleteService(): Promise<DeleteResult> { return Promise.resolve({ acknowledged: true, deletedCount: 0 }); }
    removeService(): Promise<DeleteResult> { return Promise.resolve({ acknowledged: true, deletedCount: 0 }); }
}

const schedulerStub = {
    healthServiceValidate: () => { /* no-op in tests */ },
    removeServices: () => { /* no-op in tests */ },
};

const registerSchedulerStub = {
    startAsync: async () => { /* no-op in tests */ },
    register: async () => "",
    heartbeat: async () => { /* no-op in tests */ },
};

const logServiceStub = {
    createLog: async () => { /* no-op in tests */ },
};

export interface TestContainerOptions {
    publicKey: string;
    services?: Array<WithId<ServiceModel>>;
}

export function createTestContainer(options: TestContainerOptions) {
    const repo = new InMemoryServiceRepository(options.services ?? []);

    const container = createContainer();
    container.register({
        publicKey: asValue(options.publicKey),
        serviceRepository: asValue(repo as unknown as ServiceRepository),
        serviceValidator: asClass(ServiceValidator).transient(),
        endpointValidator: asClass(EndpointValidator).transient(),
        logServiceService: asValue(logServiceStub),
        serviceService: asFunction(({ serviceRepository, serviceValidator, endpointValidator, logServiceService }) =>
            new ServiceService(serviceRepository, serviceValidator, endpointValidator, logServiceService)
        ).scoped(),
        serviceController: asFunction(({ serviceService }) => new ServiceController(serviceService)).scoped(),
        authMiddleware: asValue(new AuthMiddleware(options.publicKey)),
        serviceScheduler: asValue(schedulerStub),
        registerScheduler: asValue(registerSchedulerStub),
    });

    return { container, repo };
}
