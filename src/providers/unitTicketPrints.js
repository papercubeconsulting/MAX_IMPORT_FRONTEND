import { baseProvider } from "./baseProvider";

const createUnitTicketPrint = async (body) =>
  baseProvider.httpPost("unit-ticket-prints", body);
const createExplodedBoxTicketBatch = async (trackingCodes) =>
  baseProvider.httpPost("unit-ticket-prints/exploded-box-batches", {
    trackingCodes,
  });
const getUnitTicketPrint = async (id) =>
  baseProvider.httpGet(`unit-ticket-prints/${id}`);
const getUnitTicketPrints = async (params) =>
  baseProvider.httpGet("unit-ticket-prints", params);

export {
  createExplodedBoxTicketBatch,
  createUnitTicketPrint,
  getUnitTicketPrint,
  getUnitTicketPrints,
};
