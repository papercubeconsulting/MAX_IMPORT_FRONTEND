import { baseProvider } from "./baseProvider";

const getProviders = async () => baseProvider.httpGet("providers");

const postProvider = async (body) => baseProvider.httpPost("providers", body);

export { getProviders, postProvider };
