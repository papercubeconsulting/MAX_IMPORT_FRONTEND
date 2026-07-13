import { baseProvider } from "./baseProvider";

const getProductBarcodeByProductId = async (productId) =>
  baseProvider.httpGet(`product-barcodes/product/${productId}`);

export { getProductBarcodeByProductId };
