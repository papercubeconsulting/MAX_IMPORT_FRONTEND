import { baseProvider } from "./baseProvider";

const getProducts = async (params) => baseProvider.httpGet(`products`, params);

const getProduct = async (productId, params) =>
  baseProvider.httpGet(`products/${productId}`, params);

const getProductChangeOptions = async (params) =>
  baseProvider.httpGet(`products/change-options`, params);

const getProductGroupSearchOptions = async () =>
  baseProvider.httpGet(`products/group-search-options`);

const postProduct = async (body) => baseProvider.httpPost("products", body);

const updateProduct = async (productId, body) =>
  baseProvider.httpPut(`products/${productId}`, body);

const getTradenames = async () => baseProvider.httpGet(`products/tradename`);

const getTradenamesAll = async () =>
  baseProvider.httpGet(`products/tradename-all`);

const getTradenamesWithQueryParams = async (params) =>
  baseProvider.httpGet(`products/tradename`, params);

const deleteProduct = async (productId) =>
  baseProvider.httpDelete(`products/${productId}`);

const addProductToGroup = async (productId, targetProductId) =>
  baseProvider.httpPost(`products/${productId}/add-group`, { targetProductId });

const removeProductFromGroup = async (productId, targetProductId) =>
  baseProvider.httpDelete(`products/${productId}/remove-group/${targetProductId}`);

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
  getProductChangeOptions,
  getProductGroupSearchOptions,
  postProduct,
  updateProduct,
  getTradenames,
  deleteProduct,
  getFileXlsx,
  getFileXlsxMovimientoCajas,
  getTradenamesWithQueryParams,
  getTradenamesAll,
  addProductToGroup,
  removeProductFromGroup,
};
