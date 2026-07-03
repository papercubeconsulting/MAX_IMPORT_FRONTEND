import React, { useEffect, useState } from "react";
import { updatePassword } from "../../providers";

import { Button, Container, Grid } from "../../components";
import { Input, notification, Form } from "antd";
import styled from "styled-components";

const ProfilePage = styled.div`
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    height: 100%;
    min-height: 0;
    overflow-y: auto;
    padding: 0.75rem;
  }
`;

const ProfileInfoSection = styled(Container)`
  @media (max-width: 768px) {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
    height: auto !important;
    margin: 0 !important;
    padding: 0.75rem !important;
    width: 100% !important;
  }
`;

const ProfileInfoGrid = styled(Grid)`
  @media (max-width: 768px) {
    display: none !important;
  }
`;

const MobileInfoList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: grid;
    gap: 0.55rem;
  }
`;

const MobileInfoRow = styled.div`
  @media (max-width: 768px) {
    display: grid;
    gap: 0.25rem;
    grid-template-columns: minmax(5rem, 0.38fr) minmax(0, 1fr);

    span {
      color: #667085;
      font-size: 0.78rem;
      line-height: 1rem;
    }

    strong {
      color: #1f2937;
      font-size: 0.9rem;
      font-weight: 600;
      line-height: 1.1rem;
      overflow-wrap: anywhere;
      text-align: right;
    }
  }
`;

const ProfilePasswordTitle = styled(Container)`
  @media (max-width: 768px) {
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;

    h3 {
      font-size: 1rem;
      line-height: 1.2rem;
      margin: 0;
    }
  }
`;

const ProfilePasswordSection = styled(Container)`
  @media (max-width: 768px) {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
    height: auto !important;
    margin: 0 !important;
    padding: 0.75rem !important;
    width: 100% !important;
  }
`;

const ProfilePasswordGrid = styled(Grid)`
  @media (max-width: 768px) {
    display: block !important;

    form {
      width: 100%;
    }

    .ant-form-item {
      margin-bottom: 0.75rem;
    }

    .ant-input-wrapper.ant-input-group {
      align-items: stretch;
      display: flex;
      width: 100%;
    }

    .ant-input-group-addon {
      align-items: center;
      display: flex;
      flex: 0 0 7.5rem;
      font-size: 0.78rem !important;
      line-height: 1rem !important;
      overflow-wrap: anywhere;
      padding: 0.35rem 0.5rem;
      text-align: left;
      white-space: normal;
      width: 7.5rem !important;
    }

    .ant-input-affix-wrapper {
      min-width: 0;
      width: 100%;
    }

    button {
      min-height: 2.35rem;
      width: 100% !important;
    }
  }
`;

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
    <ProfilePage>
      <ProfileInfoSection height="20%" width="70%" style={{ margin: "2rem auto" }}>
        <ProfileInfoGrid gridTemplateColumns="repeat(2, 1fr)" gridGap="2rem 5rem">
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
        </ProfileInfoGrid>
        <MobileInfoList>
          <MobileInfoRow>
            <span>Nombre</span>
            <strong>{me.name || "-"}</strong>
          </MobileInfoRow>
          <MobileInfoRow>
            <span>Apellido</span>
            <strong>{me.lastname || "-"}</strong>
          </MobileInfoRow>
          <MobileInfoRow>
            <span>DNI</span>
            <strong>{me.idNumber || "-"}</strong>
          </MobileInfoRow>
          <MobileInfoRow>
            <span>Perfil</span>
            <strong>
              {profilesOptions.find((profile) => profile.value === me.role)
                ?.label || "-"}
            </strong>
          </MobileInfoRow>
        </MobileInfoList>
      </ProfileInfoSection>
      <ProfilePasswordTitle
        height="auto"
        width="70%"
        style={{ margin: "2rem auto 0 auto" }}
      >
        <h3 style={{ fontWeight: "bold" }}>Cambiar contraseña</h3>
      </ProfilePasswordTitle>
      <ProfilePasswordSection height="20%" width="70%" style={{ margin: "0 auto" }}>
        <ProfilePasswordGrid gridTemplateColumns="3fr 2fr" gridGap="0rem 5rem">
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
        </ProfilePasswordGrid>
      </ProfilePasswordSection>
    </ProfilePage>
  );
};
