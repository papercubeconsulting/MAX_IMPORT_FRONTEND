import {serverUrl} from "../config";
import {urlQueryParams} from "../util";

const getFamilies = async providerId => {
    const params = {}
    if (providerId) params.providerId = providerId;
    const url = `${serverUrl}/families${urlQueryParams(params)}`;

    const response = await fetch(url, {method: "GET"});

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const responseJson = await response.json();

    return responseJson.data;
};

export {
    getFamilies
};
