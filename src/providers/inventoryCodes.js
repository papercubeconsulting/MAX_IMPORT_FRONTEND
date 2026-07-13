import { baseProvider } from "./baseProvider";

const resolveInventoryCode = async (code) =>
  baseProvider.httpGet(`inventory-codes/${code}`);

export { resolveInventoryCode };
