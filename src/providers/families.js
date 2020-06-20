import {baseProvider} from "./baseProvider";

const getFamilies = async providerId => {
    const params = {}
    if (providerId) params.providerId = providerId;
    return  baseProvider.httpGet("families", params);
};

export {
    getFamilies
};
