import { baseProvider } from "./baseProvider";

const getProviders = async (params) =>
  baseProvider.httpGet("providers", params);

const postProvider = async (body) => baseProvider.httpPost("providers", body);

const putProvider = async (id, body) =>
  baseProvider.httpPut(`providers/${id}`, body);

export { getProviders, postProvider, putProvider };
