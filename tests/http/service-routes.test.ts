import { describe, it, expect, beforeAll } from "vitest";
import { generateKeyPairSync } from "crypto";
import jwt from "jsonwebtoken";
import request from "supertest";
import { ObjectId, WithId } from "mongodb";
import { createApp } from "../../src/orcamentaria.serviceregistry.api/app";
import { createTestContainer } from "../helpers/createTestContainer";
import ServiceModel from "../../src/orcamentaria.serviceregistry.domain/models/ServiceModel";
import EndpointModel from "../../src/orcamentaria.serviceregistry.domain/models/EndpointModel";
import HttpMethodEnum from "../../src/orcamentaria.serviceregistry.domain/enums/HttpMethodEnum";
import StateEnum from "../../src/orcamentaria.serviceregistry.domain/enums/StateEnum";

let publicKey: string;
let privateKey: string;

function makeValidServiceToken(name = "TestService") {
    return jwt.sign({ name }, privateKey, {
        algorithm: "RS256",
        issuer: "orcamentaria.auth",
        audience: "orcamentaria.service",
        expiresIn: "1h",
    });
}

function buildService(
    name: string,
    baseUrl: string,
    endpointNames: string[],
): WithId<ServiceModel> {
    const endpoints = endpointNames.map(
        n => new EndpointModel(n, HttpMethodEnum.GET, `/${n.toLowerCase()}`)
    );
    const model = new ServiceModel(name, 1, baseUrl, StateEnum.UP, endpoints, new Date(), new Date());
    return { ...model, _id: new ObjectId() };
}

beforeAll(() => {
    const pair = generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    publicKey = pair.publicKey;
    privateKey = pair.privateKey;
});

describe("POST /api/v1/service/register", () => {
    it("sem Authorization → 401, ErrorName Unauthorized", async () => {
        const { container } = createTestContainer({ publicKey });
        const app = await createApp(container);

        const res = await request(app)
            .post("/api/v1/service/register")
            .send({ name: "Svc", baseUrl: "http://svc:80", endpoints: [] });

        expect(res.status).toBe(401);
        expect(res.body.Success).toBe(false);
        expect(res.body.Error.ErrorName).toBe("Unauthorized");
        expect(res.body.Pagination).toBeNull();
    });

    it("token com aud errado → 401", async () => {
        const { container } = createTestContainer({ publicKey });
        const app = await createApp(container);

        const wrongToken = jwt.sign({ name: "Svc" }, privateKey, {
            algorithm: "RS256",
            issuer: "orcamentaria.auth",
            audience: "orcamentaria.user",
        });

        const res = await request(app)
            .post("/api/v1/service/register")
            .set("Authorization", `Bearer ${wrongToken}`)
            .send({ name: "Svc", baseUrl: "http://svc:80", endpoints: [] });

        expect(res.status).toBe(401);
        expect(res.body.Error.ErrorName).toBe("Unauthorized");
    });

    it("token válido + segundo endpoint sem route → 422 e nada gravado", async () => {
        const { container, repo } = createTestContainer({ publicKey });
        const app = await createApp(container);
        const token = makeValidServiceToken("PersonService");

        const res = await request(app)
            .post("/api/v1/service/register")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "PersonService",
                baseUrl: "http://person:8000",
                endpoints: [
                    { name: "EmployeeInsert", method: "POST", route: "/employee" },
                    { name: "EmployeeGet", method: "GET", route: "" },
                ],
            });

        expect(res.status).toBe(422);
        expect(res.body.Success).toBe(false);
        expect(repo.services).toHaveLength(0);
    });
});

describe("GET /api/v1/service/:serviceName/:endpointName", () => {
    it("2 instâncias, só B tem o endpoint → só B no resultado", async () => {
        const preloaded = [
            buildService("PersonService", "http://host-a:8001", ["EmployeeInsert"]),
            buildService("PersonService", "http://host-b:8002", ["EmployeeInsert", "EmployeeGetForService"]),
        ];
        const { container } = createTestContainer({ publicKey, services: preloaded });
        const app = await createApp(container);

        const res = await request(app)
            .get("/api/v1/service/PersonService/EmployeeGetForService");

        expect(res.status).toBe(200);
        expect(res.body.Success).toBe(true);
        const data = res.body.Data as Array<{ baseUrl: string }>;
        expect(data).toHaveLength(1);
        expect(data[0].baseUrl).toBe("http://host-b:8002");
    });

    it("serviço inexistente → 404", async () => {
        const { container } = createTestContainer({ publicKey });
        const app = await createApp(container);

        const res = await request(app)
            .get("/api/v1/service/NaoExiste/Qualquer");

        expect(res.status).toBe(404);
        expect(res.body.Success).toBe(false);
        expect(res.body.Message).toBe("Serviço não encontrado.");
    });
});
