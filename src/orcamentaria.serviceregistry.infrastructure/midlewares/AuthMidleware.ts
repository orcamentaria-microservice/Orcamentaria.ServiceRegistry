import { Request, Response, NextFunction } from "express";
import ResponseErrorEnum from "../../orcamentaria.serviceregistry.domain/enums/ResponseErrorEnum";
import ResponseModel from "../../orcamentaria.serviceregistry.domain/models/ResponseModel";
import jwt, { JwtPayload } from "jsonwebtoken";

class AuthMiddleware {
    private readonly publicKey: string;

    constructor(publicKey: string) {
        this.publicKey = publicKey;
    }

    validateToken = (req: Request, res: Response, next: NextFunction): void => {
        const authHeader = req.headers["authorization"];

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(ResponseErrorEnum.Unauthorized).json(
                new ResponseModel(null, "Token de serviço ausente ou inválido.", ResponseErrorEnum.Unauthorized)
            );
            return;
        }

        const token = authHeader.slice(7);

        try {
            const decoded = jwt.verify(token, this.publicKey, {
                algorithms: ["RS256"],
                issuer: "orcamentaria.auth",
                audience: "orcamentaria.service",
            }) as JwtPayload;

            req.params.serviceName = decoded["name"];
            next();
        } catch {
            res.status(ResponseErrorEnum.Unauthorized).json(
                new ResponseModel(null, "Token de serviço ausente ou inválido.", ResponseErrorEnum.Unauthorized)
            );
        }
    }
}

export default AuthMiddleware;
