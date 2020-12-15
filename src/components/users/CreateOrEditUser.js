import React, { useState, useEffect } from "react";
import moment from "moment";
import { postUser, forgotPassword } from "../../providers";
import { clientDateFormat } from "../../util";
import { Button, Container, Grid, Select } from "../../components";
import { Input, notification, Modal } from "antd";

export const CreateOrEditUser = ({
  edit,
  dataUser,
  profilesOptions,
  setIsVisibleModalEdit,
  updateUser,
  setToggleUpdateTable,
}) => {
  /* console.log(dataUser); */

  // campos de modal
  const [idNumber, setIdNumber] = useState();
  const [email, setEmail] = useState();
  const [name, setName] = useState();
  const [lastname, setLastname] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [role, setRole] = useState();
  const [active, setActive] = useState();
  const [password, setPassword] = useState();

  const [
    isModalResetPasswordVisible,
    setIsModalResetPasswordVisible,
  ] = useState(false);

  useEffect(() => {
    setIdNumber(dataUser.idNumber);
    setEmail(dataUser.email);
    setName(dataUser.name);
    setLastname(dataUser.lastname);
    setPhoneNumber(dataUser.phoneNumber);
    setRole(dataUser.role);
    setActive(dataUser.active);
  }, [dataUser]);

  const statusOptions = [
    {
      value: true,
      label: "Activo",
    },
    {
      value: false,
      label: "Inactivo",
    },
  ];

  // crear usuario
  const createUser = async () => {
    try {
      const response = await postUser({
        idNumber,
        email,
        name,
        lastname,
        phoneNumber,
        role,
        password,
      });
      console.log(response);
      setIsVisibleModalEdit(false);
      setToggleUpdateTable((prev) => !prev);
      notification.success({
        message: "Usuario creado exitosamente ",
      });
    } catch (error) {
      console.log(error);
      notification.error({
        message: "Error al crear usuario",
        description: error.userMessage,
      });
    }
  };

  // enviar correo para nueva contraseña
  const submitResetPassword = async () => {
    try {
      const response = await forgotPassword({ email });
      notification.success({
        message: `Revise su bandeja de entrada`,
        description: `Se ha enviado un correo a ${email}`,
      });
      setIsModalResetPasswordVisible(false);
      setIsVisibleModalEdit(false);
    } catch (error) {
      notification.error({
        message: "Error al identificarse",
        description: error.message,
      });
    }
  };

  return (
    <>
      <Modal
        visible={isModalResetPasswordVisible}
        onOk={() => submitResetPassword()}
        onCancel={() => setIsModalResetPasswordVisible(false)}
        width="40%"
        title="Recuperar contraseña"
      >
        Enviaremos un correo con un link para que pueda cambiar su contraseña al
        email que ingresó en la casilla correo: {email}
      </Modal>
      <Container flexDirection="column" height="fit-content">
        <Grid
          marginBottom="1rem"
          gridTemplateColumns="repeat(3, 1fr)"
          gridGap="1rem"
        >
          <Input
            value={`${moment(dataUser.createdAt).format(clientDateFormat)}`}
            addonBefore="Fecha Reg."
            disabled
          />
          <Select
            value={active}
            onChange={(value) => setActive(value)}
            options={statusOptions}
            label="Estado"
          />
          <Input
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            addonBefore="DNI"
          />
        </Grid>
        <Grid
          marginBottom="1rem"
          gridTemplateColumns="repeat(2, 1fr)"
          gridGap="1rem"
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            addonBefore="Nombres"
          />
          <Input
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            addonBefore="Apellidos"
          />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            addonBefore="Correo"
          />
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            addonBefore="Tel. Contacto"
          />
        </Grid>
        <Grid
          marginBottom="1rem"
          gridTemplateColumns="repeat(2, 1fr)"
          gridGap="1rem"
        >
          <Select
            value={role}
            onChange={(value) => setRole(value)}
            options={profilesOptions.filter(
              (status) => status.label !== "Todos"
            )}
            label="Perfil"
          />
          {edit ? (
            <Button
              type="primary"
              onClick={() => setIsModalResetPasswordVisible(true)}
            >
              Reset Password
            </Button>
          ) : (
            <Input
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              addonBefore="Contraseña"
            />
          )}
        </Grid>
      </Container>
      <Container>
        <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="4rem">
          <Button
            onClick={() => {
              if (edit) {
                updateUser({
                  idNumber,
                  email,
                  name,
                  lastname,
                  phoneNumber,
                  role,
                  active,
                });
              } else {
                console.log("agregar nuevo user");
                createUser();
              }
            }}
            type="primary"
            gridColumnStart="2"
          >
            Confirmar
          </Button>
          <Button
            type="primary"
            gridColumnStart="3"
            onClick={() => setIsVisibleModalEdit(false)}
          >
            Cancelar
          </Button>
        </Grid>
      </Container>
    </>
  );
};
