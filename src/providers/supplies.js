import {baseProvider} from "./baseProvider";

const getSupplies = async params => baseProvider.httpGet("supplies", params);
const getSupply = async supplyId  => baseProvider.httpGet(`supplies/${supplyId}`);
const postSupply = async body => baseProvider.httpPost("supplies", body);

const postSupplyAttend = async (supplyId, suppliedProductId, body) => 
    baseProvider.httpPost(`supplies/${supplyId}/attend/${suppliedProductId}`, body);
    
const putSupply = async (supplyId, body) => 
    baseProvider.httpPut(`supplies/${supplyId}`, body);
    
const putSupplyStatus = async (supplyId, status) => 
    baseProvider.httpPut(`supplies/${supplyId}/status`, {status});

export {
    getSupply,
    getSupplies,
    postSupply,
    postSupplyAttend,
    putSupply,
    putSupplyStatus
};
