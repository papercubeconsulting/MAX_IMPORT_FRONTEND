import React, {useEffect} from "react";
import {Container, Grid} from "../components";
import {Login} from "../components/auth"
import { Button } from "antd";
import {get} from "lodash";

export default ({setPageTitle}) => {
    setPageTitle("Home");

    return (
        <Container alignItems="center"
                   justifyContent="center"
                   flexDirection="column">
                <h1>Sistema de Gestión, Logística y Venta Max Import</h1>       
            <Grid gridTemplateColumns="repeat(1, 1fr)"
                  gridTemplateRows="repeat(1, 1fr)"
                  gridGap="2rem"
                  alignItems="center"
                  >
                
                {/* {!globalAuthUser && <Login/>} */}
                <Login/>

            </Grid>

        </Container>
    );
};
