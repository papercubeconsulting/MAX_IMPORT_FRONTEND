import { baseProvider } from "./baseProvider";

const previewInventoryReconciliation = async (params) =>
  baseProvider.httpGet("reconciliations/preview", params);
const createInventoryReconciliation = async (body) =>
  baseProvider.httpPost("reconciliations", body);
const getInventoryReconciliations = async (params) =>
  baseProvider.httpGet("reconciliations", params);
const getInventoryReconciliation = async (id) =>
  baseProvider.httpGet(`reconciliations/${id}`);
const approveInventoryReconciliations = async (ids) =>
  baseProvider.httpPost("reconciliations/approve", { ids });
const denyInventoryReconciliations = async (ids) =>
  baseProvider.httpPost("reconciliations/deny", { ids });

export {
  approveInventoryReconciliations,
  previewInventoryReconciliation,
  createInventoryReconciliation,
  denyInventoryReconciliations,
  getInventoryReconciliations,
  getInventoryReconciliation,
};
