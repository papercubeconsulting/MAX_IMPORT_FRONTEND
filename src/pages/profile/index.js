import React, { useEffect, useState } from "react";

import { Button, Container, Grid } from "../../components";
import { Input, notification, Form } from "antd";

export default ({ setPageTitle }) => {
  setPageTitle("Perfil");

  const [me, setMe] = useState({});

  useEffect(() => {
    const { token, user } = JSON.parse(localStorage.getItem("authUser"));
    /* console.log(token); */
    setMe(user);
  }, []);

  const profilesOptions = [
    {
      value: "manager",
      label: "Administrador",
    },
    {
      value: "logistic",
      label: "Logístico",
    },
    {
      value: "superuser",
      label: "Super usuario",
    },
    {
      value: "seller",
      label: "Vendedor",
    },
  ];

  return (
    <>
      <Container height="20%" width="70%" style={{ margin: "2rem auto" }}>
        <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="2rem 5rem">
          <Input value={me.name} disabled addonBefore="Nombre" />
          <Input value={me.idNumber} disabled addonBefore="DNI" />
          <Input value={me.lastname} disabled addonBefore="Apellido" />
          <Input
            value={
              profilesOptions.find((profile) => profile.value === me.role)
                ?.label
            }
            disabled
            addonBefore="Perfil"
          />
        </Grid>
      </Container>
      <Container
        height="auto"
        width="70%"
        style={{ margin: "2rem auto 0 auto" }}
      >
        <h3 style={{ fontWeight: "bold" }}>Cambiar contraseña</h3>
      </Container>
      <Container height="20%" width="70%" style={{ margin: "0 auto" }}>
        <Grid gridTemplateColumns="3fr 2fr" gridGap="0rem 5rem">
          <Form name="login">
            <Form.Item
              name="old-password"
              rules={[
                {
                  required: true,
                  message: "Por favor ingrese su contraseña actual",
                },
              ]}
            >
              <Input.Password addonBefore="Contraseña Actual" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Por favor ingrese su nueva contraseña",
                },
              ]}
            >
              <Input.Password addonBefore="Nueva Contraseña" />
            </Form.Item>
            <Form.Item
              name="new-password"
              rules={[
                {
                  required: true,
                  message: "Por favor ingrese nuevamente su nueva contraseña",
                },
              ]}
            >
              <Input.Password addonBefore="Confirmar Contraseña" />
            </Form.Item>
            <Form.Item>
              <Button width="100%" type="primary" htmlType="submit">
                Cambiar contraseña
              </Button>
            </Form.Item>
          </Form>
        </Grid>
      </Container>
    </>
  );
};
