import CreateEndpointDTO from "../../orcamentaria.serviceregistry.domain/dtos/CreateEndpointDTO";
import CreateServiceDTO from "../../orcamentaria.serviceregistry.domain/dtos/CreateServiceDTO";
import HttpMethodEnum from "../../orcamentaria.serviceregistry.domain/enums/HttpMethodEnum";
import RouteCatalogService from "../../orcamentaria.serviceregistry.infrastructure/helpers/RouteCatalogHelper";
import ServiceService from "../services/ServiceService";

class RegisterScheduler {
    private _serviceService: ServiceService;

    constructor(
        serviceService: ServiceService) {
        this._serviceService = serviceService;
    }

    async startAsync(
        opts: { name: string; baseUrl: string }
      ) {
        const serviceId = await this.register(opts);

        this.heartbeat(serviceId);
      }

      async register(
        opts: { name: string; baseUrl: string }
      ) : Promise<string> {
        const ignore: RegExp[] = [
          /^\/favicon\.ico$/,
          /^\/health$/,
          /^\/metrics$/,
          /^\/swagger/i,
        ];

        const endpoints: CreateEndpointDTO[] = [];

        RouteCatalogService.listAll().forEach(item => {
            item.endpoints
            .filter(e => !ignore.some(rx => rx.test(e.route)))
            .forEach(e => {
                endpoints.push({
                    name: e.name,
                    method: HttpMethodEnum[e.method].toString() as any,
                    route: `${item.route}${e.route.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, "{$1}")}`
                    })
            })
        });
      
        const dto: CreateServiceDTO = {
          name: opts.name,
          baseUrl: opts.baseUrl,
          endpoints,
          createAt: new Date(),
        };
      
        const response = await this._serviceService.createService(dto);

        if(!response.Success)
          process.exit(1);

        return response.Data;
      }

      async heartbeat(serviceId: string) {
        setInterval(() => {
          this._serviceService.heartbeat(serviceId);
        }, 30 * 1000); //30 segundos;
      }
}

export default RegisterScheduler;