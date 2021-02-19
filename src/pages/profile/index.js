import React, { useEffect, useState } from "react";
import { updatePassword } from "../../providers";

import { Button, Container, Grid } from "../../components";
import { Input, notification, Form } from "antd";

export default ({ setPageTitle }) => {
  setPageTitle("Perfil");

  const [me, setMe] = useState({});
  const [token, setToken] = useState();

  useEffect(() => {
    const { token, user } = JSON.parse(localStorage.getItem("authUser"));
    setToken(token);
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

  const onResetPassword = async (values) => {
    try {
      const response = await updatePassword({
        oldPassword: values.oldPassword,
        password: values.password,
      });
      console.log(response);
      notification.success({
        message: "Actualización exitosa",
        description: "Inicie sesión con su nueva contraseña",
      });
    } catch (error) {
      console.log(error);
      notification.error({
        message: "Error al intentar cambiar contraseña",
        description: error.userMessage,
      });
    }
  };

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
          <Form name="login" onFinish={onResetPassword}>
            <Form.Item
              name="oldPassword"
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
              hasFeedback
              rules={[
                {
                  min: 8,
                  required: true,
                  message:
                    "Por favor ingrese una contraseña de al menos 8 caracteres",
                },
              ]}
            >
              <Input.Password addonBefore="Nueva Contraseña" />
            </Form.Item>
            <Form.Item
              name="confirm"
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Confirme su contraseña",
                },
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject("Las contraseñas no coinciden");
                  },
                }),
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
