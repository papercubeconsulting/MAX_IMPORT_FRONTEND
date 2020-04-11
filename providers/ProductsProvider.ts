import GenericProvider from "./GenericProvider";
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
};
export type ProductResponse = Product[];

class ProductsProvider extends GenericProvider {
  static async getProducts(param: any | null): Promise<ProductResponse> {
    let response = await this.httpGet("/products", param || {});
    return response.data;
  }
}
export default ProductsProvider;
