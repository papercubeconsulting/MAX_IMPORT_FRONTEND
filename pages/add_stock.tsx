import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { Button } from "reactstrap";
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
import Link from "../components/Link";
import FamiliesProvider, { Family } from "../providers/FamiliesProvider";
import SubFamiliesProvider, {
  SubFamily
} from "../providers/SubFamiliesProvider";
import ElementsProvider, {
  SubFamilyElement
} from "../providers/ElementsProvider";
import ModelsProvider, { ElementModel } from "../providers/ModelsProvider";
import DropdownList, { SelectItem } from "../components/DropdownList";

type StockItem = { id: number; sequentialNo: number };

class StockRow extends React.Component<
  { data: StockItem; onDelete: () => void; families: Family[] },
  {
    family: SelectItem | null;
    subFamily: SelectItem | null;
    subFamilies: SubFamily[];
    element: SelectItem | null;
    elements: SubFamilyElement[];
    model: SelectItem | null;
    models: ElementModel[];
    unicaja: SelectItem | null;
  }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      family: null,
      subFamily: null,
      subFamilies: [],
      element: null,
      elements: [],
      model: null,
      models: [],
      unicaja: null
    };
  }
  async changeFamily(family: SelectItem) {
    let subFamilies = await SubFamiliesProvider.getSubFamilies(family.id);
    this.setState({
      family,
      subFamily: null,
      subFamilies,
      element: null,
      elements: [],
      model: null,
      models: []
    });
  }
  async changeSubFamily(subFamily: SelectItem) {
    let elements = await ElementsProvider.getElements(subFamily.id);
    this.setState({
      subFamily,
      element: null,
      elements,
      model: null,
      models: []
    });
  }
  async changeElement(element: SelectItem) {
    let models = await ModelsProvider.getModels(element.id);
    this.setState({
      element,
      model: null,
      models
    });
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
            onChange={model => this.setState({ model })}
          />
        </td>
        <td>
          <DropdownList
            value={this.state.unicaja}
            title="Unidades/Caja"
            data={[{ id: 50, name: "50" }]}
            onChange={unicaja => this.setState({ unicaja })}
          />
        </td>
        <td>20</td>
      </tr>
    );
  }
}
class Stock extends React.Component<
  {},
  { data: StockItem[]; startDate: Date; families: Family[] }
> {
  constructor(props: any) {
    super(props);
    var data = [];
    data.push({ id: 0, sequentialNo: 1 });
    this.state = {
      data: data,
      startDate: new Date(),
      families: []
    };
  }
  async componentDidMount() {
    this.setState({
      families: await FamiliesProvider.getFamilies()
    });
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
                label="Carga"
                icon="user"
                fieldConfig={{
                  defaultValue: "ABC-123",
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
                  defaultValue: "ALM-1 Gim.",
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
