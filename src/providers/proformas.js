import { baseProvider } from "./baseProvider";

const getProformas = async (params) =>
  baseProvider.httpGet(`proformas`, params);
//const getProduct = async (productId, params) => baseProvider.httpGet(`products/${productId}`, params);
//const postProduct = async body => baseProvider.httpPost("products", body);

export {
  getProformas,
  /*,
    getProduct,
    postProduct*/
};
