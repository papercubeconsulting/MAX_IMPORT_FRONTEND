import {serverUrl} from "../config";
import {urlQueryParams} from "../util";

const getProductBox = async productId => {
    const url = `${serverUrl}/productboxes/${productId}`;

    const response = await fetch(url, {method: "GET"});

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const responseJson = await response.json();

    return responseJson.data;
};

const putProductBox = async (productId, body) => {
    const url = `${serverUrl}/productboxes/${productId}`;

    const response = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(body),
        headers: {
            "accept": "*/*",
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const responseJson = await response.json();

    return responseJson.data;
};


export {
    getProductBox,
    putProductBox,
};
