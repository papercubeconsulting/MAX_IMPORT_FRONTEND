import {baseProvider} from "./baseProvider";

const getDeliveryAgencies = async params => baseProvider.httpGet(`deliveryagencies`, params);

export {
    getDeliveryAgencies,
};