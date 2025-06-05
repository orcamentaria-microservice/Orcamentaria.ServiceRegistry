import dayjs from "dayjs";
import ServiceRepository from "../../orcamentaria.serviceregistry.infrastructure/repositories/ServiceRepository";
import StateEnum from "../../orcamentaria.serviceregistry.domain/enums/StateEnum";
import LogServiceService from "../services/LogServiceService";
import LogServiceModel from "../../orcamentaria.serviceregistry.domain/models/LogServiceModel";
import LogTypeEnum from "../../orcamentaria.serviceregistry.domain/enums/LogTypeEnum";

class ServiceScheduler {
    private _serviceRespoistory: ServiceRepository;
    private _logServiceService: LogServiceService;

    constructor(
        serviceRespoistory: ServiceRepository,
        logServiceService: LogServiceService) {
        this._serviceRespoistory = serviceRespoistory;
        this._logServiceService = logServiceService;
    }

    healthServiceValidate(maxLifeTime: number) {
        
        setInterval(async () => {
            const now = dayjs();
            for await (const service of await this._serviceRespoistory.getServicesUpAndStarting()) {
                if(now.diff(dayjs(service.lastHeartbeat), 'minutes') > maxLifeTime) {
                    this._serviceRespoistory.updateState(service.id, StateEnum.DOWN);
                    this._logServiceService.createLog(
                        new LogServiceModel(
                            service.id, 
                            service.serviceName, 
                            LogTypeEnum.UPDATED,
                            { state: StateEnum.UP },
                            { state: StateEnum.DOWN }
                        ));
                }
            }
        }, 30 * 1000); //30 segundos;
    }

    removeServices(burialTime: number) {
        
        setInterval(async () => {
            const now = dayjs();
            for await (const service of await this._serviceRespoistory.getServicesDown()) {
                if(now.diff(dayjs(service.lastHeartbeat), 'minutes') > burialTime) {
                    this._serviceRespoistory.deleteService(service.id);
                    this._logServiceService.createLog(
                        new LogServiceModel(
                            service.id, 
                            service.serviceName, 
                            LogTypeEnum.DELETED,
                            service,
                            null
                        ));
                }
            }
        }, 36 * 100000); //1 hora;
    }
}

export default ServiceScheduler;