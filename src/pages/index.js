import React from "react";
import {Container} from "../components";

export default ({setPageTitle}) => {
    setPageTitle("Home");

    return (
        <Container alignItems="center"
                   justifyContent="center">
            <h1>Sistema de Gestión, Logística y Venta Max Import</h1>
        </Container>
    );
};