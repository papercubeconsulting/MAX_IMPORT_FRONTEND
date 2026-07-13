import { baseProvider } from "./baseProvider";

const createUnitTicketPrint = async (body) =>
  baseProvider.httpPost("unit-ticket-prints", body);
const getUnitTicketPrint = async (id) =>
  baseProvider.httpGet(`unit-ticket-prints/${id}`);
const getUnitTicketPrints = async (params) =>
  baseProvider.httpGet("unit-ticket-prints", params);

export { createUnitTicketPrint, getUnitTicketPrint, getUnitTicketPrints };
