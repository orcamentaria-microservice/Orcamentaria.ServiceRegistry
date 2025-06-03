import { Router } from "express";
import ServiceController from "../controllers/ServiceController";
import AuthMiddleware from "../../orcamentaria.serviceregistry.infrastructure/midlewares/AuthMidleware";

interface createServiceRoutesProps {
    serviceController: ServiceController
    authMiddleware: AuthMiddleware
}

export default function createServiceRoutes({ serviceController, authMiddleware } : createServiceRoutesProps) {
    const router = Router();

    router.get("/:serviceName/:endpointName", serviceController.getServiceByServiceNameAndEndpointName);
    router.get("/:serviceName", authMiddleware.validateToken, serviceController.getServiceByServiceName);
    router.post("/register", authMiddleware.validateToken, serviceController.registerService);
    router.put("/heartbeat", authMiddleware.validateToken, serviceController.heartbeat);
    
    return router;
}

