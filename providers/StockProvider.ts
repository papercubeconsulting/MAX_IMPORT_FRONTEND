import Constants, { ElementState } from "../config/Constants";
import GenericProvider from "./GenericProvider";
import moment from "moment";
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
}
export default StockProvider;
