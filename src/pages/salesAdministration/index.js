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
      dataIndex: "createdAt",
      title: "Fecha y Hora",
      align: "center",
      render: (createdAt) =>
        `${moment(createdAt).format("DD/MM")} ${moment(createdAt).format(
          "hh:mm"
        )}`,
    },
    {
      dataIndex: "typeDescription",
      title: "Canal",
      align: "center",
      render: (typeDescription) => typeDescription,
    },
    {
      dataIndex: "proformaId",
      title: "Proforma",
      align: "center",
      render: (proformaId) => `N°${proformaId}`,
    },
    {
      dataIndex: "proforma",
      title: "Cliente",
      align: "center",
      render: (proforma) => proforma.client.name,
    },
    {
      dataIndex: "paymentTypeDescription",
      title: "Tipo Venta",
      align: "center",
      render: (paymentTypeDescription) => paymentTypeDescription,
    },
    {
      dataIndex: "billingTypeDescription",
      title: "Comprobant.",
      align: "center",
      render: (billingTypeDescription) => billingTypeDescription,
    },
    {
      dataIndex: "total",
      title: "Total Final",
      align: "center",
      render: (total) => `S/ ${(total / 100).toFixed(2)}`,
    },
    {
      dataIndex: "initialPayment",
      title: "A Cuenta",
      align: "center",
      render: (initialPayment) => `S/ ${(initialPayment / 100).toFixed(2)}`,
    },
    {
      dataIndex: "credit",
      title: "Crédito",
      align: "center",
      render: (credit) => `S/ ${(credit / 100).toFixed(2)}`,
    },
    {
      dataIndex: "paymentMethod",
      title: "Medio Pag.",
      align: "center",
      render: (paymentMethod) => (paymentMethod ? paymentMethod : "-"),
    },
    {
      dataIndex: "cashierId",
      title: "Cajero",
      align: "center",
      render: (cashierId) => {
        const _users = users.filter((user) => user.id === cashierId)[0];
        return _users ? _users.name : "-";
      },
    },
    {
      dataIndex: "id",
      title: "",
      align: "center",
      render: (id, data) => (
        <Button
          onClick={async () =>
            router.push(`/cashHistory?proformaId=${data.proformaId}`)
          }
          type={"primary"}
        >
          {data.typeDescription === "En tienda" ? "Hist. Caja" : "Voucher"}
        </Button>
      ),
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

  //para el filtro por tipo de comprobante
  const [billingType, setBillingType] = useState(null);

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

  //Trae todas las ventas segun queryParams
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const _sales = await getSales({
          status: "PAID",
          ...queryParams,
        });
        setPagination({
          position: ["bottomCenter"],
          total: _sales.pageSize * _sales.pages,
          current: _sales.page,
          pageSize: _sales.pageSize,
          showSizeChanger: false,
        });
        console.log(_sales.rows);
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

  useEffect(() => {
    if (stateUpdateOrigin.current === "manual") stateToUrl();
  }, [page]);

  const stateToUrl = async () => {
    const params = {};
    from && (params.paidAtFrom = from.format(serverDateFormat));
    to && (params.paidAtTo = to.format(serverDateFormat));
    page && (params.page = page);
    documentNumber && (params.proformaId = documentNumber);
    billingType && (params.billingType = billingType);
    await router.push(`/salesAdministration${urlQueryParams(params)}`);
  };

  const searchWithState = () => {
    stateToUrl();
  };

  const urlToState = () => {
    setPage(Number.parseInt(queryParams.page) || null);
    setDocumentNumber(queryParams.proformaId || null);
    setBillingType(queryParams.billingType || null);
  };

  const updateState = (setState, value, isPagination) => {
    stateUpdateOrigin.current = "manual";
    setState(value);
    !isPagination && setPage(undefined);
  };

  const billingTypeOptions = [
    {
      value: null,
      label: "Todos",
    },
    {
      value: "CONSIGNMENT",
      label: "Consignación",
    },
    {
      value: "SALE",
      label: "Venta",
    },
  ];

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
          <Input
            value={documentNumber}
            onChange={(event) => setDocumentNumber(event.target.value)}
            placeholder="Nº Proforma"
            addonBefore="Proforma"
          />
          <Select label="Tipo Venta" />
          <Select
            value={billingType}
            onChange={(value) => setBillingType(value)}
            label="Comprobante"
            options={billingTypeOptions}
          />
          <Button onClick={searchWithState} type="primary" gridColumnStart="4">
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
        <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="8rem">
          <Button type="primary" gridColumnStart="2">
            Crear Archivo SIGO
          </Button>
          <Button
            type="primary"
            gridColumnStart="3"
            onClick={async () => router.back()}
          >
            Regresar
          </Button>
        </Grid>
      </Container>
    </>
  );
};
