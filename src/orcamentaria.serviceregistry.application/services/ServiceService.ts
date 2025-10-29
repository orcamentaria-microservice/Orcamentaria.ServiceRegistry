import dayjs from "dayjs";
import { Request } from "express";
import { ObjectId } from "mongodb";
import ServiceRepository from "../../orcamentaria.serviceregistry.infrastructure/repositories/ServiceRepository";
import ServiceModel from "../../orcamentaria.serviceregistry.domain/models/ServiceModel";
import ServiceValidator from "../validators/ServiceValidator";
import CreateServiceDTO from "../../orcamentaria.serviceregistry.domain/dtos/CreateServiceDTO";
import EndpointModel from "../../orcamentaria.serviceregistry.domain/models/EndpointModel";
import ResponseServiceDTO from "../../orcamentaria.serviceregistry.domain/dtos/ResponseServiceDTO";
import HttpMethodEnum from "../../orcamentaria.serviceregistry.domain/enums/HttpMethodEnum";
import EndpointValidator from "../validators/EndpointValidator";
import ResponseModel from "../../orcamentaria.serviceregistry.domain/models/ResponseModel";
import ResponseErrorEnum from "../../orcamentaria.serviceregistry.domain/enums/ResponseErrorEnum";
import StateEnum from "../../orcamentaria.serviceregistry.domain/enums/StateEnum";
import LogServiceService from "./LogServiceService";
import LogServiceModel from "../../orcamentaria.serviceregistry.domain/models/LogServiceModel";
import LogTypeEnum from "../../orcamentaria.serviceregistry.domain/enums/LogTypeEnum";

class ServiceService {

    private _repository: ServiceRepository;
    private _validator: ServiceValidator;
    private _validatorEndpoint: EndpointValidator;
    private _logServiceService: LogServiceService;
    
    constructor(
        serviceRepository: ServiceRepository,
        validatorRepository: ServiceValidator,
        validatorEndpoint: EndpointValidator,
        logServiceService: LogServiceService
    ) {
        this._repository = serviceRepository;
        this._validator = validatorRepository;
        this._validatorEndpoint = validatorEndpoint;
        this._logServiceService = logServiceService;
    }

    async getServiceByServiceName(req: Request) : Promise<ResponseModel>  {
        const cursor = await this._repository.getServicesByName(req.params.serviceName);

        if(!cursor)
            return new ResponseModel(null, "Serviço não encontrado.", ResponseErrorEnum.NotFound);

        const services = await cursor.toArray();

        if (services.length === 0)
            return new ResponseModel(null, "Serviço não encontrado.", ResponseErrorEnum.NotFound);

        return new ResponseModel(
            services.map((service: ServiceModel) => {
                return new ResponseServiceDTO(
                    service._id!,
                    service.order,
                    service.name, 
                    service.baseUrl,
                    service.state,
                    service.endpoints
                )
            }));
    }

    async getServiceByServiceNameAndEndpointName(req: Request) : Promise<ResponseModel>  {
        const cursor = await this._repository.getServicesByName(req.params.serviceName);

        if(!cursor)
            return new ResponseModel(null, "Serviço não encontrado.", ResponseErrorEnum.NotFound);

        const services = await cursor.toArray();

        if (services.length === 0)
            return new ResponseModel(null, "Serviço não encontrado.", ResponseErrorEnum.NotFound);

        const endpoint = services[0].endpoints.filter((i: EndpointModel) => i.name == req.params.endpointName)[0];

        if(!endpoint)
            return new ResponseModel(null, "Endpoint não encontrado.", ResponseErrorEnum.NotFound);

        var t = new ResponseModel(
            services.map((service: ServiceModel) => {
                return new ResponseServiceDTO(
                    service._id!,
                    service.order,
                    service.name, 
                    service.baseUrl,
                    service.state,
                    [endpoint]
                )
            }));

        return t;
    }

    async createService(dto: CreateServiceDTO) : Promise<ResponseModel> {

        var entity = new ServiceModel(
            dto.name, 1, dto.baseUrl, StateEnum.STARTING, 
            dto.endpoints.map(i => new EndpointModel(
                i.name, 
                HttpMethodEnum[i.method], 
                i.route)), dayjs().toDate(), dayjs().toDate()
        );

        const messageErrorService = await this._validator.validateBeforeInsert(entity);
        if(!!messageErrorService)
            return new ResponseModel(null, messageErrorService, ResponseErrorEnum.ValidationFailed);
        
        entity.endpoints.forEach(async endpoint => {
            const messageErrorEndpoint = await this._validatorEndpoint.validateBeforeInsert(endpoint);
            if(messageErrorEndpoint)
                return new ResponseModel(null, messageErrorEndpoint, ResponseErrorEnum.ValidationFailed);
        })

        try {
            const exists = await this._repository.getServiceByNameAndBaseUrl(dto.name, dto.baseUrl);

            if(exists) {
                await this.updateExistsService(entity, exists._id);
                this._logServiceService.createLog(new LogServiceModel(exists._id,  exists.name, LogTypeEnum.UPDATED, exists, entity));
                return new ResponseModel(exists._id);
            }

            const cursor = await this._repository.getServicesByName(dto.name);

            if(cursor) {
                var count = (await cursor.toArray()).length + 1;
                entity.order = count;
            }
            
            var result = await this._repository.createService(entity);
            this._logServiceService.createLog(new LogServiceModel(result.insertedId, entity.name, LogTypeEnum.CREATED, {}, entity));
            return new ResponseModel(result.insertedId)
        } catch (error) {
            return new ResponseModel(error, "", ResponseErrorEnum.InternalError);
        }
    }

    async updateExistsService(model: ServiceModel, id: ObjectId) : Promise<ResponseModel> {
        try {
            await this._repository.updateExistsService(model, id);
            return new ResponseModel(id);
        } catch (error) {
            return new ResponseModel(error, "", ResponseErrorEnum.InternalError);
        }
    }

    async heartbeat(serviceId: string) : Promise<ResponseModel> {
        try {
            const result = await this._repository.updateHeartbeat(serviceId);

            if(result.modifiedCount === 0)
                return new ResponseModel(null, "Serviço não encontrado.", ResponseErrorEnum.NotFound);

            return new ResponseModel();
        } catch (error) {
            console.log(error)
            return new ResponseModel(error, "", ResponseErrorEnum.InternalError);
        }
    }
}

export default ServiceService;