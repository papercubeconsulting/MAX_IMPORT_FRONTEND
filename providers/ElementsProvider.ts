import GenericProvider from "./GenericProvider";
export type SubFamilyElement = {
  id: number;
  name: string;
  subfamilyId: string;
};
export type ElementsResponse = SubFamilyElement[];

class ElementsProvider extends GenericProvider {
  static async getElements(subfamilyId: number): Promise<ElementsResponse> {
    let response = await this.httpGet("/elements", { subfamilyId });
    return response.data;
  }
}
export default ElementsProvider;
