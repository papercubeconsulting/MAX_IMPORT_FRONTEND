import { baseProvider } from "./baseProvider";

const getProductBarcodeByProductId = async (productId) =>
  baseProvider.httpGet(`product-barcodes/product/${productId}`);

const getProductBarcodeByCode = async (barcode) =>
  baseProvider.httpGet(`product-barcodes/${barcode}`);

export { getProductBarcodeByProductId, getProductBarcodeByCode };
