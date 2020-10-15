import { baseProvider } from "./baseProvider";

const getDispatches = async (params) =>
  baseProvider.httpGet(`dispatches`, params);
const getDispatch = async (dispatchId) =>
  baseProvider.httpGet(`dispatches/${dispatchId}`);
const postDispatchProduct = async (dispatchId, dispatchedProductId, body) =>
  baseProvider.httpPost(
    `dispatches/${dispatchId}/dispatchedProducts/${dispatchedProductId}/dispatch`,
    body
  );

export { getDispatches, getDispatch, postDispatchProduct };
