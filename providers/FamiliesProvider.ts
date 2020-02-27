import GenericProvider from "./GenericProvider";
export type Family = {
  id: number;
  name: string;
};
export type FamiliesResponse = Family[];

class FamiliesProvider extends GenericProvider {
  static async getFamilies(): Promise<FamiliesResponse> {
    let response = await this.httpGet("/families", {});
    return response.data;
  }
}
export default FamiliesProvider;
