import { Router } from "express";
import ServiceController from "../controllers/ServiceController";
import AuthMiddleware from "../../orcamentaria.serviceregistry.infrastructure/midlewares/AuthMidleware";

interface createServiceRoutesProps {
    serviceController: ServiceController
    authMiddleware: AuthMiddleware
}

export default function createServiceRoutes({ serviceController, authMiddleware } : createServiceRoutesProps) {
    const router = Router();

    router.get("/get/:serviceName/:endpointName", authMiddleware.validateToken, serviceController.getServiceByServiceNameAndEndpointName);
    router.get("/get/:serviceName", authMiddleware.validateToken, serviceController.getServiceByServiceName);
    router.post("/create", authMiddleware.validateToken, serviceController.createService);
    router.put("/heartbeat", authMiddleware.validateToken, serviceController.heartbeat);
    
    return router;
}

