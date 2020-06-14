import {serverUrl} from "../config";
import {urlQueryParams} from "../util";

const getModels = async (elementId, providerId) => {
    const params = {}
    if (elementId) params.elementId = elementId;
    if (providerId) params.providerId = providerId;
    
    const url = `${serverUrl}/models${urlQueryParams(params)}`;
    
    const response = await fetch(url, {method: "GET"});

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const responseJson = await response.json();

    return responseJson.data;
};

export {
    getModels
};
