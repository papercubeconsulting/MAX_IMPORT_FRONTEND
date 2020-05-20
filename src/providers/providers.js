import {serverUrl} from "../config";

const getProviders = async () => {
    const url = `${serverUrl}/providers`;

    const response = await fetch(url, {method: "GET"});

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const responseJson = await response.json();

    return responseJson.data;
};

export {
    getProviders
};
