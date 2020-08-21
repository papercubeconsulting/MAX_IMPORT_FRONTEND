import {baseProvider} from "./baseProvider";

const getBanks = async params => baseProvider.httpGet(`banks`, params);
const getBank = async (bankId, params) => baseProvider.httpGet(`banks/${bankId}`, params);

export {
    getBanks,
    getBank,
};