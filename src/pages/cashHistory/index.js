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
import { getSales, getUsers, userProvider } from "../../providers";
import { orderBy } from "lodash";
import { Input, notification, Table } from "antd";

import moment from "moment";
import {
  urlQueryParams,
  clientDateFormat,
  serverDateFormat,
  clientHourFormat,
} from "../../util";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

export default ({ setPageTitle }) => {
  setPageTitle("Historial de Caja");
  const columns = [
    {
      dataIndex: "paidAt",
      title: "Fecha",
      width: "fit-content",
      align: "center",
      render: (paidAt) =>
        moment(paidAt, serverDateFormat).format(clientDateFormat),
    },

    {
      dataIndex: "paidAt",
      title: "Hora",
      width: "fit-content",
      align: "center",
      render: (paidAt) => moment(paidAt).format(clientHourFormat),
    },
    {
      dataIndex: "cashierId",
      title: "Cajero",
      width: "fit-content",
      align: "center",
    },
    {
      dataIndex: "proformaId",
      title: "Proforma",
      width: "fit-content",
      align: "center",
      render: (proformaId) => `N° ${proformaId}`,
    },
    {
      dataIndex: "proforma",
      title: "Cliente",
      width: "fit-content",
      align: "center",
      render: (proforma) => proforma.client.name,
    },
    {
      dataIndex: "total",
      title: "Tot. Final",
      width: "fit-content",
      align: "center",
      render: (total) => `S/.${(total / 100).toFixed(2)}`,
    },
    {
      dataIndex: "initialPayment",
      title: "Cobro",
      width: "fit-content",
      align: "center",
      render: (initialPayment) => `S/.${(initialPayment / 100).toFixed(2)}`,
    },
    {
      dataIndex: "paymentMethod",
      title: "Medio de Pago",
      width: "fit-content",
      align: "center",
    },

    {
      dataIndex: "receivedAmount",
      title: "Recibido",
      width: "fit-content",
      align: "center",
      render: (receivedAmount) => `S/.${(receivedAmount / 100).toFixed(2)}`,
    },

    {
      title: "Vuelto",
      width: "fit-content",
      align: "center",
      render: (id, dataSale) =>
        `S/.${(
          (dataSale.receivedAmount - dataSale.initialPayment) /
          100
        ).toFixed(2)}`,
    },
  ];

  const [windowHeight, setWindowHeight] = useState(0);
  const [sales, setsales] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);
  const [page, setPage] = useState(1);

  //para el filtro por fecha
  const [from, setFrom] = useState(moment().subtract(7, "days"));
  const [to, setTo] = useState(moment());

  //para el filtro por nro doc
  const [documentNumber, setDocumentNumber] = useState(null);

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

  // lista de cajeros
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

  //Trae todas las ventas segun queryParams
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const _sales = await getSales({
          status: "PAID",
          type: "STORE",
          ...queryParams,
        });
        /* console.log("query", queryParams); */
        setPagination({
          position: ["bottomCenter"],
          total: _sales.count,
          current: _sales.page,
          pageSize: _sales.pageSize,
          showSizeChanger: false,
        });
        setsales(_sales.rows);
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };
    fetchSales();
    if (stateUpdateOrigin.current === "url") {
      urlToState();
    }
  }, [queryParams, toggleUpdateTable]);

  const stateToUrl = async () => {
    const params = {};
    from && (params.paidAtFrom = from.format(serverDateFormat));
    to && (params.paidAtTo = to.format(serverDateFormat));
    page && (params.page = page);
    documentNumber && (params.proformaId = documentNumber);
    userId && (params.cashierId = userId);
    await router.push(`/cashHistory${urlQueryParams(params)}`);
  };

  const searchWithState = () => {
    stateToUrl();
  };

  const urlToState = () => {
    setPage(queryParams.page || null);
    setDocumentNumber(queryParams.id || null);
    setUserId(queryParams.userId || null);
  };

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
          <Select
            value={userId}
            label="Cajero"
            onChange={(value) => setUserId(value)}
            options={usersList()}
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
          dataSource={orderBy(sales, "id", "asc")}
          onChange={(pagination) => setPage(pagination.current)}
        />
      </Container>
      <Container height="15%">
        <Grid gridTemplateColumns="repeat(3, 1fr)" gridGap="1rem">
          <Button
            type="primary"
            gridColumnStart="2"
            onClick={async () => router.push(`/sales`)}
          >
            Regresar
          </Button>
        </Grid>
      </Container>
    </>
  );
};
