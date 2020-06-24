import React from "react";
import {useGlobal} from "reactn";
import {Container, Grid} from "../components";
import {Login} from "../components/auth"

export default ({setPageTitle}) => {
    setPageTitle("Home");

    const [globalAuthUser] = useGlobal("authUser");

    return (
        <Container alignItems="center"
                   justifyContent="center"
                   flexDirection="column">
            <h1>Sistema de Gestión, Logística y Venta Max Import s</h1>
            <Grid gridTemplateColumns="repeat(1, 1fr)"
                  gridTemplateRows="repeat(1, 1fr)"
                  gridGap="2rem"
                  alignItems="center"
            >
                {!globalAuthUser && <Login/>}
            </Grid>

        </Container>
    );
};
