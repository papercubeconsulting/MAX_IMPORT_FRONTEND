import {serverUrl} from "../config";

const getElements = async subfamilyId => {
    const url = `${serverUrl}/elements?subfamilyId=${subfamilyId}`;

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
