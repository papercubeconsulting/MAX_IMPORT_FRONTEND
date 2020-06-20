import {baseProvider} from "./baseProvider";

const getProviders = async () => baseProvider.httpGet("providers");

export {
    getProviders
};
