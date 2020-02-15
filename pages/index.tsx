import 'bootstrap/dist/css/bootstrap.min.css';
import { NextPage } from 'next';
import React from 'react';
import { Button } from 'reactstrap';
import FieldGroup from '../components/FieldGroup'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCalendarAlt, faUser } from '@fortawesome/free-solid-svg-icons'
library.add(faCalendarAlt, faUser)
const Link: NextPage<{href: string,}> = ({href, children}) => (
    <a style={{flexGrow: 1}} href={href}>
        <Button color='info' style={{width: '100%', height: '100%', borderRadius: 0}}>
            {children}
        </Button>
    </a>
)
const Home: NextPage<{ }> = ({}) => (
  <div style={{height: '100vh', width: '100vw', display: 'flex'}}>
    <div style={{flex: 1, flexDirection: "column", display: 'flex'}}>
        <Link href='#'>Perfil</Link>
        <Link href='#'>Nueva Proforma</Link>
        <Link href='#'>Historial Proformas</Link>
        <Link href='#'>Pagos en Caja</Link>
        <Link href='#'>Despachos</Link>
        <Link href='#'>Admin Ventas</Link>
        <Link href='#'>Inventario</Link>
        <Link href='./stock'>Abastecimientos</Link>
        <Link href='#'>BD Clientes</Link>
        <Link href='#'>Admin Usuarios</Link>
    </div>
    <div style={{flex: 3, flexDirection: "column", display: 'flex', margin: 10}}>
                <FieldGroup label='Fecha' value='01/09/2019' icon='calendar-alt'/>
                <FieldGroup label='Usuario' value='Luis Rivera' icon='user'/>
        <div style={{flex: 1, display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
            <div style={{fontSize: 30, justifyContent: 'center', display: 'flex'}}>
                Sistema de Gestion Logistica y Venta Max Import
            </div>
        </div>
    </div>
  </div>
);

export default Home;