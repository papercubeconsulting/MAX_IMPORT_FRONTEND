import {serverUrl} from "../config";

const getElements = async subfamilyId => {
    const url = subfamilyId ? `${serverUrl}/elements?subfamilyId=${subfamilyId}` : `${serverUrl}/elements`;

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
