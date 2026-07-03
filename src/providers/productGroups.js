import { baseProvider } from "./baseProvider";

const getProductGroups = async (params = {}) =>
  baseProvider.httpGet("product-groups", params);

const getSuggestedProductGroupCode = async (params = {}) =>
  baseProvider.httpGet("product-groups/suggest-code", params);

const postProductGroup = async (body) =>
  baseProvider.httpPost("product-groups", body);

export { getProductGroups, getSuggestedProductGroupCode, postProductGroup };
