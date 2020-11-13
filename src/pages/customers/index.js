import React, { useEffect, useState } from "react";
import moment from "moment";
import { useRouter } from "next/router";
import {
  Button,
  Container,
  DatePicker,
  Grid,
  Icon,
  Select,
} from "../../components";
import { getUsers, userProvider, getClients } from "../../providers";
import { clientDateFormat } from "../../util";
import { Input, notification, Table, Modal } from "antd";
import { faCalendarAlt, faEye } from "@fortawesome/free-solid-svg-icons";
import { faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";

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
          <Icon marginRight="0px" fontSize="0.8rem" icon={faEye} />
        </Button>
      ),
    },
    {
      dataIndex: "id",
      title: "",
      width: "60px",
      align: "center",
      render: () => (
        <Icon
          onClick={() => setIsVisibleModalDelete(true)}
          marginRight="0px"
          fontSize="1.3rem"
          icon={faToggleOff}
          style={{ cursor: "pointer", color: "#1890FF" }}
        />
      ),
    },
    {
      dataIndex: "createdAt",
      title: "Fecha Reg.",
      align: "center",
      render: (createdAt) => `${moment(createdAt).format(clientDateFormat)}`,
    },
    {
      dataIndex: "active",
      title: "Estado",
      align: "center",
      render: (active) => (active ? "Activo" : "Inacti."),
    },
    {
      dataIndex: "type",
      title: "Tipo",
      align: "center",
      render: (type) => (type === "PERSON" ? "Pers." : "Empr."),
    },
    {
      dataIndex: "idNumber",
      title: "DNI/RUC",
      align: "center",
    },
    {
      dataIndex: "name",
      title: "Nombre/Razón Soc.",
      width: "160px",
      align: "center",
    },
    {
      dataIndex: "lastname",
      title: "Apellidos",
      align: "center",
      render: (lastname) => (lastname ? lastname : "-"),
    },
    {
      dataIndex: "email",
      title: "Correo",
      align: "center",
    },
    {
      dataIndex: "phoneNumber",
      title: "Tel. Contacto",
      align: "center",
    },
  ];

  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  const [clients, setClients] = useState([]);

  const router = useRouter();

  //Datos del usuario
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState({ name: null });

  // Modales
  const [isVisibleModalEdit, setIsVisibleModalEdit] = useState(false);
  const [isVisibleModalDelete, setIsVisibleModalDelete] = useState(false);

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

  //Obtiene a los clientes
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const _clients = await getClients();
        setClients(_clients);
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };

    fetchClients();
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
        visible={isVisibleModalDelete}
        width="40%"
        onCancel={() => setIsVisibleModalDelete(false)}
        footer={null}
      >
        <Container
          height="fit-content"
          flexDirection="column"
          alignItems="center"
        >
          <p style={{ fontWeight: "bold" }}>
            ¿Está seguro que desea pasar a Inactivo al cliente?
          </p>
          <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="0rem">
            <Button margin="auto" type="primary">
              Si, ejecutar
            </Button>
            <Button
              onClick={() => setIsVisibleModalDelete(false)}
              margin="auto"
              type="primary"
            >
              No, regresar
            </Button>
          </Grid>
        </Container>
      </Modal>
      <Modal
        visible={isVisibleModalEdit}
        width="70%"
        title="Editar datos del cliente"
        onCancel={() => setIsVisibleModalEdit(false)}
        footer={null}
      >
        <Container flexDirection="column" height="fit-content">
          <Grid
            marginBottom="1rem"
            gridTemplateColumns="repeat(4, 1fr)"
            gridGap="1rem"
          >
            <Input addonBefore="Fecha Reg." />
            <Select label="Tipo" />
            <Select label="Estado" />
            <Input addonBefore="DNI/RUC" />
          </Grid>
          <Grid
            marginBottom="1rem"
            gridTemplateColumns="repeat(2, 1fr)"
            gridGap="1rem"
          >
            <Input addonBefore="Nombre/Razón Soc." />
            <Input addonBefore="Apellidos" />
            <Input addonBefore="Correo" />
            <Input addonBefore="Tel. Contacto" />
          </Grid>
          <Grid
            marginBottom="1rem"
            gridTemplateColumns="2fr 1fr"
            gridGap="1rem"
          >
            <Input addonBefore="Dirección" />
            <Select label="Agencia Su." />
          </Grid>
          <Grid
            marginBottom="1rem"
            gridTemplateColumns="repeat(3, 1fr)"
            gridGap="1rem"
          >
            <Select label="Departamento" />
            <Select label="Provincia" />
            <Select label="Distrito" />
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
          dataSource={clients}
          pagination={false}
        />
      </Container>
      <Container height="15%">
        <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="8rem">
          <Button
            onClick={() => router.back()}
            type="primary"
            gridColumnStart="2"
          >
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
