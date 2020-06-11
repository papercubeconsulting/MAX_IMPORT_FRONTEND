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

const postSupply = async body => {
    const url = `${serverUrl}/supplies`;

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
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
}

const postSupplyAttend = async (supplyId, suppliedProductId, body) => {
    const url = `${serverUrl}/supplies/${supplyId}/attend/${suppliedProductId}`;

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
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
}

const putSupply = async (supplyId, body) => {
    const url = `${serverUrl}/supplies/${supplyId}`;

    const response = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(body),
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
}

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
    postSupply,
    postSupplyAttend,
    putSupply,
    putSupplyStatus
};
