import {baseProvider} from "./baseProvider";

const getModels = async (elementId, providerId) => {
    const params = {}
    if (elementId) params.elementId = elementId;
    if (providerId) params.providerId = providerId;
    
    return  baseProvider.httpGet("models", params);
};

export {
    getModels
};
