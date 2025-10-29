import { Router } from "express";
import ServiceController from "../controllers/ServiceController";
import AuthMiddleware from "../../orcamentaria.serviceregistry.infrastructure/midlewares/AuthMidleware";
import { CreateNamedRoutes } from "../../orcamentaria.serviceregistry.infrastructure/helpers/RouteHelper";
import ServiceRouteModel from "../../orcamentaria.serviceregistry.domain/models/ServiceRouteModel";
import EndpointModel from "../../orcamentaria.serviceregistry.domain/models/EndpointModel";
import HttpMethodEnum from "../../orcamentaria.serviceregistry.domain/enums/HttpMethodEnum";

interface createServiceRoutesProps {
    serviceController: ServiceController
    authMiddleware: AuthMiddleware
}

export default function createServiceRoutes({ serviceController, authMiddleware } : createServiceRoutesProps) {
    const router = Router();
    
    const ServiceRoute = new ServiceRouteModel("Service", "/api/v1/service", [
        new EndpointModel("ServiceGetByNameAndEndpoint", HttpMethodEnum.GET, "/:serviceName/:endpointName", serviceController.getServiceByServiceNameAndEndpointName),
        new EndpointModel("ServiceGetByName", HttpMethodEnum.GET, "/:serviceName", serviceController.getServiceByServiceName),
        new EndpointModel("ServiceRegister", HttpMethodEnum.POST, "/register", serviceController.registerService, authMiddleware.validateToken),
        new EndpointModel("ServiceHeartbeat", HttpMethodEnum.PUT, "/heartbeat/:serviceId", serviceController.heartbeat, authMiddleware.validateToken),
    ]);

    CreateNamedRoutes(router, ServiceRoute);

    return router;
}
  