import GenericProvider from "./GenericProvider";
export type WarehouseStock = {
  warehouseId: number;
  warehouseName: string;
  warehouseType: string;
  stock: number;
};
export type WarehouseTypeStock = {
  warehouseType: string;
  stock: number;
};
export type WarehouseBoxSizeStock = {
  warehouseId: number;
  warehouseName: string;
  warehouseType: string;
  boxSize: number;
  quantityBoxes: number;
  completeBoxes: number;
  stock: number;
};
export type Product = {
  id: number;
  familyName: string;
  subfamilyName: string;
  elementName: string;
  modelName: string;
  code: number;
  compatibility: string;
  imagePath: string | null;
  suggestedPrice: number;
  createdAt: string;
  updatedAt: string;
  familyId: number;
  subfamilyId: number;
  elementId: number;
  modelId: number;
  totalStock: number;
  stockByWarehouse: [WarehouseStock];
  stockByWarehouseType: [WarehouseTypeStock];
  stockByWarehouseAndBoxSize: [WarehouseBoxSizeStock];
};
export type ProductResponse = {
  count: number;
  rows: Product[];
  page: number;
  pageSize: number;
  pages: number;
};
export type CreateProductRequest = {
  familyId?: number;
  familyName: string;
  subfamilyId?: number;
  subfamilyName: string;
  elementId?: number;
  elementName: string;
  modelId?: number;
  modelName: string;
  compatibility: string;
  suggestedPrice: number;
  imageBase64: string;
};

class ProductsProvider extends GenericProvider {
  static async getProduct(id: number): Promise<Product> {
    let response = await this.httpGet(`/products/${id}`, {});
    return response.data;
  }
  static async getProducts(param: any | null): Promise<ProductResponse> {
    let response = await this.httpGet("/products", param || {});
    return response.data;
  }
  static async createProduct(request: CreateProductRequest): Promise<boolean> {
    let response = await this.httpPost("/products", request);
    return response.status < 400;
  }
}
export default ProductsProvider;
