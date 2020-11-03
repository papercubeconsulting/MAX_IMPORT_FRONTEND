import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  DatePicker,
  Grid,
  Icon,
  Select,
} from "../../components";
import { getUsers, userProvider } from "../../providers";
import { Input, notification, Table, Modal } from "antd";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";

export default ({ setPageTitle }) => {
  setPageTitle("BD de Clientes");
  const columns = [
    {
      dataIndex: "id",
      title: "",
      width: "60px",
      align: "center",
      render: () => (
        <Button
          padding="0 0.5rem"
          type="primary"
          onClick={() => setIsVisibleModalEdit(true)}
        >
          <Icon marginRight="0px" fontSize="0.8rem" icon={faPen} />
        </Button>
      ),
    },
    {
      dataIndex: "id",
      title: "",
      width: "60px",
      align: "center",
      render: () => (
        <Button padding="0 0.5rem" type="primary">
          <Icon marginRight="0px" fontSize="0.8rem" icon={faTrash} />
        </Button>
      ),
    },
    {
      dataIndex: "id",
      title: "Fecha Reg.",
      align: "center",
    },
    {
      dataIndex: "createdAt",
      title: "Estado",
      align: "center",
    },
    {
      dataIndex: "createdAt",
      title: "Tipo",
      align: "center",
    },
    {
      dataIndex: "proformaId",
      title: "DNI/RUC",
      align: "center",
    },
    {
      dataIndex: "proforma",
      title: "Nombre/Razón Soc.",
      width: "160px",
      align: "center",
    },
    {
      dataIndex: "sale",
      title: "Apellidos",
      align: "center",
    },
    {
      dataIndex: "id",
      title: "Correo",
      align: "center",
    },
    {
      dataIndex: "proforma",
      title: "Tel. Contacto",
      align: "center",
    },
  ];

  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  //Datos del usuario
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState({ name: null });

  // Modales
  const [isVisibleModalEdit, setIsVisibleModalEdit] = useState(true);

  //Obtiene a los vendedores
  useEffect(() => {
    const initialize = async () => {
      try {
        const _users = await getUsers();
        setUsers(_users);
        const _me = await userProvider.getUser();
        setMe(_me);
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };

    initialize();
  }, []);

  const statusOptions = [
    {
      value: null,
      label: "Todos",
    },
    {
      value: "",
      label: "Activo",
    },
    {
      value: "",
      label: "Inactivo",
    },
  ];

  return (
    <>
      <Modal
        visible={isVisibleModalEdit}
        width="70%"
        title="Editar datos del cliente"
        onCancel={() => setIsVisibleModalEdit(false)}
        footer={null}
      >
        <Container flexDirection="column" height="fit-content">
          <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="1rem">
            <Input addonBefore="Fecha Reg." />
            <Select label="Tipo" />
            <Select label="Estado" />
            <Input addonBefore="DNI/RUC" />
          </Grid>
        </Container>
        <Container flexDirection="column" height="fit-content">
          <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="1rem">
            <Input addonBefore="Nombre/Razón Soc." />
            <Input addonBefore="Apellidos" />
            <Input addonBefore="Correo" />
            <Input addonBefore="Tel. Contacto" />
          </Grid>
        </Container>
        <Container flexDirection="column" height="fit-content">
          <Grid gridTemplateColumns="2fr 1fr" gridGap="1rem">
            <Input addonBefore="Dirección" />
            <Select label="Agencia Su." />
          </Grid>
        </Container>
        <Container flexDirection="column" height="fit-content">
          <Grid gridTemplateColumns="repeat(3, 1fr)" gridGap="1rem">
            <Input addonBefore="Departamento" />
            <Input addonBefore="Provincia" />
            <Input addonBefore="Distrito" />
          </Grid>
        </Container>
        <Container>
          <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="8rem">
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
      </Modal>
      <Container height="fit-content">
        <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="1rem">
          <Input value={me.name} disabled addonBefore="Usuario" />
          <DatePicker
            label={
              <>
                <Icon icon={faCalendarAlt} />
                Fecha Inicio
              </>
            }
          />
          <DatePicker
            label={
              <>
                <Icon icon={faCalendarAlt} />
                Fecha Fin
              </>
            }
          />
          <Select label="Estado" options={statusOptions} />
          <Input placeholder="Nombre/Razón Soc." addonBefore="Cliente" />
          <Input placeholder="Apellidos" />
          <Input placeholder="DNI/RUC" />
          <Button
            type="primary"
            gridColumnStart="4"
            onClick={async () => searchWithState()}
          >
            Buscar
          </Button>
        </Grid>
      </Container>
      <Container height="fit-content">
        <Table
          columns={columns}
          scroll={{ y: windowHeight * 0.4 - 48 }}
          bordered
          dataSource={[{ id: 1 }]}
        />
      </Container>
      <Container height="15%">
        <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="8rem">
          <Button type="primary" gridColumnStart="2">
            Regresar
          </Button>
          <Button type="primary" gridColumnStart="3">
            Exportar a SIGO
          </Button>
        </Grid>
      </Container>
    </>
  );
};
