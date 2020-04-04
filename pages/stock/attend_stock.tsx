import "bootstrap/dist/css/bootstrap.min.css";
import React, { ChangeEvent } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Container,
  Row,
  Col,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faTrashAlt,
  faCheck,
  faCalendarAlt,
  faUser,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
library.add(faTrashAlt, faCheck, faCalendarAlt, faUser, faPlusCircle);

import FieldGroup from "../../components/FieldGroup";
import FamiliesProvider, { Family } from "../../providers/FamiliesProvider";
import SubFamiliesProvider, {
  SubFamily,
} from "../../providers/SubFamiliesProvider";
import ElementsProvider, {
  SubFamilyElement,
} from "../../providers/ElementsProvider";
import ModelsProvider, { ElementModel } from "../../providers/ModelsProvider";
import DropdownList, { SelectItem } from "../../components/DropdownList";
import WarehouseProvider from "../../providers/WarehouseProvider";
import { Warehouse } from "../../providers/WarehouseProvider";
import ProvidersProvider, { Provider } from "../../providers/ProvidersProvider";
import StockProvider, { SuppliedProduct } from "../../providers/StockProvider";
import { withRouter, NextRouter } from "next/router";
import Router from "next/router";
import moment from "moment";
import ModalTemplate from "../../components/ModalTemplate";
import ErrorTemplate from "../../components/ErrorTemplate";
// @ts-ignore
import Barcode from "react-barcode";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
library.add(faPrint);

type RowData = {
  family: SelectItem | null;
  subFamily: SelectItem | null;
  element: SelectItem | null;
  model: SelectItem | null;
  modelId: number | null;
  unicaja: number;
  quantity: number;
  productBoxes: SuppliedProduct[];
};
type StockItem = { id: number; sequentialNo: number; data: RowData };

class StockRow extends React.Component<
  {
    data: StockItem;
    onScan: (
      supplyId: number,
      quantity: number,
      suppliedProducts: SuppliedProduct[]
    ) => void;
    families: Family[];
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
      quantity: this.props.data.data.quantity.toString(),
    };
  }
  render() {
    let { data } = this.props;
    return (
      <tr>
        <td>{data.sequentialNo + 1}</td>
        <td>
          <input
            className="form-control"
            value={this.state.family?.name}
            readOnly
          />
        </td>
        <td>
          <input
            className="form-control"
            value={this.state.subFamily?.name}
            readOnly
          />
        </td>
        <td>
          <input
            className="form-control"
            value={this.state.element?.name}
            readOnly
          />
        </td>
        <td>
          <input
            className="form-control"
            value={this.state.model?.name}
            readOnly
          />
        </td>
        <td>
          <input
            className="form-control"
            type="number"
            value={this.state.unicaja}
            readOnly
          />
        </td>
        <td>
          <input
            className="form-control"
            type="number"
            value={this.state.quantity}
            readOnly
          />
        </td>
        <td>
          <Button
            onClick={() =>
              this.props.onScan(
                data.id,
                data.data.quantity,
                data.data.productBoxes
              )
            }
            color="success"
            style={{ marginRight: 0, marginLeft: 4 }}
          >
            <FontAwesomeIcon icon="print" />
          </Button>
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
    code: string;
    isConfirmOpen: boolean;
    isSuccessOpen: boolean;
    isQRDialogOpen: boolean;
    errorMessages: string[] | null;
    boxRange: string;
    supplyId: number;
    suppliedProducts: SuppliedProduct[];
    supplyQuantity: number;
    trackingCode: string;
    readonly: boolean;
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
      quantity: 0,
      productBoxes: [],
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
          data: this.defaultRowData(),
        },
      ],
      startDate: new Date(),
      families: [],
      provider: null,
      providers: [],
      code: "",
      warehouse: null,
      warehouses: [],
      isConfirmOpen: false,
      isSuccessOpen: false,
      isQRDialogOpen: false,
      errorMessages: null,
      supplyId: 0,
      boxRange: "",
      suppliedProducts: [],
      supplyQuantity: 0,
      trackingCode: "",
      readonly: true,
    };
  }
  async loadData(id: number) {
    let response = await StockProvider.getStockById(id);
    this.setState({
      id,
      provider: { id: response.provider.id, name: response.provider.name },
      warehouse: { id: response.warehouse.id, name: response.warehouse.name },
      code: response.code,
      startDate: moment(response.createdAt).toDate(),
      data: response.suppliedProducts.map((x, idx) => {
        return {
          id: x.id,
          sequentialNo: idx,
          data: {
            family: { id: x.product.familyId, name: x.product.familyName },
            subFamily: {
              id: x.product.subfamilyId,
              name: x.product.subfamilyName,
            },
            element: { id: x.product.elementId, name: x.product.elementName },
            model: { id: x.product.modelId, name: x.product.modelName },
            modelId: x.product.modelId,
            unicaja: x.boxSize,
            quantity: x.quantity,
            productBoxes: x.productBoxes,
          },
        };
      }),
    });
    return response.suppliedProducts;
  }
  getId() {
    return new URLSearchParams(location.search).get("id");
  }
  getReadonly() {
    return new URLSearchParams(location.search).get("readonly") === "true";
  }
  async componentDidMount() {
    let id = this.getId();
    let readonly = this.getReadonly();
    if (id != null) {
      await this.loadData(parseInt(id));
    }
    this.setState({
      families: await FamiliesProvider.getFamilies(),
      warehouses: await WarehouseProvider.getWarehouses(),
      providers: await ProvidersProvider.getProviders(),
      readonly,
    });
  }
  addRow() {
    let { data } = this.state;
    let lastId = data.length > 0 ? data[data.length - 1].id : -1;
    let lastSeqNo = data.length > 0 ? data[data.length - 1].sequentialNo : -1;
    data.push({
      id: lastId + 1,
      sequentialNo: lastSeqNo + 1,
      data: this.defaultRowData(),
    });
    this.setState({ data: data });
  }
  async onScan(
    supplyId: number,
    supplyQuantity: number,
    suppliedProducts: SuppliedProduct[]
  ) {
    this.setState({
      supplyId,
      supplyQuantity,
      isQRDialogOpen: true,
      suppliedProducts,
      boxRange: `1-${supplyQuantity}`,
    });
  }
  confirmAttend() {
    this.setState({ isConfirmOpen: true });
  }
  async attend() {
    let id = this.state.id ?? 0;
    let result = await StockProvider.attendStock(id);
    if (!result) {
      this.setState({
        errorMessages: ["Falta completar la atención de todas las cajas"],
        isConfirmOpen: false,
      });
    } else {
      this.setState({ isConfirmOpen: false, isSuccessOpen: true }, () =>
        setTimeout(() => this.setState({ isSuccessOpen: false }), 2500)
      );
    }
  }
  toggleConfirm() {
    this.setState({ isConfirmOpen: !this.state.isConfirmOpen });
  }
  async attendBoxes() {
    let { boxRange } = this.state;
    let ranges = boxRange.split(",");
    let mustScanRaw = [];
    for (let i = 0; i < ranges.length; ++i) {
      let limits = ranges[i].split("-");
      let start = parseInt(limits[0]);
      let end = parseInt(limits[limits.length - 1]);
      for (let j = start; j <= end; ++j) {
        mustScanRaw[j] = true;
      }
    }
    let mustScan = [];
    for (let i = 0; i < mustScanRaw.length; ++i) {
      if (mustScanRaw[i] !== undefined) mustScan.push(i);
    }
    let result =
      this.state.readonly ||
      (await StockProvider.attendStockProduct(
        this.state.id as number,
        this.state.supplyId,
        mustScan
      ));
    let url = `/stock/tickets?id=${this.state.id}&suppliedProductId=${this.state.supplyId}`;
    for (let i = 0; i < mustScan.length; ++i) {
      url += `&box=${mustScan[i]}`;
    }
    window.location.href = url;
    if (!result) {
      this.setState({ errorMessages: ["Rango de cajas inválido"] });
    } else {
      this.setState(
        { boxRange: "", isSuccessOpen: true, isQRDialogOpen: false },
        () => setTimeout(() => this.setState({ isSuccessOpen: false }), 2500)
      );
    }
    await this.loadData(this.state.id as number);
  }
  render() {
    let { data, startDate } = this.state;
    let currentAction = "Finalizar atención";
    let supplyButtonArray = [];
    for (let i = 0; i < this.state.supplyQuantity; ++i) {
      supplyButtonArray.push({
        indexFromSupliedProduct: i + 1,
        trackingCode: "",
      });
    }
    for (let i = 0; i < this.state.suppliedProducts.length; ++i) {
      let product = this.state.suppliedProducts[i];
      supplyButtonArray[product.indexFromSupliedProduct - 1] = product;
    }
    return (
      <>
        <ErrorTemplate
          title="Datos inválidos"
          errorMessages={this.state.errorMessages}
          close={() => this.setState({ errorMessages: null })}
        />
        <ModalTemplate
          title="Atender cajas"
          isOpen={this.state.isQRDialogOpen}
          close={() => this.setState({ isQRDialogOpen: false })}
          positive={this.attendBoxes.bind(this)}
          negative={() => this.setState({ isQRDialogOpen: false })}
          positiveText="Generar tickets"
          negativeText="Cancelar"
        >
          Por favor escriba el rango de cajas para las cuales desea generar una
          ticket de atención.
          <input
            className="form-control"
            onChange={({ target: { value } }) =>
              this.setState({ boxRange: value })
            }
            value={this.state.boxRange}
            placeholder="1-5,6,7-9"
          />
          <Container style={{ padding: 15 }}>
            <Row xs="6">
              {supplyButtonArray.map((x) => (
                <Col key={x.indexFromSupliedProduct} style={{ padding: 0 }}>
                  <Button
                    onClick={() =>
                      this.setState({ trackingCode: x.trackingCode })
                    }
                    color={x.trackingCode.length == 0 ? "warning" : "success"}
                    style={{
                      width: "100%",
                      margin: 0,
                    }}
                  >
                    {x.indexFromSupliedProduct}
                  </Button>
                </Col>
              ))}
            </Row>
          </Container>
          {this.state.trackingCode.length > 0 && (
            <div className="d-flex justify-content-center align-items-center">
              <div>
                <Barcode width={2} value={this.state.trackingCode} />
              </div>
            </div>
          )}
        </ModalTemplate>
        <ModalTemplate
          title="Confirmar"
          isOpen={this.state.isConfirmOpen}
          close={this.toggleConfirm.bind(this)}
          positive={this.attend.bind(this)}
          negative={this.toggleConfirm.bind(this)}
          positiveText="Sí"
          negativeText="No"
        >
          ¿Está seguro de que desea finalizar la atención del abastecimiento?
        </ModalTemplate>
        <Breadcrumb tag="nav" listTag="div">
          <BreadcrumbItem tag="a" href="/">
            Menu
          </BreadcrumbItem>
          <BreadcrumbItem tag="a" href="/stock">
            Stock
          </BreadcrumbItem>
          <BreadcrumbItem active tag="span">
            {currentAction}
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="container" style={{ maxWidth: "100%" }}>
          <div className="row" style={{ alignItems: "center" }}>
            <div className="col-sm-3">
              <FieldGroup
                label="Proveedor"
                icon="user"
                fieldConfig={{
                  value: this.state.provider,
                  data: this.state.providers.map((x) => {
                    return { id: x.id, name: x.name };
                  }),
                  type: "dropdown",
                  onChange: (provider) => this.setState({ provider }),
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Almacén"
                icon="user"
                fieldConfig={{
                  value: this.state.warehouse,
                  data: this.state.warehouses.map((x) => {
                    return { id: x.id, name: x.name };
                  }),
                  type: "dropdown",
                  onChange: (warehouse) => this.setState({ warehouse }),
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Cód. Carga"
                icon="user"
                fieldConfig={{
                  value: this.state.code,
                  type: "text",
                }}
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
          </div>
        </div>
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
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
              <th style={{ width: "13%" }} scope="col" colSpan={2}>
                Cantidad Cajas
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <StockRow
                families={this.state.families}
                key={row.id}
                data={row}
                onScan={this.onScan.bind(this)}
              />
            ))}

            <tr>
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
          {!this.state.readonly && (
            <div className="col-sm-6">
              <Button
                onClick={this.confirmAttend.bind(this)}
                color="success"
                style={{
                  width: "100%",
                }}
              >
                {currentAction}
              </Button>
            </div>
          )}
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
            marginBottom: 0,
          }}
        >
          Cambios guardados exitosamente
        </Alert>
      </>
    );
  }
}
export default withRouter(Stock);
