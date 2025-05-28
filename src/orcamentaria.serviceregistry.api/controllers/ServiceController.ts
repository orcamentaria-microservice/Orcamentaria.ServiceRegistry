import { Request, Response } from "express";
import ServiceService from "../../orcamentaria.serviceregistry.application/services/ServiceService";

class ServiceController {

    private service: ServiceService;

  constructor(serviceService: ServiceService) {
    this.service = serviceService;
  }

  getServiceByServiceNameAndEndpointName = async (req: Request, res: Response) => {
    const result = await this.service.getServiceByServiceNameAndEndpointName(req);
    res.status(result.status).json(result);
  };

  getServiceByServiceName = async (req: Request, res: Response) => {
    const result = await this.service.getServiceByServiceName(req);
    res.status(result.status).json(result);
  };

  createService = async (req: Request, res: Response) => {
    const result = await this.service.createService(req.body);
    res.status(result.status).json(result);
  };

  heartbeat = async (req: Request, res: Response) => {
    const result = await this.service.heartbeat(req);
    res.status(result.status).json(result);
  };
}

export default ServiceController;