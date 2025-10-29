import { Request, Response, response } from "express";
import ServiceService from "../../orcamentaria.serviceregistry.application/services/ServiceService";

class ServiceController {

  private service: ServiceService;

  constructor(serviceService: ServiceService) {
    this.service = serviceService;
  }

  getServiceByServiceNameAndEndpointName = async (req: Request, res: Response) => {
    const result = await this.service.getServiceByServiceNameAndEndpointName(req);
    res.status(200).json(result);
  };

  getServiceByServiceName = async (req: Request, res: Response) => {
    const result = await this.service.getServiceByServiceName(req);
    res.status(200).json(result);
  };

  registerService = async (req: Request, res: Response) => {
    const result = await this.service.createService(req.body);
    res.status(200).json(result);
  };

  heartbeat = async (req: Request, res: Response) => {
    const result = await this.service.heartbeat(req.params.serviceId);
    res.status(200).json(result);
  };
}

export default ServiceController;