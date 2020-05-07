import {serverUrl} from "../config";

const getSubfamilies = async familyId => {
    const url = `${serverUrl}/subfamilies?familyId=${familyId}`;

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
