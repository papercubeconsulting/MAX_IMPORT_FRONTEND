import GenericProvider from "./GenericProvider";
export type SubFamily = {
  id: number;
  name: string;
  familyId: string;
};
export type SubFamiliesResponse = SubFamily[];

class SubFamiliesProvider extends GenericProvider {
  static async getSubFamilies(familyId: number): Promise<SubFamiliesResponse> {
    let response = await this.httpGet("/subfamilies", { familyId });
    return response.data;
  }
}
export default SubFamiliesProvider;
