import ResponseErrorEnum from "../../orcamentaria.serviceregistry.domain/enums/ResponseErrorEnum";
import LogServiceModel from "../../orcamentaria.serviceregistry.domain/models/LogServiceModel";
import ResponseModel from "../../orcamentaria.serviceregistry.domain/models/ResponseModel";
import LogServiceRepository from "../../orcamentaria.serviceregistry.infrastructure/repositories/LogServiceRepository";

class LogServiceService {
    private _repository: LogServiceRepository;

    constructor(logServiceRepository: LogServiceRepository) {
        this._repository = logServiceRepository;
    }

    async createLog(logService: LogServiceModel) : Promise<void> {
        await this._repository.createLog(logService);
    }

    async getLogService() : Promise<ResponseModel> {
        try {
            return new ResponseModel(await this._repository.getLogService());
        } catch (error) {
            return new ResponseModel(null, "Erro ao buscar logs.", ResponseErrorEnum.InternalError);
        }
    }

    async getLogServiceByServiceName(serviceName: string) : Promise<ResponseModel> {
        try {
            return new ResponseModel(await this._repository.getLogServiceByServiceName(serviceName));
        } catch (error) {
            return new ResponseModel(null, "Erro ao buscar logs.", ResponseErrorEnum.InternalError);
        }
    }
}

export default LogServiceService;