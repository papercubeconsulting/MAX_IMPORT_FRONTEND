import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import moment from "moment";
import { Breadcrumb, BreadcrumbItem } from "reactstrap";
import { withRouter, NextRouter } from "next/router";
moment.locale("es");

import ProductsProvider, { Product } from "../../providers/ProductsProvider";
import FieldGroup from "../../components/FieldGroup";
class Inventory extends React.Component<
  { router: NextRouter },
  {
    data: Product | null;
    page: number;
    maxPage: number;
  }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: null,
      page: 1,
      maxPage: 1,
    };
  }
  getId() {
    return parseInt(new URLSearchParams(location.search).get("id") as string);
  }
  async loadData(page: number) {
    let product = await ProductsProvider.getProduct(this.getId());
    this.setState({
      page,
      data: product,
    });
  }
  reloadData() {
    this.loadData(this.state.page);
  }
  componentDidMount() {
    this.reloadData();
  }
  render() {
    let { data } = this.state;
    let stockTienda =
      data?.stockByWarehouseType?.filter((x) => x.warehouseType == "Tienda")[0]
        ?.stock || 0;
    let stockAlmacen =
      data?.stockByWarehouseType?.filter((x) => x.warehouseType == "Almacén")[0]
        ?.stock || 0;
    let stockTecho =
      data?.stockByWarehouseType?.filter(
        (x) => x.warehouseType == "Averiado"
      )[0]?.stock || 0;
    return (
      <>
        <Breadcrumb tag="nav" listTag="div">
          <BreadcrumbItem tag="a" href="/">
            Menu
          </BreadcrumbItem>
          <BreadcrumbItem active tag="span">
            Inventory
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="container" style={{ maxWidth: "100%" }}>
          <div className="row" style={{ alignItems: "center" }}>
            <div className="col-sm-3">
              <FieldGroup
                label="Familia"
                fieldConfig={{
                  value: data?.familyName || "",
                  type: "text",
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Sub-Familia"
                fieldConfig={{
                  value: data?.subfamilyName || "",
                  type: "text",
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Elemento"
                fieldConfig={{
                  value: data?.elementName || "",
                  type: "text",
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Modelo"
                fieldConfig={{
                  value: data?.modelName || "",
                  type: "text",
                }}
              />
            </div>
          </div>
          <div className="row" style={{ alignItems: "center" }}>
            <div className="col-sm-3">
              <FieldGroup
                label="Código Inventario"
                fieldConfig={{
                  value: data?.code?.toString() || "",
                  type: "text",
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Disponibilidad Venta"
                fieldConfig={{
                  value: stockTienda.toString() || "",
                  type: "text",
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Disponibilidad Almacén"
                fieldConfig={{
                  value: stockAlmacen.toString() || "",
                  type: "text",
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Disponibilidad Averiado"
                fieldConfig={{
                  value: stockTecho.toString() || "",
                  type: "text",
                }}
              />
            </div>
          </div>
          <div className="row" style={{ alignItems: "center" }}>
            <div className="col-sm-12">
              <FieldGroup
                label="Compatibilidad"
                fieldConfig={{
                  value: data?.compatibility || "",
                  type: "text",
                }}
              />
            </div>
          </div>
        </div>
        <div
          className="col-sm-12"
          style={{
            textAlign: "center",
            justifyContent: "center",
            fontWeight: "bold",
            paddingBottom: 10,
          }}
        >
          Disponibilidad del producto en los almacenes(unidades totales)
        </div>
        <div className="container" style={{ maxWidth: "100%" }}>
          <div className="row" style={{ alignItems: "center" }}>
            <div className="col-sm-6" style={{ padding: 0 }}>
              <table className="table table-striped">
                <thead className="thead-dark">
                  <tr>
                    <th scope="col" className="text-center">
                      Almacén
                    </th>
                    <th scope="col" className="text-center">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.stockByWarehouse.map((x, idx) => (
                    <tr key={idx} className="text-center">
                      <td>{x.warehouseName}</td>
                      <td>{x.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              className={"col-sm-6"}
              style={{
                padding: 0,
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                overflow: "hidden",
              }}
            >
              <img
                style={{
                  flexShrink: 0,
                  width: "70%",
                  height: "70%",
                  objectFit: "contain",
                }}
                src={data?.imageBase64 || "/static/imagen-no-disponible.png"}
              />
            </div>
          </div>
        </div>
        <div
          className="col-sm-12"
          style={{
            textAlign: "center",
            justifyContent: "center",
            fontWeight: "bold",
            paddingBottom: 10,
          }}
        >
          Disponibilidad del producto en los almacenes(cajas)
        </div>
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th scope="col" className="text-center">
                Ítem
              </th>
              <th scope="col" className="text-center">
                Ubicación
              </th>
              <th scope="col" className="text-center">
                Cajas
              </th>
              <th scope="col" className="text-center">
                Uni/Caja
              </th>
              <th scope="col" className="text-center">
                Unidades
              </th>
              <th scope="col" colSpan={2} className="text-center">
                Cajas completas
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.stockByWarehouseAndBoxSize.map((x, idx) => (
              <tr key={idx} className="text-center">
                <td>{idx + 1}</td>
                <td>{x.warehouseName}</td>
                <td>{x.quantityBoxes}</td>
                <td>{x.boxSize}</td>
                <td>{x.stock}</td>
                <td>{x.completeBoxes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }
}
export default withRouter(Inventory);
