import GenericProvider from "./GenericProvider";
export type Warehouse = {
  id: number;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
};
export type WarehouseResponse = Warehouse[];

class WarehouseProvider extends GenericProvider {
  static async getWarehouses(): Promise<WarehouseResponse> {
    let response = await this.httpGet("/warehouses", {});
    return response.data;
  }
}
export default WarehouseProvider;
