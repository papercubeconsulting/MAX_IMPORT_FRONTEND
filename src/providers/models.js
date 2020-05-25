import {serverUrl} from "../config";

const getModels = async elementId => {
    const url = elementId ? `${serverUrl}/models?elementId=${elementId}` : `${serverUrl}/models`;

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
