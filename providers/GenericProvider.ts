interface ServiceReponse<T> {
  data: T;
  status: number;
  message: string;
}
const root =
  "http://maximport-backend.q3d2pmiqsz.us-east-1.elasticbeanstalk.com";
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
  static buildRelativeUrl(url: string, params: any): string {
    return root + this.buildUrl(url, params);
  }
  static async httpGet(url: string, params: any): Promise<ServiceReponse<any>> {
    return await (await fetch(this.buildRelativeUrl(url, params))).json();
  }
  static async httpDelete(url: string): Promise<ServiceReponse<any>> {
    return await (
      await fetch(this.buildRelativeUrl(url, {}), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      })
    ).json();
  }
  static async httpPost(
    url: string,
    params: any
  ): Promise<ServiceReponse<any>> {
    return await (
      await fetch(this.buildRelativeUrl(url, {}), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(params)
      })
    ).json();
  }
  static async httpPut(url: string, params: any): Promise<ServiceReponse<any>> {
    return await (
      await fetch(this.buildRelativeUrl(url, {}), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(params)
      })
    ).json();
  }
}
export default GenericProvider;
