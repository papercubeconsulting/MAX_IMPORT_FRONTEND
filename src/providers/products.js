import { baseProvider } from "./baseProvider";

const getProducts = async (params) => baseProvider.httpGet(`products`, params);

const getProduct = async (productId, params) =>
  baseProvider.httpGet(`products/${productId}`, params);

const postProduct = async (body) => baseProvider.httpPost("products", body);

const updateProduct = async (productId, body) =>
  baseProvider.httpPut(`products/${productId}`, body);

const getTradenames = async () => baseProvider.httpGet(`products/tradename`);

export { getProducts, getProduct, postProduct, updateProduct, getTradenames };
