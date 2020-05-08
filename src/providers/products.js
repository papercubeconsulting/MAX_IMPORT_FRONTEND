import {serverUrl} from "../config";
import {urlQueryParams} from "../util";

const getProducts = async params => {
    const url = `${serverUrl}/products${urlQueryParams(params)}`;

    const response = await fetch(url, {method: "GET"});

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const responseJson = await response.json();

    return responseJson.data;
};

const postProduct = async body => {
    const url = `${serverUrl}/products`;

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "accept": "*/*",
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json();
};

export {
    getProducts,
    postProduct
};
