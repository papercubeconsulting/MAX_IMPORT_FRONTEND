export type StockElementState = "PEN" | "ATE";
export type StockElement = { id: number; state: StockElementState };
export type StockResponse = { maxPage: number; data: StockElement[] };
class StockProvider {
  static getStock(page: number): StockResponse {
    let data: StockElement[] = [];
    for (let i = 10 * (page - 1); i < 10 * page; ++i) {
      data.push({
        id: i + 1,
        state: i < 5 ? "PEN" : "ATE"
      });
    }
    return { maxPage: 12, data };
  }
}
export default StockProvider;
