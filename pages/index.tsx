import "bootstrap/dist/css/bootstrap.min.css";
import { NextPage } from "next";
import React from "react";
import { Button } from "reactstrap";
import FieldGroup from "../components/FieldGroup";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCalendarAlt, faUser } from "@fortawesome/free-solid-svg-icons";
import Link from "../components/Link";
library.add(faCalendarAlt, faUser);
const buttonProps = { color: "info", style: { borderRadius: 0 } };
const Home: NextPage<{}> = ({}) => (
  <div style={{ height: "100vh", width: "100vw", display: "flex" }}>
    <div style={{ flex: 1, flexDirection: "column", display: "flex" }}>
      <Link {...buttonProps} href="#">
        Perfil
      </Link>
      <Link {...buttonProps} href="#">
        Nueva Proforma
      </Link>
      <Link {...buttonProps} href="#">
        Historial Proformas
      </Link>
      <Link {...buttonProps} href="#">
        Pagos en Caja
      </Link>
      <Link {...buttonProps} href="#">
        Despachos
      </Link>
      <Link {...buttonProps} href="#">
        Admin Ventas
      </Link>
      <Link {...buttonProps} href="#">
        Inventario
      </Link>
      <Link {...buttonProps} href="./stock">
        Abastecimientos
      </Link>
      <Link {...buttonProps} href="#">
        BD Clientes
      </Link>
      <Link {...buttonProps} href="#">
        Admin Usuarios
      </Link>
    </div>
    <div
      style={{ flex: 3, flexDirection: "column", display: "flex", margin: 10 }}
    >
      <FieldGroup
        label="Fecha"
        icon="calendar-alt"
        fieldConfig={{ defaultValue: new Date(), type: "date" }}
      />
      <FieldGroup
        label="Usuario"
        icon="user"
        fieldConfig={{ defaultValue: "Luis Rivera", type: "text" }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          flexDirection: "column"
        }}
      >
        <div
          style={{ fontSize: 30, justifyContent: "center", display: "flex" }}
        >
          Sistema de Gestion Logistica y Venta Max Import
        </div>
      </div>
    </div>
  </div>
);

export default Home;
