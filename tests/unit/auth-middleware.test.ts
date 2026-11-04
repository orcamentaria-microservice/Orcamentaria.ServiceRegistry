import { describe, it, expect, vi, beforeAll } from "vitest";
import { generateKeyPairSync } from "crypto";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import AuthMiddleware from "../../src/orcamentaria.serviceregistry.infrastructure/midlewares/AuthMidleware";
import ResponseErrorEnum from "../../src/orcamentaria.serviceregistry.domain/enums/ResponseErrorEnum";

describe("AuthMiddleware", () => {
    let publicKey: string;
    let privateKey: string;

    beforeAll(() => {
        const pair = generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: { type: "spki", format: "pem" },
            privateKeyEncoding: { type: "pkcs8", format: "pem" },
        });
        publicKey = pair.publicKey;
        privateKey = pair.privateKey;
    });

    function makeValidToken(payload: Record<string, unknown> = { name: "TestService" }) {
        return jwt.sign(payload, privateKey, {
            algorithm: "RS256",
            issuer: "orcamentaria.auth",
            audience: "orcamentaria.service",
            expiresIn: "1h",
        });
    }

    function makeReq(authorization?: string): Request {
        return { headers: { authorization }, params: {} } as unknown as Request;
    }

    function makeRes() {
        const jsonMock = vi.fn();
        const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
        const res = { status: statusMock, json: jsonMock } as unknown as Response;
        return { res, statusMock, jsonMock };
    }

    it("sem Authorization → next não chamado; resposta 401", () => {
        const middleware = new AuthMiddleware(publicKey);
        const req = makeReq(undefined);
        const { res, statusMock, jsonMock } = makeRes();
        const next: NextFunction = vi.fn();

        middleware.validateToken(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(ResponseErrorEnum.Unauthorized);
        expect(jsonMock).toHaveBeenCalledOnce();
        const body = jsonMock.mock.calls[0][0];
        expect(body.Error.ErrorName).toBe("Unauthorized");
        expect(body.Error.ErrorCode).toBe(401);
    });

    it("header sem prefixo 'Bearer ' → 401", () => {
        const middleware = new AuthMiddleware(publicKey);
        const req = makeReq("Token abc");
        const { res, statusMock, jsonMock } = makeRes();
        const next: NextFunction = vi.fn();

        middleware.validateToken(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledOnce();
    });

    it("token com assinatura inválida → 401", () => {
        const middleware = new AuthMiddleware(publicKey);
        // Sign with a different private key
        const { privateKey: otherPrivateKey } = generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: { type: "spki", format: "pem" },
            privateKeyEncoding: { type: "pkcs8", format: "pem" },
        });
        const token = jwt.sign({ name: "TestService" }, otherPrivateKey, {
            algorithm: "RS256",
            issuer: "orcamentaria.auth",
            audience: "orcamentaria.service",
        });
        const req = makeReq(`Bearer ${token}`);
        const { res, statusMock } = makeRes();
        const next: NextFunction = vi.fn();

        middleware.validateToken(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(401);
    });

    it("token com iss errado → 401", () => {
        const middleware = new AuthMiddleware(publicKey);
        const token = jwt.sign({ name: "TestService" }, privateKey, {
            algorithm: "RS256",
            issuer: "wrong.issuer",
            audience: "orcamentaria.service",
        });
        const req = makeReq(`Bearer ${token}`);
        const { res, statusMock } = makeRes();
        const next: NextFunction = vi.fn();

        middleware.validateToken(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(401);
    });

    it("token com aud errado → 401", () => {
        const middleware = new AuthMiddleware(publicKey);
        const token = jwt.sign({ name: "TestService" }, privateKey, {
            algorithm: "RS256",
            issuer: "orcamentaria.auth",
            audience: "orcamentaria.user",
        });
        const req = makeReq(`Bearer ${token}`);
        const { res, statusMock } = makeRes();
        const next: NextFunction = vi.fn();

        middleware.validateToken(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(401);
    });

    it("token expirado → 401", () => {
        const middleware = new AuthMiddleware(publicKey);
        const token = jwt.sign({ name: "TestService" }, privateKey, {
            algorithm: "RS256",
            issuer: "orcamentaria.auth",
            audience: "orcamentaria.service",
            expiresIn: -1,
        });
        const req = makeReq(`Bearer ${token}`);
        const { res, statusMock } = makeRes();
        const next: NextFunction = vi.fn();

        middleware.validateToken(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(401);
    });

    it("token válido → next() chamado; req.params.serviceName preenchido", () => {
        const middleware = new AuthMiddleware(publicKey);
        const token = makeValidToken({ name: "PersonService" });
        const req = makeReq(`Bearer ${token}`);
        const { res } = makeRes();
        const next: NextFunction = vi.fn();

        middleware.validateToken(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(req.params.serviceName).toBe("PersonService");
    });
});
