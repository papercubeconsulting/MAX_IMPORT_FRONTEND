import { baseProvider } from "./baseProvider";

const previewInventoryReconciliation = async (params) =>
  baseProvider.httpGet("reconciliations/preview", params);
const createInventoryReconciliation = async (body) =>
  baseProvider.httpPost("reconciliations", body);
const getInventoryReconciliations = async (params) =>
  baseProvider.httpGet("reconciliations", params);
const getInventoryReconciliation = async (id) =>
  baseProvider.httpGet(`reconciliations/${id}`);

export {
  previewInventoryReconciliation,
  createInventoryReconciliation,
  getInventoryReconciliations,
  getInventoryReconciliation,
};
