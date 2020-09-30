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
import { getUsers, userProvider } from "../../providers";
import { Input, notification, Table } from "antd";

import moment from "moment";
import { urlQueryParams, clientDateFormat, serverDateFormat } from "../../util";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

export default ({ setPageTitle }) => {
  setPageTitle("Historial de Despachos");
  const columns = [
    {
      dataIndex: "index",
      title: "Nro",
      width: "fit-content",
      align: "center",
    },
    {
      dataIndex: "paidAt",
      title: "Fecha",
      width: "fit-content",
      align: "center",
      /* render: (paidAt) =>
          `${moment(paidAt).format("DD/MM/YY")} ${moment(paidAt).format(
            "hh:mm"
          )}`, */
    },
    {
      dataIndex: "paidAt",
      title: "Hora",
      width: "fit-content",
      align: "center",
      /* render: (paidAt) =>
            `${moment(paidAt).format("DD/MM/YY")} ${moment(paidAt).format(
              "hh:mm"
            )}`, */
    },
    {
      dataIndex: "proformaId",
      title: "Proforma",
      width: "fit-content",
      align: "center",
      /* render: (proformaId) => (
            <a>
              N°{proformaId}
            </a>
          ), */
    },
    {
      dataIndex: "proforma",
      title: "Cliente",
      width: "fit-content",
      align: "center",
    },
    {
      dataIndex: "proforma",
      title: "Despachador",
      width: "fit-content",
      align: "center",
    },
    {
      dataIndex: "total",
      title: "Tip. Desp.",
      width: "fit-content",
      align: "center",
    },
    {
      dataIndex: "initialPayment",
      title: "Agencia",
      width: "fit-content",
      align: "center",
    },
    {
      dataIndex: "paymentMethod",
      title: "Unidades",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Estatus",
      width: "fit-content",
      align: "center",
      /*  render: (id, dataSale) => <Button type={"primary"}>Atender</Button>, */
    },
    {
      dataIndex: "paymentMethod",
      title: "Fecha de atención",
      width: "fit-content",
      align: "center",
    },
  ];

  const [windowHeight, setWindowHeight] = useState(0);
  const [dispatches, setDispatches] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState({ name: null });

  //para el filtro por fecha
  const [from, setFrom] = useState(moment().subtract(7, "days"));
  const [to, setTo] = useState(moment());

  //para el filtro por nro doc
  const [documentNumber, setDocumentNumber] = useState(null);

  //extraccion de params de url
  const stateUpdateOrigin = useRef("url");
  const router = useRouter();
  const queryParams = router.query;

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  //Obtiene a los usuarios
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

  //Trae todas los despachos segun queryParams
  /* useEffect(() => {
    const fetchDispatches = async () => {
      try {
        const _dispatches = await getDispatches({});
        setPagination({
          position: ["bottomCenter"],
          total: _dispatches.pageSize * _dispatches.pages,
          current: _dispatches.page,
          pageSize: _dispatches.pageSize,
          showSizeChanger: false,
        });
        setDispatches(_dispatches.rows);
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };
    fetchDispatches();
    if (stateUpdateOrigin.current === "url") {
      urlToState();
    }
  }, [queryParams, toggleUpdateTable]); */

  useEffect(() => {
    if (stateUpdateOrigin.current === "manual") stateToUrl();
  }, [page]);

  const stateToUrl = async () => {
    const params = {};
    from && (params.paidAtFrom = from.format(serverDateFormat));
    to && (params.paidAtTo = to.format(serverDateFormat));
    page && (params.page = page);
    documentNumber && (params.proformaId = documentNumber);
    await router.push(`/cashHistory${urlQueryParams(params)}`);
  };

  const searchWithState = () => {
    stateToUrl();
  };

  const urlToState = () => {
    setPage(Number.parseInt(queryParams.page) || null);
    setDocumentNumber(queryParams.id || null);
  };

  const updateState = (setState, value, isPagination) => {
    stateUpdateOrigin.current = "manual";
    setState(value);
    !isPagination && setPage(undefined);
  };

  return (
    <>
      <Container height="fit-content">
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
          <Select label="Despachador" />
          <Select label="Estado" />
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
          pagination={pagination}
          dataSource={dispatches}
          onChange={(pagination) =>
            updateState(setPage, pagination.current, true)
          }
        />
      </Container>
      <Container height="15%">
        <Grid gridTemplateColumns="repeat(3, 1fr)" gridGap="1rem">
          <Button
            type="primary"
            gridColumnStart="2"
            onClick={async () => router.push(`/dispatch`)}
          >
            Regresar
          </Button>
        </Grid>
      </Container>
    </>
  );
};
