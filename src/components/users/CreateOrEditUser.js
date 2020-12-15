import React, { useState, useEffect } from "react";
import moment from "moment";
import { clientDateFormat } from "../../util";
import { Button, Container, Grid, Select } from "../../components";
import { Input, notification } from "antd";

export const CreateOrEditUser = ({
  edit,
  dataUser,
  profilesOptions,
  setIsVisibleModalEdit,
  setIsModalResetPasswordVisible,
}) => {
  console.log(dataUser);

  // campos de modal
  const [idNumber, setIdNumber] = useState();
  const [email, setEmail] = useState();
  const [name, setName] = useState();
  const [lastName, setLastName] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [role, setRole] = useState();
  const [active, setActive] = useState();

  useEffect(() => {
    setIdNumber(dataUser.idNumber);
    setEmail(dataUser.email);
    setName(dataUser.name);
    setLastName(dataUser.lastname);
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

  return (
    <>
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
          <Input value={name} addonBefore="Nombres" />
          <Input value={lastName} addonBefore="Apellidos" />
          <Input value={email} addonBefore="Correo" />
          <Input value={phoneNumber} addonBefore="Tel. Contacto" />
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
          {edit && (
            <Button
              type="primary"
              onClick={() => setIsModalResetPasswordVisible(true)}
            >
              Reset Password
            </Button>
          )}
        </Grid>
      </Container>
      <Container>
        <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="4rem">
          <Button type="primary" gridColumnStart="2">
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
