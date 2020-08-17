import { baseProvider } from "./baseProvider";

const getClientPerCode = async (code) => baseProvider.httpGet(`clients/${code}`);

export { getClientPerCode };
