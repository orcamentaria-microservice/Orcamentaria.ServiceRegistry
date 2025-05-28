import { Router } from "express";
import ServiceController from "../controllers/ServiceController";

interface createServiceRoutesProps {
    serviceController: ServiceController
}

export default function createServiceRoutes({ serviceController } : createServiceRoutesProps) {
    const router = Router();

    router.get("/get/:serviceName/:endpointName", serviceController.getServiceByServiceNameAndEndpointName);
    router.get("/get/:serviceName", serviceController.getServiceByServiceName);
    router.post("/create", serviceController.createService);
    router.put("/heartbeat/:name", serviceController.heartbeat);
    
    return router;
}

