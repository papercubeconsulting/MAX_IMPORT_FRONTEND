import { baseProvider } from "./baseProvider";

const getProductGroups = async (params = {}) =>
  baseProvider.httpGet("product-groups", params);

const postProductGroup = async (body) =>
  baseProvider.httpPost("product-groups", body);

export { getProductGroups, postProductGroup };
