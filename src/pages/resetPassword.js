import React from "react";
import {useRouter} from "next/router";
import {Container, Grid} from "../components";
import {ResetPassword} from "../components/auth"
import {useAuthUser} from "../util";

export default ({setPageTitle}) => {
    setPageTitle("Recuperar contraseña");

    const router = useRouter();
    const {email, token} = router.query
    const {authUser} = useAuthUser();

    const displayForm = !authUser && token && email;

    return (
        <Container alignItems="center"
                   justifyContent="center"
                   flexDirection="column"
                   textAlign="center">
            <h1>Sistema de Gestión, Logística y Venta Max Import</h1>
            <Grid
                gridGap="2rem"
                alignItems="center"
                textAlign="center"
            >
                {displayForm ?
                    <ResetPassword email={email}
                                   token={token}/> :
                    <h2>Error al recuperar contraseña, por favor vuelva a ingresar al link enviado por correo</h2>
                }

            </Grid>

        </Container>
    );
};
