import React, { useState } from "react";
import moment from "moment";
import { clientDateFormat } from "../../util";
import { Button, Container, Grid, Select } from "../../components";
import { Input, notification } from "antd";

export const CreateOrEditUser = ({
  edit,
  dataUser = {},
  setIsVisibleModalEdit,
  setIsModalResetPasswordVisible,
}) => {
  console.log(dataUser);

  // campos de modal
  const [idNumber, setIdNumber] = useState(dataUser.idNumber);
  const [email, setEmail] = useState(dataUser.email);
  const [name, setName] = useState(dataUser.name);
  const [lastName, setLastName] = useState(dataUser.lastname);
  const [phoneNumber, setPhoneNumber] = useState(dataUser.phoneNumber);
  const [role, setRole] = useState(dataUser.role);
  const [active, setActive] = useState(dataUser.active);

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
          />
          <Select label="Estado" />
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
          <Select label="Perfil" />
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
