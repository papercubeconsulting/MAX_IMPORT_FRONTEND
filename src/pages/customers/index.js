import React, { useEffect, useState, useRef } from "react";
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
import {
  getUsers,
  userProvider,
  getClients,
  getClientById,
  putClient,
} from "../../providers";
import { urlQueryParams, serverDateFormat, clientDateFormat } from "../../util";
import { Input, notification, Table, Modal, Space } from "antd";
import { faCalendarAlt, faEye } from "@fortawesome/free-solid-svg-icons";
import { faUser, faUserSlash } from "@fortawesome/free-solid-svg-icons";

export default ({ setPageTitle }) => {
  setPageTitle("BD de Clientes");
  const columns = [
    {
      title: "Mto.",
      key: "action",
      align: "center",
      dataIndex: "id",
      width: "100px",
      render: (id, record) => (
        <Space size="middle">
          <Button
            padding="0 0.5rem"
            type="primary"
            onClick={() => {
              setId(id);
              setIsVisibleModalEdit(true);
            }}
          >
            <Icon marginRight="0px" fontSize="0.8rem" icon={faEye} />
          </Button>
          <Icon
            onClick={() => {
              setId(id);
              setStatus(record.active);
              setTextModal(record.active ? "Inactivo" : "Activo");
              setIsVisibleModalDelete(true);
            }}
            marginRight="0px"
            fontSize="1.3rem"
            icon={record.active ? faUserSlash : faUser}
            style={{ cursor: "pointer", color: "#1890FF" }}
          />
        </Space>
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
      render: (lastname) => lastname || "-",
    },
    {
      dataIndex: "email",
      title: "Correo",
      width: "190px",
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
  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);
  const [page, setPage] = useState(null);

  //para el filtro por fecha
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  //para el filtro por nro doc
  const [idNumber, setIdNumber] = useState(null);
  //para el filtro con datos de cliente
  const [clientName, setClientName] = useState(null);
  const [clientLastName, setClientLastName] = useState(null);
  //para el filtro por status del clientes
  const [active, setActive] = useState(null);

  //Datos del usuario
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState({ name: null });

  // Modales
  const [isVisibleModalEdit, setIsVisibleModalEdit] = useState(false);
  const [isVisibleModalDelete, setIsVisibleModalDelete] = useState(false);
  const [textModal, setTextModal] = useState("");
  const [id, setId] = useState("");
  const [status, setStatus] = useState("");
  const [client, setClient] = useState("");

  //extraccion de params de url
  const stateUpdateOrigin = useRef("url");
  const router = useRouter();
  const queryParams = router.query;

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
        const _clients = await getClients(queryParams);
        setClients(_clients.rows);
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };

    fetchClients();
    if (stateUpdateOrigin.current === "url") {
      urlToState();
    }
  }, [queryParams, toggleUpdateTable]);

  useEffect(() => {
    if (stateUpdateOrigin.current === "manual") stateToUrl();
  }, [page]);

  const stateToUrl = async () => {
    const params = {};
    from && (params.from = from.format(serverDateFormat));
    to && (params.to = to.format(serverDateFormat));
    page && (params.page = page);
    idNumber && (params.idNumber = idNumber);
    active && (params.active = active);
    clientName && (params.name = clientName);
    clientLastName && (params.lastname = clientLastName);
    await router.push(`/customers${urlQueryParams(params)}`);
  };

  const searchWithState = () => {
    stateToUrl();
  };

  const urlToState = () => {
    setPage(Number.parseInt(queryParams.page) || null);
    setIdNumber(queryParams.idNumber || null);
    setActive(queryParams.active || null);
    setClientName(queryParams.name || null);
    setClientLastName(queryParams.lastname || null);
  };

  const updateState = (setState, value, isPagination) => {
    stateUpdateOrigin.current = "manual";
    setState(value);
    !isPagination && setPage(undefined);
  };

  // actualiza cliente
  const updateClient = async () => {
    try {
      const response = await putClient(id, { active: !status });
      console.log(response);
      setIsVisibleModalDelete(false);
      setToggleUpdateTable((prev) => !prev);
      notification.success({
        message: "Actualización exitosa ",
      });
    } catch (error) {
      console.log(error);
      notification.error({
        message: "Error al cambiar estado del cliente",
        description: error.userMessage,
      });
    }
  };

  // obtiene cliente por id
  useEffect(() => {
    const fetchClientById = async () => {
      try {
        const _client = await getClientById(id);
        setClient(_client);
      } catch (error) {
        console.log(error);
      }
    };
    fetchClientById();
  }, [id]);

  const statusOptions = [
    {
      value: null,
      label: "Todos",
    },
    {
      value: "true",
      label: "Activo",
    },
    {
      value: "false",
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
            ¿Está seguro que desea pasar a {textModal} al cliente?
          </p>
          <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="0rem">
            <Button onClick={updateClient} margin="auto" type="primary">
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
        width="75%"
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
            <Input
              value={`${moment(client.createdAt).format(clientDateFormat)}`}
              addonBefore="Fecha Reg."
            />
            <Select label="Tipo" />
            <Select label="Estado" />
            <Input value={client.idNumber} addonBefore="DNI/RUC" />
          </Grid>
          <Grid
            marginBottom="1rem"
            gridTemplateColumns="repeat(2, 1fr)"
            gridGap="1rem"
          >
            <Input value={client.name} addonBefore="Nombre/Razón Soc." />
            <Input value={client.lastname || "-"} addonBefore="Apellidos" />
            <Input value={client.email} addonBefore="Correo" />
            <Input value={client.phoneNumber} addonBefore="Tel. Contacto" />
          </Grid>
          <Grid
            marginBottom="1rem"
            gridTemplateColumns="2fr 1fr"
            gridGap="1rem"
          >
            <Input value={client.address} addonBefore="Dirección" />
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
            value={from}
            onChange={(value) => setFrom(value)}
            format={clientDateFormat}
            disabledDate={(value) => value >= to}
            label={
              <>
                <Icon icon={faCalendarAlt} />
                Fecha Inicio
              </>
            }
          />
          <DatePicker
            value={to}
            onChange={(value) => setTo(value)}
            format={clientDateFormat}
            disabledDate={(value) => value <= from}
            label={
              <>
                <Icon icon={faCalendarAlt} />
                Fecha Fin
              </>
            }
          />
          <Select
            value={active}
            onChange={(value) => setActive(value)}
            label="Estado"
            options={statusOptions}
          />
          <Input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Nombre/Razón Soc."
            addonBefore="Cliente"
          />
          <Input
            value={clientLastName}
            onChange={(e) => setClientLastName(e.target.value)}
            placeholder="Apellidos"
          />
          <Input
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="DNI/RUC"
          />
          <Button onClick={searchWithState} type="primary" gridColumnStart="4">
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
