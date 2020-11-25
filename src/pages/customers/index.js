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
  putClient,
  getRegions,
  getProvinces,
  getDistricts,
  getDeliveryAgencies,
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
              setName(record.name);
              setLastname(record.lastname || "-");
              setEmail(record.email);
              setPhoneNumber(record.phoneNumber);
              setAddress(record.address);
              setCreatedAt(record.createdAt);
              setType(record.type);
              setIdNumber(record.idNumber);
              setActive(record.active);
              setDefaultDeliveryAgencyId(record.defaultDeliveryAgencyId);
              setRegionId(record.regionId);
              setProvinceId(record.provinceId);
              setDistrictId(record.districtId);
              setIsVisibleModalEdit(true);
            }}
          >
            <Icon marginRight="0px" fontSize="0.8rem" icon={faEye} />
          </Button>
          <Icon
            onClick={() => {
              setId(id);
              setActive(record.active);
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
  const [documentNumber, setDocumentNumber] = useState(null);
  //para el filtro con datos de cliente
  const [clientName, setClientName] = useState(null);
  const [clientLastName, setClientLastName] = useState(null);
  //para el filtro por status del clientes
  const [status, setStatus] = useState(null);

  //Datos del usuario
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState({ name: null });

  // Modales
  const [isVisibleModalEdit, setIsVisibleModalEdit] = useState(false);
  const [isVisibleModalDelete, setIsVisibleModalDelete] = useState(false);
  const [textModal, setTextModal] = useState("");
  const [id, setId] = useState("");
  const [active, setActive] = useState("");

  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [deliveryAgencies, setDeliveryAgencies] = useState([]);

  const [name, setName] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [email, setEmail] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [address, setAddress] = useState(null);
  const [createdAt, setCreatedAt] = useState(null);
  const [type, setType] = useState(null);
  const [idNumber, setIdNumber] = useState(null);
  const [defaultDeliveryAgencyId, setDefaultDeliveryAgencyId] = useState(null);
  const [regionId, setRegionId] = useState(null);
  const [provinceId, setProvinceId] = useState(null);
  const [districtId, setDistrictId] = useState(null);

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
    documentNumber && (params.idNumber = documentNumber);
    status && (params.active = status);
    clientName && (params.name = clientName);
    clientLastName && (params.lastname = clientLastName);
    await router.push(`/customers${urlQueryParams(params)}`);
  };

  const searchWithState = () => {
    stateToUrl();
  };

  const urlToState = () => {
    setPage(Number.parseInt(queryParams.page) || null);
    setDocumentNumber(queryParams.idNumber || null);
    setStatus(queryParams.active || null);
    setClientName(queryParams.name || null);
    setClientLastName(queryParams.lastname || null);
  };

  const updateState = (setState, value, isPagination) => {
    stateUpdateOrigin.current = "manual";
    setState(value);
    !isPagination && setPage(undefined);
  };

  // actualiza cliente
  const updateClient = async (body) => {
    try {
      const response = await putClient(id, body);
      console.log(response);
      setIsVisibleModalDelete(false);
      setIsVisibleModalEdit(false);
      setToggleUpdateTable((prev) => !prev);
      notification.success({
        message: "Cliente actualizado exitosamente ",
      });
    } catch (error) {
      console.log(error);
      notification.error({
        message: "Error al actualizar datos del cliente",
        description: error.userMessage,
      });
    }
  };

  useEffect(() => {
    const fetchRegions = async () => {
      const _regions = await getRegions();
      setRegions(_regions);
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      const _provinces = await getProvinces(regionId);
      setProvinces(_provinces);
    };
    regionId && fetchProvinces();
  }, [regionId]);

  useEffect(() => {
    const fetchDistricts = async () => {
      const _districts = await getDistricts(regionId, provinceId);
      setDistricts(_districts);
    };
    regionId && provinceId && fetchDistricts();
  }, [regionId, provinceId]);

  useEffect(() => {
    const fetchDeliveryAgencies = async () => {
      const _deliveryAgencies = await getDeliveryAgencies();
      setDeliveryAgencies(_deliveryAgencies);
    };
    fetchDeliveryAgencies();
  }, []);

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
  const statusModalOptions = [
    {
      value: true,
      label: "Activo",
    },
    {
      value: false,
      label: "Inactivo",
    },
  ];

  const typesOptions = [
    {
      value: "PERSON",
      label: "Persona",
    },
    {
      value: "COMPANY",
      label: "Empresa",
    },
  ];

  console.log(idNumber, "idNumber");

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
            <Button
              onClick={() => {
                updateClient({ active: !active });
              }}
              margin="auto"
              type="primary"
            >
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
              value={`${moment(createdAt).format(clientDateFormat)}`}
              addonBefore="Fecha Reg."
              disabled
            />
            <Select
              value={type}
              onChange={(value) => setType(value)}
              label="Tipo"
              options={typesOptions}
            />
            <Select
              value={active}
              onChange={(value) => setActive(value)}
              label="Estado"
              options={statusModalOptions}
            />
            <Input
              onChange={(e) => setIdNumber(e.target.value)}
              maxLength={type === "PERSON" ? 8 : 11}
              value={idNumber}
              addonBefore="DNI/RUC"
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
              addonBefore="Nombre/Razón Soc."
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
            gridTemplateColumns="2fr 1fr"
            gridGap="1rem"
          >
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              addonBefore="Dirección"
            />
            <Select
              value={defaultDeliveryAgencyId}
              label="Agencia Su."
              onChange={(value) => setDefaultDeliveryAgencyId(value)}
              options={deliveryAgencies.map((agency) => ({
                value: agency.id,
                label: agency.name,
              }))}
            />
          </Grid>
          <Grid
            marginBottom="1rem"
            gridTemplateColumns="repeat(3, 1fr)"
            gridGap="1rem"
          >
            <Select
              value={regionId}
              label="Departamento"
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={(value) => setRegionId(value)}
              options={regions.map((region) => ({
                value: region.id,
                label: region.name,
              }))}
            />
            <Select
              value={provinceId}
              label="Provincia"
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={(value) => setProvinceId(value)}
              options={provinces.map((province) => ({
                value: province.id,
                label: province.name,
              }))}
            />
            <Select
              value={districtId}
              label="Distrito"
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={(value) => setDistrictId(value)}
              options={districts.map((district) => ({
                value: district.id,
                label: district.name,
              }))}
            />
          </Grid>
        </Container>
        <Container>
          <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="8rem">
            <Button
              onClick={() => {
                let body = {
                  name,
                  lastname,
                  email,
                  phoneNumber,
                  address,
                  type,
                  active,
                  idNumber,
                  regionId,
                  provinceId,
                  districtId,
                };
                if (defaultDeliveryAgencyId) {
                  body = { ...body, defaultDeliveryAgencyId };
                }
                updateClient(body);
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
            value={status}
            onChange={(value) => setStatus(value)}
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
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
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
