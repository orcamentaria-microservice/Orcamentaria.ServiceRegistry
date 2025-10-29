import { createContainer, asFunction, asValue, asClass } from "awilix";
import ServiceRepository from "../orcamentaria.serviceregistry.infrastructure/repositories/ServiceRepository";
import ServiceController from "./controllers/ServiceController";
import ServiceService from "../orcamentaria.serviceregistry.application/services/ServiceService";
import MongoContext from "../orcamentaria.serviceregistry.infrastructure/contexts/MongoContext";
import ServiceValidator from "../orcamentaria.serviceregistry.application/validators/ServiceValidator";
import EndpointValidator from "../orcamentaria.serviceregistry.application/validators/EndpointValidator";
import ServiceScheduler from "../orcamentaria.serviceregistry.application/schedulers/ServiceScheduler";
import LogServiceService from "../orcamentaria.serviceregistry.application/services/LogServiceService";
import LogServiceRepository from "../orcamentaria.serviceregistry.infrastructure/repositories/LogServiceRepository";
import AuthMiddleware from "../orcamentaria.serviceregistry.infrastructure/midlewares/AuthMidleware";
import RegisterScheduler from "../orcamentaria.serviceregistry.application/schedulers/RegisterScheduler";

export async function setupContainer() {
  const container = createContainer();

  const dbName = process.env.MONGO_DB!;
  const uri = process.env.MONGO_URI!;
  const mongoContext = new MongoContext(uri, dbName);

  await mongoContext.connect();
  const db = mongoContext.getDatabase();

  container.register({
    mongoContext: asValue(mongoContext),
    db: asValue(db),
    
    authMiddleware: asClass(AuthMiddleware).scoped(),
    
    serviceRepository: asFunction(({ db }) => new ServiceRepository(db)).transient(),
    logServiceRepository: asFunction(({ db }) => new LogServiceRepository(db)).transient(),

    serviceValidator: asClass(ServiceValidator).transient(),
    endpointValidator: asClass(EndpointValidator).transient(),
    
    logServiceService: asFunction(({ logServiceRepository }) => new LogServiceService(logServiceRepository)).scoped(),
    serviceService: asFunction(({ serviceRepository, serviceValidator, endpointValidator, logServiceService }) => 
      new ServiceService(serviceRepository, serviceValidator, endpointValidator, logServiceService)).scoped(),

    serviceController: asFunction(({ serviceService }) => new ServiceController(serviceService)).scoped(),

    serviceScheduler: asFunction(({ serviceRepository, logServiceService }) => new ServiceScheduler(serviceRepository, logServiceService)).scoped(),
    registerScheduler: asFunction(({ serviceService }) => new RegisterScheduler(serviceService)).scoped(),
  });

  return container;
}