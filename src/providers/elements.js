import {serverUrl} from "../config";
import {urlQueryParams} from "../util";

const getElements = async (subfamilyId, providerId) => {
    const params = {}
    if (subfamilyId) params.subfamilyId = subfamilyId;
    if (providerId) params.providerId = providerId;

    const url = `${serverUrl}/elements${urlQueryParams(params)}`;

    const response = await fetch(url, {method: "GET"});

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const responseJson = await response.json();

    return responseJson.data;
};

export {
    getElements
};
