import "bootstrap/dist/css/bootstrap.min.css";
import React, { ChangeEvent } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faTrashAlt,
  faCheck,
  faCalendarAlt,
  faUser,
  faPlusCircle
} from "@fortawesome/free-solid-svg-icons";
library.add(faTrashAlt, faCheck, faCalendarAlt, faUser, faPlusCircle);

import FieldGroup from "../components/FieldGroup";
import FamiliesProvider, { Family } from "../providers/FamiliesProvider";
import SubFamiliesProvider, {
  SubFamily
} from "../providers/SubFamiliesProvider";
import ElementsProvider, {
  SubFamilyElement
} from "../providers/ElementsProvider";
import ModelsProvider, { ElementModel } from "../providers/ModelsProvider";
import DropdownList, { SelectItem } from "../components/DropdownList";
import WarehouseProvider from "../providers/WarehouseProvider";
import { Warehouse } from "../providers/WarehouseProvider";
import ProvidersProvider, { Provider } from "../providers/ProvidersProvider";
import StockProvider from "../providers/StockProvider";
import { withRouter, NextRouter } from "next/router";
import Router from "next/router";

type RowData = {
  family: SelectItem | null;
  subFamily: SelectItem | null;
  element: SelectItem | null;
  model: SelectItem | null;
  modelId: number | null;
  unicaja: number;
  quantity: number;
};
type StockItem = { id: number; sequentialNo: number; data: RowData };

class StockRow extends React.Component<
  {
    data: StockItem;
    onDelete: () => void;
    families: Family[];
    onChange: (sequentialNo: number, value: RowData) => void;
  },
  {
    family: SelectItem | null;
    subFamily: SelectItem | null;
    subFamilies: SubFamily[];
    element: SelectItem | null;
    elements: SubFamilyElement[];
    model: SelectItem | null;
    models: ElementModel[];
    unicaja: string;
    quantity: string;
  }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      family: this.props.data.data.family,
      subFamily: this.props.data.data.subFamily,
      subFamilies: [],
      element: this.props.data.data.element,
      elements: [],
      model: this.props.data.data.model,
      models: [],
      unicaja: this.props.data.data.unicaja.toString(),
      quantity: this.props.data.data.quantity.toString()
    };
  }
  onDataChange() {
    if (this.state.model == null) return;
    this.props.onChange(this.props.data.sequentialNo, {
      family: this.state.family,
      subFamily: this.state.subFamily,
      element: this.state.element,
      model: this.state.model,
      modelId: this.state.model.id,
      unicaja: parseInt(this.state.unicaja),
      quantity: parseInt(this.state.quantity)
    });
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
        models: []
      },
      this.onDataChange.bind(this)
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
        models: []
      },
      this.onDataChange.bind(this)
    );
  }
  async changeElement(element: SelectItem) {
    let models = await ModelsProvider.getModels(element.id);
    this.setState(
      {
        element,
        model: null,
        models
      },
      this.onDataChange.bind(this)
    );
  }
  changeModel(model: SelectItem) {
    this.setState({ model }, this.onDataChange.bind(this));
  }
  onChangeUnicaja({ target: { value } }: ChangeEvent<HTMLInputElement>) {
    this.setState({ unicaja: value }, this.onDataChange.bind(this));
  }
  onChangeQuantity({ target: { value } }: ChangeEvent<HTMLInputElement>) {
    this.setState({ quantity: value }, this.onDataChange.bind(this));
  }
  render() {
    let { data } = this.props;
    return (
      <tr>
        <td>
          <Button
            onClick={this.props.onDelete}
            color="warning"
            style={{ marginRight: 0, marginLeft: 4 }}
          >
            <FontAwesomeIcon icon="trash-alt" />
          </Button>
        </td>
        <td>{data.sequentialNo + 1}</td>
        <td>
          <DropdownList
            value={this.state.family}
            title="Familia"
            data={this.props.families.map(x => {
              return {
                id: x.id,
                name: x.name
              };
            })}
            onChange={this.changeFamily.bind(this)}
          />
        </td>
        <td>
          <DropdownList
            value={this.state.subFamily}
            title="Sub-Familia"
            data={this.state.subFamilies.map(x => {
              return {
                id: x.id,
                name: x.name
              };
            })}
            onChange={this.changeSubFamily.bind(this)}
          />
        </td>
        <td>
          <DropdownList
            value={this.state.element}
            title="Elemento"
            data={this.state.elements.map(x => {
              return {
                id: x.id,
                name: x.name
              };
            })}
            onChange={this.changeElement.bind(this)}
          />
        </td>
        <td>
          <DropdownList
            value={this.state.model}
            title="Modelo"
            data={this.state.models}
            onChange={this.changeModel.bind(this)}
          />
        </td>
        <td>
          <input
            className="form-control"
            type="number"
            value={this.state.unicaja}
            onChange={this.onChangeUnicaja.bind(this)}
          />
        </td>
        <td>
          <input
            className="form-control"
            type="number"
            value={this.state.quantity}
            onChange={this.onChangeQuantity.bind(this)}
          />
        </td>
      </tr>
    );
  }
}
class Stock extends React.Component<
  { router: NextRouter },
  {
    id: number | null;
    data: StockItem[];
    startDate: Date;
    families: Family[];
    warehouse: SelectItem | null;
    warehouses: Warehouse[];
    provider: SelectItem | null;
    providers: Provider[];
    isConfirmOpen: boolean;
    isSuccessOpen: boolean;
  }
> {
  defaultRowData(): RowData {
    return {
      family: null,
      subFamily: null,
      element: null,
      model: null,
      modelId: null,
      unicaja: 0,
      quantity: 0
    };
  }
  constructor(props: any) {
    super(props);
    this.state = {
      id: null,
      data: [
        {
          id: 0,
          sequentialNo: 0,
          data: this.defaultRowData()
        }
      ],
      startDate: new Date(),
      families: [],
      provider: null,
      providers: [],
      warehouse: null,
      warehouses: [],
      isConfirmOpen: false,
      isSuccessOpen: false
    };
  }
  async loadData(id: number) {
    let response = await StockProvider.getStockById(id);
    this.setState({
      id,
      provider: { id: response.provider.id, name: response.provider.name },
      warehouse: { id: response.warehouse.id, name: response.warehouse.name },
      data: response.suppliedProducts.map((x, idx) => {
        return {
          id: x.id,
          sequentialNo: idx,
          data: {
            family: { id: x.product.familyId, name: x.product.familyName },
            subFamily: {
              id: x.product.subfamilyId,
              name: x.product.subfamilyName
            },
            element: { id: x.product.elementId, name: x.product.elementName },
            model: { id: x.product.modelId, name: x.product.modelName },
            modelId: x.product.modelId,
            unicaja: x.boxSize,
            quantity: x.quantity
          }
        };
      })
    });
  }
  getId() {
    return new URLSearchParams(location.search).get("id");
  }
  async componentDidMount() {
    let id = this.getId();
    if (id != null) {
      await this.loadData(parseInt(id));
    }
    this.setState({
      families: await FamiliesProvider.getFamilies(),
      warehouses: await WarehouseProvider.getWarehouses(),
      providers: await ProvidersProvider.getProviders()
    });
  }
  addRow() {
    let { data } = this.state;
    let lastId = data.length > 0 ? data[data.length - 1].id : -1;
    let lastSeqNo = data.length > 0 ? data[data.length - 1].sequentialNo : -1;
    data.push({
      id: lastId + 1,
      sequentialNo: lastSeqNo + 1,
      data: this.defaultRowData()
    });
    this.setState({ data: data });
  }
  deleteRow(id: number) {
    let { data } = this.state;
    let newData = [];
    for (let i = 0; i < data.length; ++i) {
      if (data[i].id != id) newData.push(data[i]);
    }
    for (let i = 0; i < newData.length; ++i) {
      newData[i].sequentialNo = i;
    }
    this.setState({ data: newData });
  }
  setRowData(sequentialNo: number, value: RowData) {
    let { data } = this.state;
    let newData = [];
    for (let i = 0; i < data.length; ++i) {
      newData.push(data[i]);
    }
    newData[sequentialNo].data = value;
    this.setState({ data: newData });
  }
  async confirmEditCreate() {
    if (this.state.provider == null) {
      alert("Ingresar proveedor");
      return;
    }
    if (this.state.warehouse == null) {
      alert("Ingresar almacén");
      return;
    }
    if (this.state.data.length == 0) {
      alert("Ingresar por lo menos un producto");
      return;
    }
    for (let i = 0; i < this.state.data.length; ++i) {
      let row = this.state.data[i];
      if (row.data.quantity * row.data.unicaja == 0) {
        alert(
          "Cada fila debe tener por lo menos una caja y una unidad por caja"
        );
        return;
      }
      if (row.data.modelId == null) {
        alert("Cada fila debe tener un modelo elegido");
        return;
      }
    }
    this.setState({ isConfirmOpen: true });
  }
  async editCreate() {
    let newStock = await StockProvider.addEditStock(this.state.id, {
      providerId: (this.state.provider as SelectItem).id,
      warehouseId: (this.state.warehouse as SelectItem).id,
      observations: "",
      suppliedProducts: this.state.data.map(x => {
        return {
          productId: x.data.modelId as number,
          boxSize: x.data.unicaja,
          quantity: x.data.quantity
        };
      })
    });
    await this.loadData(newStock.id);
    Router.push({
      pathname: this.props.router.pathname,
      query: { id: newStock.id }
    });
    this.setState({ isConfirmOpen: false, isSuccessOpen: true }, () =>
      setTimeout(() => this.setState({ isSuccessOpen: false }), 2500)
    );
  }
  toggleConfirm() {
    this.setState({ isConfirmOpen: !this.state.isConfirmOpen });
  }
  render() {
    let { data, startDate } = this.state;
    return (
      <>
        <Modal
          isOpen={this.state.isConfirmOpen}
          toggle={this.toggleConfirm.bind(this)}
        >
          <ModalHeader toggle={this.toggleConfirm.bind(this)}>
            Confirmar
          </ModalHeader>
          <ModalBody>¿Está seguro de que desea guardar sus cambios?</ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.editCreate.bind(this)}>
              Sí
            </Button>{" "}
            <Button color="secondary" onClick={this.toggleConfirm.bind(this)}>
              No
            </Button>
          </ModalFooter>
        </Modal>
        <div className="container" style={{ maxWidth: "100%" }}>
          <div className="row" style={{ alignItems: "center" }}>
            <div className="col-sm-4">
              <FieldGroup
                label="Proveedor"
                icon="user"
                fieldConfig={{
                  value: this.state.provider,
                  data: this.state.providers.map(x => {
                    return { id: x.id, name: x.name };
                  }),
                  type: "dropdown",
                  onChange: provider => this.setState({ provider })
                }}
              />
            </div>
            <div className="col-sm-4">
              <FieldGroup
                label="Almacén"
                icon="user"
                fieldConfig={{
                  value: this.state.warehouse,
                  data: this.state.warehouses.map(x => {
                    return { id: x.id, name: x.name };
                  }),
                  type: "dropdown",
                  onChange: warehouse => this.setState({ warehouse })
                }}
              />
            </div>
            <div className="col-sm-4">
              <FieldGroup
                label="Fecha"
                icon="calendar-alt"
                fieldConfig={{
                  value: startDate,
                  type: "date"
                }}
              />
            </div>
          </div>
        </div>
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th style={{ width: "7%" }} scope="col"></th>
              <th style={{ width: "8%" }} scope="col">
                Item
              </th>
              <th style={{ width: "15%" }} scope="col">
                Familia
              </th>
              <th style={{ width: "15%" }} scope="col">
                Sub-Familia
              </th>
              <th style={{ width: "15%" }} scope="col">
                Elemento
              </th>
              <th style={{ width: "15%" }} scope="col">
                Modelo
              </th>
              <th style={{ width: "12%" }} scope="col">
                Uni/Caj
              </th>
              <th style={{ width: "13%" }} scope="col">
                Cantidad Cajas
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <StockRow
                families={this.state.families}
                key={row.id}
                data={row}
                onChange={this.setRowData.bind(this)}
                onDelete={this.deleteRow.bind(this, row.id)}
              />
            ))}

            <tr>
              <td>
                <Button
                  onClick={this.addRow.bind(this)}
                  color="info"
                  style={{ marginRight: 0, marginLeft: 4 }}
                >
                  <FontAwesomeIcon icon="plus-circle" />
                </Button>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <div className="d-flex justify-content-center align-items-center">
          <div className="col-sm-6">
            <Button
              onClick={this.confirmEditCreate.bind(this)}
              color="success"
              style={{
                width: "100%"
              }}
            >
              {this.state.id == null ? "Crear" : "Modificar"}
            </Button>
          </div>
        </div>
        <Alert
          color="success"
          isOpen={this.state.isSuccessOpen}
          toggle={() => this.setState({ isSuccessOpen: false })}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            marginBottom: 0
          }}
        >
          Cambios guardados exitosamente
        </Alert>
      </>
    );
  }
}
export default withRouter(Stock);
