import {baseProvider} from "./baseProvider";

const getElements = async (subfamilyId, providerId) => {
    const params = {}
    if (subfamilyId) params.subfamilyId = subfamilyId;
    if (providerId) params.providerId = providerId;

    return  baseProvider.httpGet("elements", params);
};

export {
    getElements
};
