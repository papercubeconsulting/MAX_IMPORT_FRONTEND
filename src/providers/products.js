import {serverUrl} from "../config";
import {urlQueryParams} from "../util";

const getProducts = async params => {
    console.log("params", params);
    const url = `${serverUrl}/products${urlQueryParams(params)}`;

    const response = await fetch(url, {method: "GET"});

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const responseJson = await response.json();

    return responseJson.data;
};

export {
    getProducts
};
