import "bootstrap/dist/css/bootstrap.min.css";
import { NextPage } from "next";
import React from "react";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
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

import FieldGroup from "../components/FieldGroup";
import { max, min } from "date-fns";
import Pagination from "../components/Pagination";

type RowStock = { id: number; state: string };

const RowSample: NextPage<{ data: RowStock }> = ({ data }) => (
  <tr>
    <td>
      <Button color="info" style={{ marginRight: 4, marginLeft: 0 }}>
        <FontAwesomeIcon icon="edit" />
      </Button>
      <Button color="warning" style={{ marginRight: 0, marginLeft: 4 }}>
        <FontAwesomeIcon icon="trash-alt" />
      </Button>
    </td>
    <td>{data.id}</td>
    <td>Hangzhou</td>
    <td>XYZ-456</td>
    <td>ALM-1 Gim</td>
    <td>25/11/2019</td>
    <td>
      {data.state == "ATE" && "Atendido"}
      {data.state == "PEN" && "Pendiente"}
    </td>
    <td>
      {data.state == "ATE" && (
        <Button color="info" style={{ width: "100%" }}>
          <FontAwesomeIcon icon="eye" /> Ver
        </Button>
      )}
      {data.state == "PEN" && (
        <Button color="success" style={{ width: "100%" }}>
          <FontAwesomeIcon icon="check" /> Atender
        </Button>
      )}
    </td>
    <td>Charles X.</td>
    <td>25/11/2019</td>
  </tr>
);
class Stock extends React.Component<
  {},
  {
    data: RowStock[];
    startDate: Date;
    endDate: Date;
    page: number;
    maxPage: number;
  }
> {
  constructor(props: any) {
    super(props);
    var data = [];
    for (let i = 0; i < 10; ++i) {
      data.push({ id: i + 1, state: i < 5 ? "PEN" : "ATE" });
    }
    this.state = {
      data: data,
      startDate: new Date(),
      endDate: new Date(),
      page: 1,
      maxPage: 12
    };
  }
  render() {
    let { data, startDate, endDate, page, maxPage } = this.state;
    return (
      <>
        <div className="container" style={{ maxWidth: "100%" }}>
          <div className="row" style={{ alignItems: "center" }}>
            <div className="col-sm-2">
              <FieldGroup
                label="Usuario"
                icon="user"
                fieldConfig={{ defaultValue: "Luis Rivera", type: "text" }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Fecha Inicio"
                icon="calendar-alt"
                fieldConfig={{
                  defaultValue: startDate,
                  type: "date",
                  onChange: startDate =>
                    this.setState({
                      startDate: startDate,
                      endDate: max([startDate, this.state.endDate])
                    })
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Fecha Fin"
                icon="calendar-alt"
                fieldConfig={{
                  defaultValue: endDate,
                  type: "date",
                  onChange: endDate =>
                    this.setState({
                      startDate: min([this.state.startDate, endDate]),
                      endDate
                    })
                }}
              />
            </div>
            <div className="col-sm-2">
              <Button color="info" style={{ width: "100%" }}>
                <FontAwesomeIcon icon="search" /> Buscar
              </Button>
            </div>
            <div className="col-sm-2">
              <Button color="warning" style={{ width: "100%" }}>
                Nuevo abastecimiento
              </Button>
            </div>
          </div>
        </div>
        <table className="table">
          <thead className="thead-dark">
            <tr>
              <th scope="col">Mtto</th>
              <th scope="col">Item</th>
              <th scope="col">Proveedor</th>
              <th scope="col">Cod. Carga</th>
              <th scope="col">Almacén</th>
              <th scope="col">Fecha Reg.</th>
              <th scope="col">Estatus</th>
              <th scope="col">Acción</th>
              <th scope="col">Responsable</th>
              <th scope="col">Fecha Aten.</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <RowSample key={row.id} data={row} />
            ))}
          </tbody>
        </table>
        <Pagination
          page={page}
          maxPage={maxPage}
          halfWidth={5}
          onChange={page => this.setState({ page })}
        />
      </>
    );
  }
}
export default Stock;
