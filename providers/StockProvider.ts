import Constants, { ElementState } from "../config/Constants";
import GenericProvider from "./GenericProvider";
export type Warehouse = {
  id: number;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
};
export type Provider = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
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
};
export type StockResponse = {
  count: number;
  rows: StockElement[];
  page: number;
  pageSize: number;
  pages: number;
};
class StockProvider extends GenericProvider {
  static async getStock(page: number): Promise<StockResponse> {
    let response = await this.httpGet(
      "http://maximport-backend.q3d2pmiqsz.us-east-1.elasticbeanstalk.com/supplies",
      { page: page, pageSize: Constants.PageSize }
    );
    return response.data;
  }
}
export default StockProvider;
