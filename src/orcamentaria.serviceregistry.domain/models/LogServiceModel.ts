import dayjs, { Dayjs } from "dayjs";
import { ObjectId } from "mongodb";
import LogTypeEnum from "../enums/LogTypeEnum";

class LogServiceModel {
    _id?: ObjectId;
    serviceId: ObjectId;
    serviceName: string;
    type: LogTypeEnum;
    updateBefore: any;
    updateAfter: any;
    updateAt: Date;

    constructor(
        serviceId: ObjectId,
        serviceName: string,
        type: LogTypeEnum,
        updateBefore: any,
        updateAfter: any) {
            this.serviceId = serviceId;
            this.serviceName = serviceName;
            this.type = type;
            this.updateBefore = updateBefore;
            this.updateAfter = updateAfter;
            this.updateAt = dayjs().toDate();
        }
}

export default LogServiceModel;