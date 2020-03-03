import GenericProvider from "./GenericProvider";
export type Provider = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};
export type ProviderResponse = Provider[];

class ProvidersProvider extends GenericProvider {
  static async getProviders(): Promise<ProviderResponse> {
    let response = await this.httpGet("/providers", {});
    return response.data;
  }
}
export default ProvidersProvider;
