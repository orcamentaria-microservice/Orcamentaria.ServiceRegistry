import { mixed, object, string, ValidationError } from "yup";
import EndpointModel from "../../orcamentaria.serviceregistry.domain/models/EndpointModel";
import HttpMethodEnum from "../../orcamentaria.serviceregistry.domain/enums/HttpMethodEnum";

class EndpointValidator {

    private readonly schema = object<EndpointModel>({
        name: string().required("O nome do endpoint deve ser informado."),
        route: string().required("A rota do endpoint deve ser informada."),
        method: mixed<HttpMethodEnum>()
                .required("O método HTTP do endpoint deve ser informado."),
    });

    async validateBeforeInsert(entity: EndpointModel): Promise<string | undefined> {
        try {
            await this.schema.validate(entity);
        } catch (error: unknown) {
            if (error instanceof ValidationError) {
                return error.errors[0];
            }
        }
    }
}

export default EndpointValidator;
