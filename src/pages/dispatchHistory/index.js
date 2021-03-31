import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  Button,
  Container,
  DatePicker,
  Grid,
  Icon,
  Select,
  ModalProforma,
} from "../../components";
import { getUsers, userProvider, getDispatches } from "../../providers";
import { Input, notification, Table, Modal } from "antd";

import moment from "moment";
import { urlQueryParams, clientDateFormat, serverDateFormat } from "../../util";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

// fix window
import window from 'global';

export default ({ setPageTitle }) => {
  setPageTitle("Historial de Despachos");
  const columns = [
    {
      dataIndex: "index",
      title: "Nro",
      width: "60px",
      align: "center",
      render: (id, data, index) => index + 1,
    },
    {
      dataIndex: "createdAt",
      title: "Fecha y hora",
      align: "center",
      render: (createdAt) =>
        `${moment(createdAt).format("DD/MM")} ${moment(createdAt).format(
          "hh:mm"
        )}`,
    },
    {
      dataIndex: "proformaId",
      title: "Proforma",
      align: "center",
      render: (proformaId) => (
        <a
          onClick={() => {
            setIsVisibleModalProforma(true);
            setIdModal(proformaId);
          }}
        >
          N°{proformaId}
        </a>
      ),
    },
    {
      dataIndex: "proforma",
      title: "Cliente",
      align: "center",
      render: (proforma) => proforma.client.name,
    },
    {
      dataIndex: "dispatcherId",
      title: "Despachador",
      align: "center",
      render: (dispatcherId) => {
        const _users = users.filter((user) => user.id === dispatcherId)[0];
        return _users ? _users.name : "-";
      },
    },
    {
      dataIndex: "sale",
      title: "Tip. Desp.",
      align: "center",
      render: (sale) =>
        sale.dispatchmentType === "DELIVERY" ? "Envío" : "En Tienda",
    },
    {
      dataIndex: "id",
      title: "Agencia",
      align: "center",
      render: (id, data) =>
        data.dispatchmentType === "DELIVERY" ? data.deliveryAgency.name : "-",
    },
    {
      dataIndex: "proforma",
      title: "Unidades",
      align: "center",
      render: (proforma) => proforma.totalUnits,
    },
    {
      dataIndex: "id",
      title: "",
      align: "center",
      render: (id, data) => (
        <Button
          onClick={async () => router.push(`/dispatch/${id}`)}
          type={"primary"}
        >
          Atendido
        </Button>
      ),
    },
    {
      dataIndex: "completedAt",
      title: "Fecha de atención",
      align: "center",
      render: (completedAt) =>
        completedAt
          ? `${moment(completedAt).format("DD/MM")}- ${moment(
              completedAt
            ).format("hh:mm")}`
          : "-",
    },
  ];

  const [windowHeight, setWindowHeight] = useState(0);
  const [dispatches, setDispatches] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState({ name: null });

  //Modal de proforma
  const [isVisibleModalProforma, setIsVisibleModalProforma] = useState(false);
  const [idModal, setIdModal] = useState("");

  //para el filtro por fecha
  const [from, setFrom] = useState(moment().subtract(7, "days"));
  const [to, setTo] = useState(moment());

  //para el filtro por nro doc
  const [documentNumber, setDocumentNumber] = useState(null);

  //para el filtro por cajero
  const [userId, setUserId] = useState(null);

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
        setUsers(_users.rows);
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

  // lista de despachadores
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

  //Trae todas los despachos segun queryParams
  useEffect(() => {
    const fetchDispatches = async () => {
      try {
        const _dispatches = await getDispatches({
          status: "COMPLETED",
          ...queryParams,
        });
        console.log("despachos", _dispatches);
        setPagination({
          position: ["bottomCenter"],
          total: _dispatches.pageSize * _dispatches.pages,
          current: _dispatches.page,
          pageSize: _dispatches.pageSize,
          showSizeChanger: false,
          showQuickJumper: true,
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
  }, [queryParams, toggleUpdateTable]);

  useEffect(() => {
    if (stateUpdateOrigin.current === "manual") stateToUrl();
  }, [page]);

  const stateToUrl = async () => {
    const params = {};
    from && (params.from = from.format(serverDateFormat));
    to && (params.to = to.format(serverDateFormat));
    page && (params.page = page);
    documentNumber && (params.proformaId = documentNumber);
    userId && (params.dispatcherId = userId);
    await router.push(`/dispatchHistory${urlQueryParams(params)}`);
  };

  const searchWithState = () => {
    stateToUrl();
  };

  const urlToState = () => {
    setPage(Number.parseInt(queryParams.page) || null);
    setDocumentNumber(queryParams.proformaId || null);
    setUserId(queryParams.dispatcherId || null);
  };

  const updateState = (setState, value, isPagination) => {
    stateUpdateOrigin.current = "manual";
    setState(value);
    !isPagination && setPage(undefined);
  };

  return (
    <>
      <Modal
        visible={isVisibleModalProforma}
        width="90%"
        title="Información de la proforma"
        onCancel={() => setIsVisibleModalProforma(false)}
        footer={null}
      >
        <ModalProforma id={idModal}></ModalProforma>
      </Modal>
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
          <Select
            value={userId}
            label="Despachador"
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
