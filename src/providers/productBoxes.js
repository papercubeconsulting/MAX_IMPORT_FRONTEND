import {baseProvider} from "./baseProvider";

const getProductBox = async productId => baseProvider.httpGet(`productboxes/${productId}`);
const putProductBox = async (productId, body) => baseProvider.httpPut(`productboxes/${productId}`, body);

export {
    getProductBox,
    putProductBox,
};
