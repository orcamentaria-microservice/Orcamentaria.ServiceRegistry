import { describe, it, expect, beforeEach } from "vitest";
import { ObjectId, WithId } from "mongodb";
import { Request } from "express";
import ServiceService from "../../src/orcamentaria.serviceregistry.application/services/ServiceService";
import ServiceValidator from "../../src/orcamentaria.serviceregistry.application/validators/ServiceValidator";
import EndpointValidator from "../../src/orcamentaria.serviceregistry.application/validators/EndpointValidator";
import ServiceModel from "../../src/orcamentaria.serviceregistry.domain/models/ServiceModel";
import EndpointModel from "../../src/orcamentaria.serviceregistry.domain/models/EndpointModel";
import HttpMethodEnum from "../../src/orcamentaria.serviceregistry.domain/enums/HttpMethodEnum";
import StateEnum from "../../src/orcamentaria.serviceregistry.domain/enums/StateEnum";
import ResponseErrorEnum from "../../src/orcamentaria.serviceregistry.domain/enums/ResponseErrorEnum";
import { InMemoryServiceRepository } from "../helpers/createTestContainer";

const logServiceStub = { createLog: async () => { /* no-op */ } };

function buildService(
    name: string,
    baseUrl: string,
    endpointNames: string[],
    id?: ObjectId
): WithId<ServiceModel> {
    const endpoints = endpointNames.map(
        n => new EndpointModel(n, HttpMethodEnum.GET, `/${n.toLowerCase()}`)
    );
    const model = new ServiceModel(name, 1, baseUrl, StateEnum.UP, endpoints, new Date(), new Date());
    return { ...model, _id: id ?? new ObjectId() };
}

describe("ServiceService — validação de endpoints com for...of", () => {
    let repo: InMemoryServiceRepository;
    let service: ServiceService;

    beforeEach(() => {
        repo = new InMemoryServiceRepository();
        service = new ServiceService(
            repo as never,
            new ServiceValidator(),
            new EndpointValidator(),
            logServiceStub as never
        );
    });

    it("segundo endpoint sem route → retorna 422 e nada é gravado", async () => {
        const result = await service.createService({
            name: "PersonService",
            baseUrl: "http://person:8000",
            endpoints: [
                { name: "EmployeeInsert", method: "POST", route: "/employee" },
                { name: "EmployeeGet", method: "GET", route: "" },  // route vazia → inválida
            ],
            createAt: new Date(),
        });

        expect(result.Success).toBe(false);
        expect(result.Error?.ErrorCode).toBe(ResponseErrorEnum.ValidationFailed);
        expect(result.Error?.ErrorCode).toBe(422);
        expect(repo.services).toHaveLength(0);
    });

    it("endpoints válidos → grava o serviço com sucesso", async () => {
        const result = await service.createService({
            name: "PersonService",
            baseUrl: "http://person:8000",
            endpoints: [
                { name: "EmployeeInsert", method: "POST", route: "/employee" },
                { name: "EmployeeGet", method: "GET", route: "/employee/{id}" },
            ],
            createAt: new Date(),
        });

        expect(result.Success).toBe(true);
        expect(repo.services).toHaveLength(1);
    });
});

describe("ServiceService — getServiceByServiceNameAndEndpointName", () => {
    let repo: InMemoryServiceRepository;
    let service: ServiceService;

    beforeEach(() => {
        repo = new InMemoryServiceRepository([
            buildService("PersonService", "http://host-a:8001", ["EmployeeInsert"]),
            buildService("PersonService", "http://host-b:8002", ["EmployeeInsert", "EmployeeGetForService"]),
        ]);
        service = new ServiceService(
            repo as never,
            new ServiceValidator(),
            new EndpointValidator(),
            logServiceStub as never
        );
    });

    it("filtro por instância: só a instância B tem o endpoint → apenas B no resultado", async () => {
        const req = { params: { serviceName: "PersonService", endpointName: "EmployeeGetForService" } } as unknown as Request;
        const result = await service.getServiceByServiceNameAndEndpointName(req);

        expect(result.Success).toBe(true);
        const data = result.Data as Array<{ baseUrl: string; endpoints: Array<{ name: string }> }>;
        expect(data).toHaveLength(1);
        expect(data[0].baseUrl).toBe("http://host-b:8002");
        expect(data[0].endpoints[0].name).toBe("EmployeeGetForService");
    });

    it("nenhuma instância com o endpoint → 404 'Endpoint não encontrado.'", async () => {
        const req = { params: { serviceName: "PersonService", endpointName: "NaoExiste" } } as unknown as Request;
        const result = await service.getServiceByServiceNameAndEndpointName(req);

        expect(result.Success).toBe(false);
        expect(result.Error?.ErrorCode).toBe(ResponseErrorEnum.NotFound);
        expect(result.Message).toBe("Endpoint não encontrado.");
    });

    it("serviço inexistente → 404 'Serviço não encontrado.'", async () => {
        const req = { params: { serviceName: "NaoExiste", endpointName: "Qualquer" } } as unknown as Request;
        const result = await service.getServiceByServiceNameAndEndpointName(req);

        expect(result.Success).toBe(false);
        expect(result.Error?.ErrorCode).toBe(ResponseErrorEnum.NotFound);
        expect(result.Message).toBe("Serviço não encontrado.");
    });
});
