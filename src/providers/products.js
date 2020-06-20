import {baseProvider} from "./baseProvider";

const getProducts = async params => baseProvider.httpGet(`products`, params);
const getProduct = async (productId, params) => baseProvider.httpGet(`products/${productId}`, params);
const postProduct = async body => baseProvider.httpPost("products", body);

export {
    getProducts,
    getProduct,
    postProduct
};
