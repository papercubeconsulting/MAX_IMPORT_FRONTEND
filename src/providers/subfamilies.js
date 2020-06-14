import {serverUrl} from "../config";
import {urlQueryParams} from "../util";

const getSubfamilies = async (familyId, providerId) => {
    const params = {}
    if (familyId)   params.familyId = familyId
    if (providerId) params.providerId = providerId
    const url = `${serverUrl}/subfamilies${urlQueryParams(params)}`

    const response = await fetch(url, {method: "GET"});

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const responseJson = await response.json();

    return responseJson.data;
};

export {
    getSubfamilies
};
