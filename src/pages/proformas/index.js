import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

import {
  Button,
  Container,
  DatePicker,
  Grid,
  Icon,
  Select,
} from "../../components";
import { getProformas, getUsers, userProvider } from "../../providers";
//import { get, orderBy } from "lodash";
import { Input, notification, Table } from "antd";

import moment from "moment";
import {
  urlQueryParams,
  clientDateFormat,
  serverDateFormat,
  clientHourFormat,
} from "../../util";
import { faCalendarAlt, faEye } from "@fortawesome/free-solid-svg-icons";

export default ({ setPageTitle }) => {
  setPageTitle("Historial de proformas");
  const columns = [
    {
      dataIndex: "id",
      title: "Nro",
      width: "fit-content",
      align: "center",
      render: (id, record, index) => (
        <Button
          onClick={async () => router.push(`/proformas/${id}`)}
          type="primary"
        >
          <Icon icon={faEye} />
          {index + 1}
        </Button>
      ),
    },
    {
      dataIndex: "createdAt",
      title: "Fecha",
      width: "fit-content",
      align: "center",
      render: (createdAt) =>
        moment(createdAt, serverDateFormat).format(clientDateFormat),
    },

    {
      dataIndex: "createdAt",
      title: "Hora",
      width: "fit-content",
      align: "center",
      render: (createdAt) => moment(createdAt).format(clientHourFormat),
    },
    {
      dataIndex: "id",
      title: "Proforma",
      width: "fit-content",
      align: "center",
    },
    {
      dataIndex: "statusDescription",
      title: "Estatus",
      width: "fit-content",
      align: "center",
    },
    {
      dataIndex: "dispatchStatusDescription",
      title: "Despacho",
      width: "fit-content",
      align: "center",
    },
    {
      dataIndex: "client",
      title: "Cliente",
      width: "fit-content",
      align: "center",
      render: (client) => client.name,
    },
    {
      dataIndex: "totalUnits",
      title: "Unidades",
      width: "fit-content",
      align: "center",
    },
    {
      dataIndex: "user",
      title: "Vendedor",
      width: "fit-content",
      align: "center",
      render: (user) => user.name,
    },
    {
      dataIndex: "total",
      title: "Total Final",
      width: "fit-content",
      align: "center",
      render: (total) => `S/.${(total / 100).toFixed(2)}`,
    },

    {
      dataIndex: "sale",
      title: "A Cuenta",
      width: "fit-content",
      align: "center",
      render: (sale) => sale? `S/.${(sale.credit / 100).toFixed(2)}` : "-",
    },

    {
      dataIndex: "sale",
      title: "Tot. Deuda",
      width: "fit-content",
      align: "center",
      render: (sale) => sale? `S/.${(sale.due / 100).toFixed(2)}` : "-",
    },
  ];

  //Costumizadas por JM
  const [windowHeight, setWindowHeight] = useState(0);
  const [proformas, setProformas] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);
  const [page, setPage] = useState(1);

  //para el filtro por fecha
  const [from, setFrom] = useState(moment().subtract(7, "days"));
  const [to, setTo] = useState(moment());
  //para el filtro por nro doc
  const [documentNumber, setDocumentNumber] = useState(null);
  //para el filtro con datos de cliente
  const [clientName, setClientName] = useState(null);
  const [clientLastName, setClientLastName] = useState(null);
  //para el filtro por status de proforma
  const [status, setStatus] = useState(null);
  const [saleStatus, setSaleStatus] = useState(null);
  const [dispatchStatus, setDispatchStatus] = useState(null);
  //para el filtro por vendedor
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [me, setMe] = useState({ name: null });

  //extraccion de params de url
  const stateUpdateOrigin = useRef("url");
  const router = useRouter();
  const queryParams = router.query;

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

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

  //Se buscan segun queryParams
  useEffect(() => {
    const fetchProformas = async () => {
      try {
        const _proformas = await getProformas(queryParams);
        /* console.log('proformas', _proformas); */
        setPagination({
          position: ["bottomCenter"],
          total: _proformas.count,
          current: _proformas.page,
          pageSize: _proformas.pageSize,
          showSizeChanger: false,
        });
        setProformas(_proformas.rows);
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };
    fetchProformas();
    if (stateUpdateOrigin.current === "url") {
      urlToState();
    }
  }, [queryParams, toggleUpdateTable]);

  const stateToUrl = async () => {
    const params = {};
    from && (params.from = from.format(serverDateFormat));
    to && (params.to = to.format(serverDateFormat));
    page && (params.page = page);
    documentNumber && (params.id = documentNumber);
    userId && (params.userId = userId);
    status && (params.status = status);
    saleStatus && (params.saleStatus = saleStatus);
    dispatchStatus && (params.dispatchStatus = dispatchStatus);
    clientName && (params.name = clientName);
    clientLastName && (params.lastname = clientLastName);
    await router.push(`/proformas${urlQueryParams(params)}`);
  };

  const searchWithState = () => {
    stateToUrl();
  };

  const urlToState = () => {
    //TODO: No se realiza para el rango de fechas todavia
    // const from ="";
    // try{ from = moment(queryParams.from,serverDateFormat).toDate();}catch{}
    // setFrom(from|| moment().subtract(7, "days"));
    // setTo(moment(queryParams.to,serverDateFormat).toDate() || moment());
    setPage(queryParams.page || null);
    setDocumentNumber(queryParams.id || null);
    setUserId(queryParams.userId || null);
    setStatus(queryParams.status || null);
    setSaleStatus(queryParams.saleStatus || null);
    setDispatchStatus(queryParams.dispatchStatus || null);
    setClientName(queryParams.name || null);
    setClientLastName(queryParams.lastname || null);
  };

  // estados de proforma para los select inputs
  const usersList = () => {
    const options = users.map((user) => ({
      value: user.id,
      label: user.name,
    }));

    const defaultOption = {
      value: null,
      label: "Todos",
    };

    return [defaultOption, ...options];
  };

  const statusOptions = [
    {
      value: null,
      label: "Todos",
    },
    {
      value: "OPEN",
      label: "En cotización",
    },
    {
      value: "CLOSED",
      label: "Cerrada",
    },
  ];

  const saleStatusOptions = [
    {
      value: null,
      label: "Todos",
    },
    {
      value: "PENDING",
      label: "Pendiente",
    },
    {
      value: "PARTIAL",
      label: "Parcial",
    },
    {
      value: "PAID",
      label: "Pagado",
    },
  ];

  const dispatchStatusOptions = [
    {
      value: null,
      label: "Todos",
    },
    {
      value: "PENDING",
      label: "Pendiente",
    },
    {
      value: "DISPATCHED",
      label: "Despachado",
    },
  ];

  return (
    <>
      <Container height="20%">
        <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="1rem">
          <Input value={me.name} disabled addonBefore="Usuario" />
          <Grid
            gridTemplateColumns="repeat(2, 1fr)"
            gridGap="1rem"
            gridColumnStart="2"
            gridColumnEnd="5"
          >
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
          </Grid>
          <Input
            value={documentNumber}
            onChange={(event) => setDocumentNumber(event.target.value)}
            placeholder="Nº Proforma"
            addonBefore="Proforma"
          />
          <Input
            value={clientName}
            onChange={(event) => setClientName(event.target.value)}
            addonBefore="Cliente"
          />
          <Input
            value={clientLastName}
            onChange={(event) => setClientLastName(event.target.value)}
          />
          <Select
            value={userId}
            label="Vendedor"
            onChange={(value) => setUserId(value)}
            options={usersList()}
          />
          <Select
            value={status}
            label="Estatus"
            onChange={(value) => setStatus(value)}
            options={statusOptions}
          />
          <Select
            value={saleStatus}
            label="Pago"
            onChange={(value) => setSaleStatus(value)}
            options={saleStatusOptions}
          />
          <Select
            value={dispatchStatus}
            label="Despacho"
            onChange={(value) => setDispatchStatus(value)}
            options={dispatchStatusOptions}
          />
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
          scroll={{ y: windowHeight * 0.3 - 48 }}
          bordered
          pagination={pagination}
          dataSource={proformas}
          onChange={(pagination) => setPage(pagination.current)}
        />
      </Container>
      <Container height="15%">
        <Grid gridTemplateColumns="repeat(3, 1fr)" gridGap="1rem">
          <Button
            type="primary"
            gridColumnStart="2"
            //! Aun no queda claro que hace este boton, lo mande al root
            onClick={async () => router.push(`/`)}
          >
            Salir
          </Button>
        </Grid>
      </Container>
    </>
  );
};
