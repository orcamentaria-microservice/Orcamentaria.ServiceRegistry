import dayjs from "dayjs";
import { ObjectId } from "mongodb";
import LogTypeEnum from "../enums/LogTypeEnum";

class LogServiceModel {
    _id?: ObjectId;
    serviceId: ObjectId;
    serviceName: string;
    type: LogTypeEnum;
    updateBefore: unknown;
    updateAfter: unknown;
    updateAt: Date;

    constructor(
        serviceId: ObjectId,
        serviceName: string,
        type: LogTypeEnum,
        updateBefore: unknown,
        updateAfter: unknown) {
            this.serviceId = serviceId;
            this.serviceName = serviceName;
            this.type = type;
            this.updateBefore = updateBefore;
            this.updateAfter = updateAfter;
            this.updateAt = dayjs().toDate();
        }
}

export default LogServiceModel;
