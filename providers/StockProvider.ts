import Constants, {
  ElementState,
  Pendiente,
  Atendido
} from "../config/Constants";
import GenericProvider from "./GenericProvider";
import moment from "moment";
import { Warehouse } from "./WarehouseProvider";
import { Provider } from "./ProvidersProvider";
export type Product = {
  id: number;
  familyName: string;
  subfamilyName: string;
  elementName: string;
  modelName: string;
  code: null;
  compatibility: string;
  imagePath: null;
  suggestedPrice: number;
  familyId: number;
  subfamilyId: number;
  elementId: number;
  modelId: number;
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
      to: moment(endDate).format(Constants.ApiDateFormat)
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
}
export default StockProvider;
