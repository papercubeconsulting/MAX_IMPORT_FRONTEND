import {serverUrl} from "../config";

const getWarehouses = async type => {
    const url = `${serverUrl}/warehouses?type=${encodeURI(type)}`;

    const response = await fetch(url, {method: "GET"});

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const responseJson = await response.json();

    return responseJson.data;
};

export {
    getWarehouses
};
