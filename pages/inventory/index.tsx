import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import moment from "moment";
import { Button, Breadcrumb, BreadcrumbItem } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { withRouter, NextRouter } from "next/router";
moment.locale("es");
import {
  faEdit,
  faSearch,
  faTrashAlt,
  faEye,
  faCheck,
  faCalendarAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
library.add(
  faEdit,
  faTrashAlt,
  faSearch,
  faEye,
  faCheck,
  faCalendarAlt,
  faUser
);

import FieldGroup from "../../components/FieldGroup";
import Pagination from "../../components/Pagination";
import Link from "../../components/Link";
import Constants from "../../config/Constants";
import ProductsProvider, { Product } from "../../providers/ProductsProvider";
import FamiliesProvider, { Family } from "../../providers/FamiliesProvider";
import WarehouseProvider, {
  Warehouse,
} from "../../providers/WarehouseProvider";
import ProvidersProvider, { Provider } from "../../providers/ProvidersProvider";
import ModelsProvider, { ElementModel } from "../../providers/ModelsProvider";
import ElementsProvider, {
  SubFamilyElement,
} from "../../providers/ElementsProvider";
import { SelectItem } from "../../components/DropdownList";
import SubFamiliesProvider, {
  SubFamily,
} from "../../providers/SubFamiliesProvider";

function RowStock({ data }: { data: Product; serialNumber: number }) {
  let stockTienda =
    data.stockByWarehouseType.filter((x) => x.warehouseType == "Tienda")[0]
      ?.stock || 0;
  let stockAlmacen =
    data.stockByWarehouseType.filter((x) => x.warehouseType == "Almacén")[0]
      ?.stock || 0;
  let stockTecho =
    data.stockByWarehouseType.filter((x) => x.warehouseType == "Averiado")[0]
      ?.stock || 0;
  return (
    <tr className="text-center">
      <td>{data.code}</td>
      <td>{data.familyName}</td>
      <td>{data.subfamilyName}</td>
      <td>{data.elementName}</td>
      <td>{data.modelName}</td>
      <td>{data.totalStock}</td>
      <td>
        <Link
          href={`/stock/attend_stock?id=${data.id}&readonly=true`}
          color="success"
          style={{ width: "100%" }}
        >
          <FontAwesomeIcon icon="eye" /> Ver
        </Link>
      </td>
      <td>{stockTienda}</td>
      <td>{stockAlmacen}</td>
      <td>{stockTecho}</td>
    </tr>
  );
}
class Inventory extends React.Component<
  { router: NextRouter },
  {
    data: Product[];
    startDate: Date;
    endDate: Date;
    page: number;
    maxPage: number;
    pendingDeletionId: number | null;
    warehouses: Warehouse[];
    providers: Provider[];
    families: Family[];
    subFamilies: SubFamily[];
    elements: SubFamilyElement[];
    models: ElementModel[];
    family: SelectItem | null;
    subFamily: SelectItem | null;
    element: SelectItem | null;
    model: SelectItem | null;
    stock: SelectItem | null;
    hasStock: string | null;
    code: string;
  }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: [],
      startDate: moment().subtract(7, "days").toDate(),
      endDate: new Date(),
      page: 1,
      maxPage: 1,
      pendingDeletionId: null,
      warehouses: [],
      providers: [],
      families: [],
      subFamilies: [],
      elements: [],
      models: [],
      family: null,
      subFamily: null,
      element: null,
      model: null,
      stock: null,
      hasStock: null,
      code: "",
    };
  }
  async loadData(page: number, startDate: Date, endDate: Date) {
    let param: any = {};
    if (this.state.family) {
      param.familyId = this.state.family.id;
    }
    if (this.state.subFamily) {
      param.subfamilyId = this.state.subFamily.id;
    }
    if (this.state.element) {
      param.elementId = this.state.element.id;
    }
    if (this.state.model) {
      param.modelId = this.state.model.id;
    }
    if (this.state.hasStock) {
      param.stock = this.state.hasStock;
    }
    if (this.state.code.length) {
      param.code = this.state.code;
    }
    let stockResponse = await ProductsProvider.getProducts(param);
    console.log(stockResponse);
    this.setState({
      page,
      data: stockResponse,
      maxPage: 10,
      startDate,
      endDate,
      families: await FamiliesProvider.getFamilies(),
      warehouses: await WarehouseProvider.getWarehouses(),
      providers: await ProvidersProvider.getProviders(),
      //models: await ModelsProvider.getModels(element.id),
    });
  }
  reloadData() {
    this.loadData(this.state.page, this.state.startDate, this.state.endDate);
  }
  componentDidMount() {
    this.reloadData();
  }
  async changeFamily(family: SelectItem) {
    let subFamilies = await SubFamiliesProvider.getSubFamilies(family.id);
    this.setState(
      {
        family,
        subFamily: null,
        subFamilies,
        element: null,
        elements: [],
        model: null,
        models: [],
      },
      this.reloadData.bind(this)
    );
  }
  async changeSubFamily(subFamily: SelectItem) {
    let elements = await ElementsProvider.getElements(subFamily.id);
    this.setState(
      {
        subFamily,
        element: null,
        elements,
        model: null,
        models: [],
      },
      this.reloadData.bind(this)
    );
  }
  async changeElement(element: SelectItem) {
    let models = await ModelsProvider.getModels(element.id);
    this.setState(
      {
        element,
        model: null,
        models,
      },
      this.reloadData.bind(this)
    );
  }
  changeModel(model: SelectItem) {
    this.setState({ model }, this.reloadData.bind(this));
  }
  changeStock(stock: SelectItem) {
    let hasStock = "all";
    if (stock.id == 0) {
      hasStock = "all";
    } else {
      hasStock = "yes";
    }
    this.setState({ hasStock, stock }, this.reloadData.bind(this));
  }
  changeCode(code: string) {
    this.setState({ code }, this.reloadData.bind(this));
  }
  render() {
    let { data, startDate, page, maxPage } = this.state;
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
                label="Usuario"
                icon="user"
                fieldConfig={{ value: "Luis Rivera", type: "text" }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Fecha"
                icon="calendar-alt"
                fieldConfig={{
                  value: startDate,
                  type: "date",
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Stock"
                icon="user"
                fieldConfig={{
                  value: this.state.stock,
                  data: [
                    { id: 0, name: "Todos" },
                    { id: 1, name: "Sí" },
                    { id: 2, name: "No" },
                  ],
                  type: "dropdown",
                  onChange: this.changeStock.bind(this),
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Código de inventario"
                icon="user"
                fieldConfig={{
                  value: this.state.code,
                  type: "text",
                  onChange: this.changeCode.bind(this),
                }}
              />
            </div>
          </div>
          <div
            className="row"
            style={{ alignItems: "center", paddingBottom: 10 }}
          >
            <div className="col-sm-3">
              <FieldGroup
                label="Familia"
                icon="user"
                fieldConfig={{
                  value: this.state.family,
                  data: this.state.families.map((x) => {
                    return { id: x.id, name: x.name };
                  }),
                  type: "dropdown",
                  onChange: this.changeFamily.bind(this),
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Sub-Familia"
                icon="user"
                fieldConfig={{
                  value: this.state.subFamily,
                  data: this.state.subFamilies.map((x) => {
                    return { id: x.id, name: x.name };
                  }),
                  type: "dropdown",
                  onChange: this.changeSubFamily.bind(this),
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Elemento"
                icon="user"
                fieldConfig={{
                  value: this.state.element,
                  data: this.state.elements.map((x) => {
                    return { id: x.id, name: x.name };
                  }),
                  type: "dropdown",
                  onChange: this.changeElement.bind(this),
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Modelo"
                icon="user"
                fieldConfig={{
                  value: this.state.model,
                  data: this.state.models.map((x) => {
                    return { id: x.id, name: x.name };
                  }),
                  type: "dropdown",
                  onChange: this.changeModel.bind(this),
                }}
              />
            </div>
          </div>
        </div>
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th scope="col" className="text-center">
                Cod. Inv.
              </th>
              <th scope="col" className="text-center">
                Familia
              </th>
              <th scope="col" className="text-center">
                Sub-Familia
              </th>
              <th scope="col" className="text-center">
                Elemento
              </th>
              <th scope="col" className="text-center">
                Modelo
              </th>
              <th scope="col" colSpan={2} className="text-center">
                Stock
              </th>
              <th scope="col" className="text-center">
                En tiendas
              </th>
              <th scope="col" className="text-center">
                Almacén
              </th>
              <th scope="col" className="text-center">
                Techo
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <RowStock
                key={row.id}
                serialNumber={1 + idx + Constants.PageSize * (page - 1)}
                data={row}
              />
            ))}
          </tbody>
        </table>
        <Pagination
          page={page}
          maxPage={maxPage}
          halfWidth={5}
          onChange={(page) =>
            this.loadData(page, this.state.startDate, this.state.endDate)
          }
        />
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ marginBottom: 30 }}
        >
          <div className="col-sm-1" />
          <div className="col-sm-4">
            <Button
              onClick={() => {}}
              color="success"
              style={{
                width: "100%",
              }}
            >
              Nuevo ítem inventario
            </Button>
          </div>
          <div className="col-sm-2" />
          <div className="col-sm-4">
            <Button
              onClick={() => {}}
              color="success"
              style={{
                width: "100%",
              }}
            >
              Mover Caja
            </Button>
          </div>
          <div className="col-sm-1" />
        </div>
      </>
    );
  }
}
export default withRouter(Inventory);
