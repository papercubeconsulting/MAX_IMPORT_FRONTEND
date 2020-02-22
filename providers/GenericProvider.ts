interface ServiceReponse<T> {
  data: T;
  status: number;
  message: string;
}
class GenericProvider {
  static buildUrl(url: string, params: any): string {
    var query = Object.keys(params)
      .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
      .join("&");
    if (query.length) {
      url = `${url}?${query}`;
    }
    return url;
  }
  static async httpGet(url: string, params: any): Promise<ServiceReponse<any>> {
    return await (await fetch(this.buildUrl(url, params))).json();
  }
}
export default GenericProvider;
