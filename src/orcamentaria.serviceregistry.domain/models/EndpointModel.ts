import { RequestHandler } from "express";
import HttpMethodEnum from "../enums/HttpMethodEnum";

class EndpointModel {
    name: string;
    method: HttpMethodEnum;
    route: string;
    action?: RequestHandler
    middleware?: RequestHandler | RequestHandler[];

    constructor(name: string, method: HttpMethodEnum, route: string, action?: RequestHandler, middleware?: RequestHandler | RequestHandler[]) {
        this.name = name;
        this.method = !method ? HttpMethodEnum.INVALID : method;
        this.route = route;
        this.action = action;
        this.middleware = middleware;
    }
}

export default EndpointModel;