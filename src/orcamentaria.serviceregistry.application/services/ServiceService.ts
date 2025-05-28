import { Request } from "express";
import ServiceRepository from "../../orcamentaria.serviceregistry.infrastructure/repositories/ServiceRepository";
import ServiceModel from "../../orcamentaria.serviceregistry.domain/models/ServiceModel";
import ServiceValidator from "../validators/ServiceValidator";
import CreateServiceDTO from "../../orcamentaria.serviceregistry.domain/dtos/CreateServiceDTO";
import EndpointModel from "../../orcamentaria.serviceregistry.domain/models/EndpointModel";
import ResponseServiceByServiceNameAndEndpointNameDTO from "../../orcamentaria.serviceregistry.domain/dtos/ResponseServiceByServiceNameAndEndpointNameDTO";
import { ObjectId } from "mongodb";
import HttpMethodEnum from "../../orcamentaria.serviceregistry.domain/enums/HttpMethodEnum";
import EndpointValidator from "../validators/EndpointValidator";
import ResponseModel from "../../orcamentaria.serviceregistry.domain/models/ResponseModel";
import ResponseErrorEnum from "../../orcamentaria.serviceregistry.domain/enums/ResponseErrorEnum";
import StateEnum from "../../orcamentaria.serviceregistry.domain/enums/StateEnum";
import dayjs from "dayjs";
import LogServiceService from "./LogServiceService";
import LogServiceModel from "../../orcamentaria.serviceregistry.domain/models/LogServiceModel";
import LogTypeEnum from "../../orcamentaria.serviceregistry.domain/enums/LogTypeEnum";
import ResponseServiceByServiceNameDTO from "../../orcamentaria.serviceregistry.domain/dtos/ResponseServiceByServiceNameDTO";

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
        const service = await this._repository.getServiceByName(req.params.serviceName);

        if(!service)
            return new ResponseModel({}, ResponseErrorEnum.NotFound, "Serviço não encontrado.");

        return new ResponseModel(
            new ResponseServiceByServiceNameDTO(
                service._id,
                service.name, 
                service.baseUrl,
                service.state,
                service.endpoints,
                service.port
            )
            );
    }

    async getServiceByServiceNameAndEndpointName(req: Request) : Promise<ResponseModel>  {
        const service = await this._repository.getServiceByName(req.params.serviceName);

        if(!service)
            return new ResponseModel({}, ResponseErrorEnum.NotFound, "Serviço não encontrado.");

        const endpoint = service.endpoints.filter(i => i.name == req.params.endpointName)[0];

        if(!endpoint)
            return new ResponseModel({}, ResponseErrorEnum.NotFound, "Endpoint não encontrado.");

        return new ResponseModel(
            new ResponseServiceByServiceNameAndEndpointNameDTO(
                service._id,
                service.name, 
                endpoint.name, 
                service.baseUrl,
                endpoint.route,
                endpoint.method,
                service.state,
                service.port)
            );
    }

    async createService(dto: CreateServiceDTO) : Promise<ResponseModel> {

        var entity = new ServiceModel(
            dto.name, dto.baseUrl, StateEnum.STARTING, 
            dto.endpoints.map(i => new EndpointModel(
                i.name, 
                HttpMethodEnum[i.method], 
                i.route)), dayjs().toDate(), dayjs().toDate(), dto.port
        );

        const messageErrorService = await this._validator.validateBeforeInsert(entity);
        if(!!messageErrorService)
            return new ResponseModel({}, ResponseErrorEnum.ValidationFailed, messageErrorService);
        
        const messageErrorEndpoint = await this._validatorEndpoint.validateBeforeInsert(entity.endpoints);
        if(messageErrorEndpoint)
            return new ResponseModel({}, ResponseErrorEnum.ValidationFailed, messageErrorEndpoint);

        try {
            const exists = await this._repository.getServiceByName(dto.name);
    
            if(exists) {
                await this.updateExistsService(entity, exists._id);
                this._logServiceService.createLog(new LogServiceModel(exists._id, exists.name, LogTypeEnum.UPDATED, exists, entity));
                return new ResponseModel(exists._id);
            }
            
            var result = await this._repository.createService(entity);
            this._logServiceService.createLog(new LogServiceModel(result.insertedId, entity.name, LogTypeEnum.CREATED, {}, entity));
            return new ResponseModel(result.insertedId)
        } catch (error) {
            return new ResponseModel(error, ResponseErrorEnum.InternalError);
        }
    }

    async updateExistsService(model: ServiceModel, id: ObjectId) : Promise<ResponseModel> {
        try {
            await this._repository.updateExistsService(model, id);
            return new ResponseModel(id);
        } catch (error) {
            return new ResponseModel(error, ResponseErrorEnum.InternalError);
        }
    }

    async heartbeat(req: Request) : Promise<ResponseModel> {
        try {
            const result = await this._repository.updateHeartbeat(req.params.name);

            if(result.modifiedCount === 0)
                return new ResponseModel({}, ResponseErrorEnum.NotFound, "Serviço não encontrado.");

            return new ResponseModel();
        } catch (error) {
            console.log(error)
            return new ResponseModel(error, ResponseErrorEnum.InternalError);
        }
    }
}

export default ServiceService;