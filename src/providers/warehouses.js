import {serverUrl} from "../config";

const getWarehouses = async type => {
    let url = `${serverUrl}/warehouses`;
    if (type) url = `${url}?type=${encodeURI(type)}`

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
