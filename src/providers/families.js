import {serverUrl} from "../config";

const getFamilies = async () => {
    const url = `${serverUrl}/families`;

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
