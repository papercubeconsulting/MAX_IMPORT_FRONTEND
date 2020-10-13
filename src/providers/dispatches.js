import { baseProvider } from "./baseProvider";

const getDispatches = async (params) =>
  baseProvider.httpGet(`dispatches`, params);
const getDispatch = async (dispatchId) =>
  baseProvider.httpGet(`dispatches/${dispatchId}`);

export { getDispatches, getDispatch };
