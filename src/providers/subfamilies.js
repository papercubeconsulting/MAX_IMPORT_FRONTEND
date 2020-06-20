import {baseProvider} from "./baseProvider";

const getSubfamilies = async (familyId, providerId) => {
    const params = {}
    if (familyId)   params.familyId = familyId
    if (providerId) params.providerId = providerId
    return  baseProvider.httpGet("subfamilies", params);
};

export {
    getSubfamilies
};
