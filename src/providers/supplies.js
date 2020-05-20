import {serverUrl} from "../config";
import {urlQueryParams} from "../util";

const getSupplies = async params => {
    const url = `${serverUrl}/supplies${urlQueryParams(params)}`;

    const response = await fetch(url, {method: "GET"});

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const responseJson = await response.json();

    return responseJson.data;
};

const getSupply = async supplyId => {
    const url = `${serverUrl}/supplies/${supplyId}`;

    const response = await fetch(url, {method: "GET"});

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const responseJson = await response.json();

    return responseJson.data;
};

const putSupplyStatus = async (supplyId, status) => {
    const url = `${serverUrl}/supplies/${supplyId}/status`;

    const response = await fetch(url, {
        method: "PUT",
        body: JSON.stringify({status}),
        headers: {
            "accept": "*/*",
            "Content-Type": "application/json",
        }
    });

    const responseJson = await response.json();

    if (!response.ok) {
        throw new Error(responseJson.userMessage);
    }

    return responseJson;
};

export {
    getSupply,
    getSupplies,
    putSupplyStatus
};
