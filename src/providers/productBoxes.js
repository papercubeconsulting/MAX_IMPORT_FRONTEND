import { baseProvider } from "./baseProvider";

const getProductBox = async (productId) =>
  baseProvider.httpGet(`productboxes/${productId}`);

const putProductBox = async (productId, body) =>
  baseProvider.httpPut(`productboxes/${productId}`, body);

const putProductBoxes = async (body) =>
  baseProvider.httpPut(`productboxes/move`, body);

const getProductBoxes = async (params) =>
  baseProvider.httpGet(`productboxes`, params);

const generateProductBoxUnitTickets = async (productBoxId) =>
  baseProvider.httpPost(`productboxes/${productBoxId}/unitTickets`);

export {
  getProductBox,
  putProductBox,
  putProductBoxes,
  getProductBoxes,
  generateProductBoxUnitTickets,
};
