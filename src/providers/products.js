import { baseProvider } from "./baseProvider";

const getProducts = async (params) => baseProvider.httpGet(`products`, params);

const getProduct = async (productId, params) =>
  baseProvider.httpGet(`products/${productId}`, params);

const postProduct = async (body) => baseProvider.httpPost("products", body);

const updateProduct = async (productId, body) =>
  baseProvider.httpPut(`products/${productId}`, body);

const getTradenames = async () => baseProvider.httpGet(`products/tradename`);

const getTradenamesWithQueryParams = async (params) =>
  baseProvider.httpGet(`products/tradename`, params);

const deleteProduct = async (productId) =>
  baseProvider.httpDelete(`products/${productId}`);

const getFileXlsx = async () =>
  baseProvider.httpGetFile(`productboxes/availableReport`);

const getFileXlsxMovimientoCajas = async (params) =>
  baseProvider.httpGetFile(`productboxes/movementreport`, params);

const getFileXlsxInventarioTotal = async () =>
  baseProvider.httpGetFile(`products/inventoryReport`);
export {
  getProducts,
  getFileXlsxInventarioTotal,
  getProduct,
  postProduct,
  updateProduct,
  getTradenames,
  deleteProduct,
  getFileXlsx,
  getFileXlsxMovimientoCajas,
  getTradenamesWithQueryParams,
};
