import "bootstrap/dist/css/bootstrap.min.css";
import { NextPage } from "next";
import React from "react";
import {
  Button,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Dropdown,
  UncontrolledDropdown
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faEdit,
  faSearch,
  faTrashAlt,
  faEye,
  faCheck,
  faCalendarAlt,
  faUser,
  faPlusCircle
} from "@fortawesome/free-solid-svg-icons";
library.add(
  faEdit,
  faTrashAlt,
  faSearch,
  faEye,
  faCheck,
  faCalendarAlt,
  faUser,
  faPlusCircle
);

import FieldGroup from "../components/FieldGroup";
import { max, min } from "date-fns";
import Link from "../components/Link";

type StockItem = { id: number; sequentialNo: number };

class RowSample extends React.Component<
  { data: StockItem; onDelete: () => void },
  { familia: string; subFamilia: string }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      familia: "Arrancador",
      subFamilia: "Relay"
    };
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
        <td>{data.sequentialNo}</td>
        <td>
          <UncontrolledDropdown>
            <DropdownToggle caret>{this.state.familia}</DropdownToggle>
            <DropdownMenu>
              <DropdownItem header>Familia</DropdownItem>
              <DropdownItem
                onClick={() => this.setState({ familia: "Arrancador" })}
              >
                Arrancador
              </DropdownItem>
              <DropdownItem
                onClick={() => this.setState({ familia: "Alternador" })}
              >
                Alternador
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </td>
        <td>
          <UncontrolledDropdown>
            <DropdownToggle caret>{this.state.subFamilia}</DropdownToggle>
            <DropdownMenu>
              <DropdownItem header>Sub-Familia</DropdownItem>
              <DropdownItem
                onClick={() => this.setState({ subFamilia: "Relay" })}
              >
                Relay
              </DropdownItem>
              <DropdownItem
                onClick={() => this.setState({ subFamilia: "Portacarbon" })}
              >
                Portacarbon
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </td>
        <td>
          <UncontrolledDropdown>
            <DropdownToggle caret>Carbones</DropdownToggle>
            <DropdownMenu>
              <DropdownItem header>Elemento</DropdownItem>
              <DropdownItem>Carbones</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </td>
        <td>
          <UncontrolledDropdown>
            <DropdownToggle caret>ABCD</DropdownToggle>
            <DropdownMenu>
              <DropdownItem header>Modelo</DropdownItem>
              <DropdownItem>ABCD</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </td>
        <td>
          <UncontrolledDropdown>
            <DropdownToggle caret>50</DropdownToggle>
            <DropdownMenu>
              <DropdownItem header>nidades/Caja</DropdownItem>
              <DropdownItem>50</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </td>
        <td>20</td>
      </tr>
    );
  }
}
class Stock extends React.Component<
  {},
  { data: StockItem[]; startDate: Date }
> {
  constructor(props: any) {
    super(props);
    var data = [];
    data.push({ id: 0, sequentialNo: 1 });
    this.state = {
      data: data,
      startDate: new Date()
    };
  }
  addRow() {
    let { data } = this.state;
    let lastId = data.length > 0 ? data[data.length - 1].id : 0;
    let lastSeqNo = data.length > 0 ? data[data.length - 1].sequentialNo : 0;
    data.push({ id: lastId + 1, sequentialNo: lastSeqNo + 1 });
    this.setState({ data: data });
  }
  deleteRow(id: number) {
    let { data } = this.state;
    let newData = [];
    for (let i = 0; i < data.length; ++i) {
      if (data[i].id != id) newData.push(data[i]);
    }
    for (let i = 0; i < newData.length; ++i) {
      newData[i].sequentialNo = i + 1;
    }
    this.setState({ data: newData });
  }
  render() {
    let { data, startDate } = this.state;
    return (
      <>
        <div className="container" style={{ maxWidth: "100%" }}>
          <div className="row" style={{ alignItems: "center" }}>
            <div className="col-sm-3">
              <FieldGroup
                label="Proveedor"
                icon="user"
                fieldConfig={{
                  defaultValue: "China Inc",
                  type: "text",
                  onChange: text => {
                    console.log(text);
                  }
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Proveedor"
                icon="user"
                fieldConfig={{
                  defaultValue: "China Inc",
                  type: "text",
                  onChange: text => {
                    console.log(text);
                  }
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Almacén"
                icon="user"
                fieldConfig={{
                  defaultValue: "China Inc",
                  type: "text",
                  onChange: text => {
                    console.log(text);
                  }
                }}
              />
            </div>
            <div className="col-sm-3">
              <FieldGroup
                label="Fecha"
                icon="calendar-alt"
                fieldConfig={{
                  defaultValue: startDate,
                  type: "date",
                  onChange: startDate =>
                    this.setState({
                      startDate: startDate
                    })
                }}
              />
            </div>
          </div>
        </div>
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th scope="col"></th>
              <th scope="col">Item</th>
              <th scope="col">Familia</th>
              <th scope="col">Sub-Familia</th>
              <th scope="col">Elemento</th>
              <th scope="col">Modelo</th>
              <th scope="col">Uni/Caj</th>
              <th scope="col">Cantidad Cajas</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <RowSample
                key={row.id}
                data={row}
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
        <div className="row">
          <div className="col-sm-3"></div>
          <div className="col-sm-6">
            <Link href="/stock" color="success" style={{ width: "100%" }}>
              <FontAwesomeIcon icon="check" /> Crear/Modificar
            </Link>
          </div>
          <div className="col-sm-3"></div>
        </div>
      </>
    );
  }
}
export default Stock;
