import "bootstrap/dist/css/bootstrap.min.css";
import { NextPage } from "next";
import React from "react";
import moment from "moment";
import {
  Button,
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Breadcrumb,
  BreadcrumbItem
} from "reactstrap";
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
  faUser
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
import { max, min } from "date-fns";
import Pagination from "../../components/Pagination";
import StockProvider, { StockElement } from "../../providers/StockProvider";
import Link from "../../components/Link";
import Constants from "../../config/Constants";

const RowStock: NextPage<{
  data: StockElement;
  serialNumber: number;
  onDelete: (id: number) => void;
}> = ({ data, serialNumber, onDelete }) => (
  <tr>
    <td>
      {data.status == "Pendiente" && (
        <Button
          href={`/stock/add_edit_stock?id=${data.id}`}
          color="info"
          style={{ marginRight: 4, marginLeft: 0 }}
        >
          <FontAwesomeIcon icon="edit" />
        </Button>
      )}
      {data.status == "Pendiente" && (
        <Button
          onClick={() => onDelete(data.id)}
          color="warning"
          style={{ marginRight: 0, marginLeft: 4 }}
        >
          <FontAwesomeIcon icon="trash-alt" />
        </Button>
      )}
    </td>
    <td className="text-center">{serialNumber}</td>
    <td>{data.provider.name}</td>
    <td>{data.code}</td>
    <td>{data.warehouse.name}</td>
    <td className="text-center">
      {moment(new Date(data.createdAt)).format("L")}
    </td>
    <td className="text-center">{data.status}</td>
    <td>
      {data.status == Constants.Status.Atendido && (
        <Button color="info" style={{ width: "100%" }}>
          <FontAwesomeIcon icon="eye" /> Ver
        </Button>
      )}
      {data.status == Constants.Status.Pendiente && (
        <Button color="success" style={{ width: "100%" }}>
          <FontAwesomeIcon icon="check" /> Atender
        </Button>
      )}
    </td>
    <td>{data.responsible}</td>
    <td className="text-center">
      {data.attentionDate ? new Date(data.attentionDate) : data.status}
    </td>
  </tr>
);
class Stock extends React.Component<
  { router: NextRouter },
  {
    data: StockElement[];
    startDate: Date;
    endDate: Date;
    page: number;
    maxPage: number;
    pendingDeletionId: number | null;
  }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: [],
      startDate: moment()
        .subtract(7, "days")
        .toDate(),
      endDate: new Date(),
      page: 1,
      maxPage: 1,
      pendingDeletionId: null
    };
  }
  async loadData(page: number, startDate: Date, endDate: Date) {
    let stockResponse = await StockProvider.getStock(page, startDate, endDate);
    this.setState({
      page,
      data: stockResponse.rows,
      maxPage: stockResponse.pages,
      startDate,
      endDate
    });
  }
  componentDidMount() {
    this.loadData(this.state.page, this.state.startDate, this.state.endDate);
  }
  confirmDeleteRow(id: number) {
    this.setState({ pendingDeletionId: id });
  }
  async deleteRow() {
    let { pendingDeletionId: id } = this.state;
    await StockProvider.deleteStock(id as number, "Cancelado");
    await this.loadData(
      this.state.page,
      this.state.startDate,
      this.state.endDate
    );
    this.hideConfirm();
  }
  hideConfirm() {
    this.setState({ pendingDeletionId: null });
  }
  render() {
    let { data, startDate, endDate, page, maxPage } = this.state;
    return (
      <>
        <Modal
          isOpen={this.state.pendingDeletionId !== null}
          toggle={this.hideConfirm.bind(this)}
        >
          <ModalHeader toggle={this.hideConfirm.bind(this)}>
            Confirmar
          </ModalHeader>
          <ModalBody>
            ¿Está seguro de que desea marcar el abastecimiento como cancelado?
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.deleteRow.bind(this)}>
              Sí
            </Button>{" "}
            <Button color="secondary" onClick={this.hideConfirm.bind(this)}>
              No
            </Button>
          </ModalFooter>
        </Modal>
        <Breadcrumb tag="nav" listTag="div">
          <BreadcrumbItem tag="a" href="/">
            Menu
          </BreadcrumbItem>
          <BreadcrumbItem active tag="span">
            Stock
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
                label="Fecha Inicio"
                icon="calendar-alt"
                fieldConfig={{
                  value: startDate,
                  type: "date",
                  onChange: startDate =>
                    this.loadData(
                      1,
                      startDate,
                      max([startDate, this.state.endDate])
                    )
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Fecha Fin"
                icon="calendar-alt"
                fieldConfig={{
                  value: endDate,
                  type: "date",
                  onChange: endDate =>
                    this.loadData(
                      1,
                      min([this.state.startDate, endDate]),
                      endDate
                    )
                }}
              />
            </div>
            <div className="col-sm-3">
              <Link href="/stock/add_edit_stock" color="warning">
                Nuevo abastecimiento
              </Link>
            </div>
          </div>
        </div>
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th scope="col" className="text-center">
                Mtto
              </th>
              <th scope="col" className="text-center">
                Item
              </th>
              <th scope="col" className="text-center">
                Proveedor
              </th>
              <th scope="col" className="text-center">
                Cod. Carga
              </th>
              <th scope="col" className="text-center">
                Almacén
              </th>
              <th scope="col" className="text-center">
                Fecha Reg.
              </th>
              <th scope="col" className="text-center">
                Estatus
              </th>
              <th scope="col" className="text-center">
                Acción
              </th>
              <th scope="col" className="text-center">
                Responsable
              </th>
              <th scope="col" className="text-center">
                Fecha Aten.
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <RowStock
                key={row.id}
                onDelete={this.confirmDeleteRow.bind(this)}
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
          onChange={page =>
            this.loadData(page, this.state.startDate, this.state.endDate)
          }
        />
      </>
    );
  }
}
export default withRouter(Stock);
