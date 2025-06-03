import { Request, Response, NextFunction } from "express";
import ResponseErrorEnum from "../../orcamentaria.serviceregistry.domain/enums/ResponseErrorEnum";
import ResponseModel from "../../orcamentaria.serviceregistry.domain/models/ResponseModel";
import  jwt, { JwtPayload } from "jsonwebtoken";
import fs from 'fs';
import path from 'path';

class AuthMiddleware {

    validateToken(req: Request, res: Response, next: NextFunction)  {
        const token = req.headers["authorization"];
        if(!token)
            res.status(ResponseErrorEnum.AccessDenied).send(res.send(new ResponseModel({}, "", ResponseErrorEnum.AccessDenied)));

        try {
            const publicKey = fs.readFileSync(path.join(process.cwd(), 'public_key_service.pem'), 'utf8');

            const decoded = jwt.verify(token?.replace("Bearer ", "")!, publicKey, {
              algorithms: ['RS256'],
              issuer: 'orcamentaria.auth',
              audience: 'orcamentaria.service',
            }) as JwtPayload;

            req.params.serviceName = decoded["name"];

            next();
        } catch (error) {
            res.send(new ResponseModel({}, "", ResponseErrorEnum.AccessDenied));
            return;
        }
    }
}

export default AuthMiddleware;