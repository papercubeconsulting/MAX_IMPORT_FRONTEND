import GenericProvider from "./GenericProvider";
export type ElementModel = {
  id: number;
  name: string;
  subfamilyId: string;
};
export type ModelsResponse = ElementModel[];

class ModelsProvider extends GenericProvider {
  static async getModels(elementId: number): Promise<ModelsResponse> {
    let response = await this.httpGet("/models", { elementId });
    return response.data;
  }
}
export default ModelsProvider;
