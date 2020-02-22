export type Atendido = "Atendido";
export type Pendiente = "Pendiente";
export type Cancelado = "Cancelado";
export type ElementState = Atendido | Pendiente | Cancelado;
class Constants {
  static Status = class {
    public static get Atendido() {
      return "Atendido";
    }
    public static get Pendiente() {
      return "Pendiente";
    }
    public static get Cancelado() {
      return "Cancelado";
    }
  };
  public static get PageSize() {
    return 10;
  }
}
export default Constants;
