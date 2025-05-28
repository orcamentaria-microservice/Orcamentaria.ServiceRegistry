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

    healthServiceValidate(maxLife: number) {
        
        setInterval(async () => {
            const now = dayjs();
            for await (const service of await this._serviceRespoistory.getServicesUp()) {
                if(now.diff(dayjs(service.lastHeartbeat), 'seconds') > maxLife) {
                    this._serviceRespoistory.updateState(service.id, StateEnum.DOWN);
                    this._logServiceService.createLog(
                        new LogServiceModel(
                            service.id, 
                            service.serviceName, 
                            LogTypeEnum.UPDATED,
                            { state: StateEnum.UP },
                            { state: StateEnum.DOWN }
                        ))
                }
            }
        }, 30 * 1000);
    }
}

export default ServiceScheduler;