import Constants, { ElementState } from "../config/Constants";
import GenericProvider from "./GenericProvider";
import moment from "moment";
import { Warehouse } from "./WarehouseProvider";
import { Provider } from "./ProvidersProvider";
import { Product } from "./ProductsProvider";

export type SuppliedProduct = {
  indexFromSupliedProduct: number;
  trackingCode: string;
};
export type ProductSupply = {
  id: number;
  quantity: number;
  suppliedQuantity: number;
  boxSize: number;
  status: string;
  supplyId: number;
  productId: number;
  product: Product;
  productBoxes: SuppliedProduct[];
};
export type StockElement = {
  id: number;
  code: any;
  attentionDate: any;
  observations: string;
  status: ElementState;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  providerId: number;
  warehouseId: number;
  warehouse: Warehouse;
  provider: Provider;
  responsible: string;
  suppliedProducts: ProductSupply[];
};
export type StockResponse = {
  count: number;
  rows: StockElement[];
  page: number;
  pageSize: number;
  pages: number;
};
export type CreateStockRequest = {
  providerId: number;
  warehouseId: number;
  observations: string;
  code: string;
  suppliedProducts: {
    productId: number;
    boxSize: number;
    quantity: number;
  }[];
};
export type DeleteStockResponse = {
  data: null;
  status: number;
  message: string;
  userMessage: string;
};
class StockProvider extends GenericProvider {
  static async getStock(
    page: number,
    startDate: Date,
    endDate: Date
  ): Promise<StockResponse> {
    let response = await this.httpGet("/supplies", {
      page: page,
      pageSize: Constants.PageSize,
      from: moment(startDate).format(Constants.ApiDateFormat),
      to: moment(endDate).format(Constants.ApiDateFormat),
    });
    return response.data;
  }
  static async getStockById(id: number): Promise<StockElement> {
    let response = await this.httpGet(`/supplies/${id}`, {});
    return response.data;
  }
  static async addEditStock(
    id: number | null,
    req: CreateStockRequest
  ): Promise<StockElement> {
    let response;
    if (id == null) {
      response = await this.httpPost("/supplies", req);
    } else {
      response = await this.httpPut(`/supplies/${id}`, req);
    }
    return response.data;
  }
  static async deleteStock(id: number, status: ElementState): Promise<boolean> {
    let response = await this.httpPut(`/supplies/${id}/status`, { status });
    return response.status != 404;
  }
  static async attendStock(id: number): Promise<boolean> {
    let response = await this.httpPut(`/supplies/${id}/status`, {
      status: "Atendido",
    });
    return response.status < 400;
  }
  static async attendStockProduct(
    supplyId: number,
    suppliedProductId: number,
    boxes: number[]
  ): Promise<boolean> {
    let response = await this.httpPost(
      `/supplies/${supplyId}/attend/${suppliedProductId}`,
      {
        boxes,
      }
    );
    return response.status < 400;
  }
}
export default StockProvider;
