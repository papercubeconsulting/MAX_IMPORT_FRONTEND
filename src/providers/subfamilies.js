import {serverUrl} from "../config";

const getSubfamilies = async familyId => {
    const url = familyId ? `${serverUrl}/subfamilies?familyId=${familyId}` : `${serverUrl}/subfamilies`;

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
