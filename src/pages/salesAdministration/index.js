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
import { getSales, getUsers, userProvider } from "../../providers";
import { Input, notification, Table, Modal } from "antd";

import moment from "moment";
import { urlQueryParams, clientDateFormat, serverDateFormat } from "../../util";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

export default ({ setPageTitle }) => {
  setPageTitle("Administración Ventas");
  const columns = [
    {
      dataIndex: "paidAt",
      title: "Fecha y Hora",
      align: "center",
    },
    {
      dataIndex: "cashierId",
      title: "Canal",
      align: "center",
    },
    {
      dataIndex: "proformaId",
      title: "Proforma",
      align: "center",
    },
    {
      dataIndex: "proforma",
      title: "Cliente",
      align: "center",
    },
    {
      dataIndex: "total",
      title: "Tipo Venta",
      align: "center",
    },
    {
      dataIndex: "initialPayment",
      title: "Comprobant.",
      align: "center",
    },
    {
      dataIndex: "paymentMethod",
      title: "Total Final",
      align: "center",
    },
    {
      dataIndex: "referenceNumber",
      title: "A Cuenta",
      align: "center",
    },
    {
      dataIndex: "receivedAmount",
      title: "Tot. Deuda",
      align: "center",
    },
    {
      title: "Medio Pag.",
      align: "center",
    },
    {
      title: "Cajero",
      align: "center",
    },
    {
      title: "",
      align: "center",
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

  //Modal de proforma
  const [isVisibleModalProforma, setIsVisibleModalProforma] = useState(false);
  const [idModal, setIdModal] = useState("");

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
  /* useEffect(() => {
    const fetchSales = async () => {
      try {
        const _sales = await getSales({
          status: "PAID",
          type: "STORE",
          paidAtFrom: from.format(serverDateFormat),
          paidAtTo: to.format(serverDateFormat),
          ...queryParams,
        });
        setPagination({
          position: ["bottomCenter"],
          total: _sales.pageSize * _sales.pages,
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
    userId && (params.cashierId = userId);
    await router.push(`/salesAdministration${urlQueryParams(params)}`);
  };

  const searchWithState = () => {
    stateToUrl();
  };

  const urlToState = () => {
    setPage(Number.parseInt(queryParams.page) || null);
    setDocumentNumber(queryParams.id || null);
    setUserId(queryParams.userId || null);
  };

  const updateState = (setState, value, isPagination) => {
    stateUpdateOrigin.current = "manual";
    setState(value);
    !isPagination && setPage(undefined);
  };

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
    },
    getCheckboxProps: (record) => ({
      name: record.name,
    }),
  };
  const [selectionType, setSelectionType] = useState("checkbox");

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
          <Input placeholder="Nº Proforma" addonBefore="Proforma" />
          <Select label="Tipo Venta" />
          <Select label="Comprobante" />
          <Button type="primary" gridColumnStart="4">
            Buscar
          </Button>
        </Grid>
      </Container>
      <Container height="fit-content">
        <Table
          rowSelection={{
            type: selectionType,
            ...rowSelection,
          }}
          columns={columns}
          scroll={{ y: windowHeight * 0.4 - 48 }}
          bordered
          pagination={pagination}
          dataSource={sales}
          onChange={(pagination) =>
            updateState(setPage, pagination.current, true)
          }
        />
      </Container>
      <Container height="15%">
        <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="1rem">
          <Button type="primary" gridColumnStart="2">
            Crear Archivo SIGO
          </Button>
          <Button type="primary" gridColumnStart="3">
            Regresar
          </Button>
        </Grid>
      </Container>
    </>
  );
};
