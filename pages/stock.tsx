import 'bootstrap/dist/css/bootstrap.min.css';
import { NextPage } from 'next';
import React from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEdit, faSearch, faTrashAlt, faEye, faCheck, faCalendarAlt, faUser } from '@fortawesome/free-solid-svg-icons'
library.add(faEdit, faTrashAlt, faSearch, faEye, faCheck, faCalendarAlt, faUser)

import FieldGroup from '../components/FieldGroup'

type RowStock = {id: number, state: string};

const RowSample: NextPage<{data: RowStock}> = ({data}) => (
  <tr>
    <td>
      <Button color="info" style={{marginRight: 4, marginLeft: 0}}><FontAwesomeIcon icon="edit" /></Button>
      <Button color="warning" style={{marginRight: 0, marginLeft: 4}}><FontAwesomeIcon icon="trash-alt" /></Button>
    </td>
    <td>{data.id}</td>
    <td>Hangzhou</td>
    <td>XYZ-456</td>
    <td>ALM-1 Gim</td>
    <td>25/11/2019</td>
    <td>
      {data.state=='ATE'&&'Atendido'}
      {data.state=='PEN'&&'Pendiente'}
    </td>
    <td>
      {data.state=='ATE'&&<Button color="info" style={{width: '100%'}}><FontAwesomeIcon icon="eye" /> Ver</Button>}
      {data.state=='PEN'&&<Button color="success" style={{width: '100%'}}><FontAwesomeIcon icon="check" /> Atender</Button>}
    </td>
    <td>Charles X.</td>
    <td>25/11/2019</td>
  </tr>
)
const Stock: NextPage<{ data: RowStock[] }> = ({ data }) => (
  <>
  <>
  <div className="container" style={{maxWidth: "100%"}}>
    <div className="row" style={{alignItems: "center"}}>
      <div className="col-sm-2">
        <FieldGroup label='Usuario' value='Luis Rivera' icon='user'/>
      </div>
      <div className="col-sm-3">
        <FieldGroup label='Fecha Inicio' value='01/09/2019' icon='calendar-alt'/>
      </div>
      <div className="col-sm-3">
        <FieldGroup label='Fecha Fin' value='01/09/2019' icon='calendar-alt'/>
      </div>
      <div className="col-sm-2">
        <Button color="info" style={{width: '100%'}}><FontAwesomeIcon icon="search"/> Buscar</Button>
      </div>
      <div className="col-sm-2">
        <Button color="warning" style={{width: '100%'}}>Nuevo abastecimiento</Button>
      </div>
    </div>
  </div>
  </>
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
      {data.map(row=><RowSample data={row}/>)}
    </tbody>
  </table>
  <nav aria-label="Page navigation example">
    <ul className="pagination justify-content-center">
      <li className="page-item disabled">
        <a className="page-link" href="#">Previa</a>
      </li>
      <li className="page-item active"><a className="page-link" href="#" tabIndex={-1}>1</a></li>
      <li className="page-item"><a className="page-link" href="#">2</a></li>
      <li className="page-item"><a className="page-link" href="#">3</a></li>
      <li className="page-item"><a className="page-link" href="#">4</a></li>
      <li className="page-item"><a className="page-link" href="#">5</a></li>
      <li className="page-item">
        <a className="page-link" href="#">Siguiente</a>
      </li>
    </ul>
  </nav>
  </>
);

Stock.getInitialProps = async ({ req }) => {
  var data = [];
  for(let i=0;i<10;++i){
    data.push({id: i+1, state: i<5?'PEN':'ATE'});
  }
  return { data };
};

export default Stock;