import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  CheckCircleFilled,
  WarningTwoTone,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Container,
  DatePicker,
  Grid,
  Icon,
  Select,
} from "../../components";
import {
  getProforma,
  getProformas,
  getUsers,
  userProvider,
} from "../../providers";
import { Input, notification, Table, Tooltip, Tag, List } from "antd";

import moment from "moment";
import { urlQueryParams, clientDateFormat, serverDateFormat } from "../../util";
import {
  faCalendarAlt,
  faEye,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

export default ({ setPageTitle }) => {
  setPageTitle("Historial de proformas");
  const columns = [
    {
      dataIndex: "id",
      title: "Nro",
      width: "fit-content",
      align: "center",
      render: (id, record, index) => (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Button
            onClick={async () => router.push(`/proformas/${id}`)}
            type="primary"
          >
            <Icon icon={faEye} />
            {index + 1}
          </Button>
          {record.status === "PENDING_DISCOUNT_APPROVAL" && (
            <Tooltip title="Pendiente de aprobacion de descuento">
              <WarningTwoTone
                style={{ fontSize: "22px" }}
                twoToneColor="#ffcc00"
              />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      dataIndex: "createdAt",
      title: "Fecha de creación",
      width: "fit-content",
      align: "center",
      render: (createdAt) =>
        `${moment(createdAt).format("DD/MM/YY")} ${moment(createdAt).format(
          "hh:mm",
        )}`,
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
      render: (total) => `S/ ${(total / 100).toFixed(2)}`,
    },

    {
      // dataIndex: "sale",
      dataIndex: "efectivo",
      // title: "Pagado",
      title: "Efectivo",
      width: "fit-content",
      align: "center",
      render: (efectivo) => (efectivo ? `S/ ${(efectivo / 100).toFixed(2)}` : "-"),
    },

    {
      // dataIndex: "sale",
      dataIndex: "credit",
      title: "Crédito",
      width: "fit-content",
      align: "center",
      render: (credit) => (credit ? `S/ ${(credit / 100).toFixed(2)}` : "-"),
    },
  ];

  //Costumizadas por JM
  const [windowHeight, setWindowHeight] = useState(0);
  const [proformas, setProformas] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);
  const [page, setPage] = useState(null);

  //para el filtro por fecha
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  //para el filtro por nro doc
  const [documentNumber, setDocumentNumber] = useState(null);
  //para el filtro por DNI/RUC
  const [idNumber, setIdNumber] = useState(null);
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

  //Se buscan segun queryParams
  useEffect(() => {
    const fetchProformas = async () => {
      try {
        const updatedQueryParams = { ...queryParams };
        if (updatedQueryParams.status === "EXPIRED") {
          delete updatedQueryParams?.status;
        }
        let _proformas = await getProformas(updatedQueryParams);
        // due in the backend we don't have a status type of EXPIRED ("CADUCADA"). We're getting that value from the get() in the column status
        // so if we have "Pendiente de aprobacion". Internally will look for "Pendiente de aprobacion" in the database. Then, due the get(), if it's within the
        // expire days. We get EXPIRED ("Caducada")
        const proformasRows = _proformas.rows.filter(
          (proforma) =>
            (queryParams.status === "EXPIRED" &&
              proforma.status === "EXPIRED") ||
            (queryParams.status !== "EXPIRED" &&
              proforma.status !== "EXPIRED") ||
            typeof queryParams.status === "undefined",
        );

        setPagination({
          position: ["bottomCenter"],
          total: _proformas.pageSize * _proformas.pages,
          /* total: 800, */
          current: _proformas.page,
          pageSize: _proformas.pageSize,
          showSizeChanger: false,
          showQuickJumper: true,
        });

        // let proformasRequest = [];
        // for (const proforma of proformas) {
        //   proformasRequest.push(getProforma(proforma.id));
        // }

        // const response = await Promise.allSettled(proformasRequest);

        // for (const promiseResponse of response) {
        // }

        setProformas(proformasRows);
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

  useEffect(() => {
    if (stateUpdateOrigin.current === "manual") stateToUrl();
  }, [page]);

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
    idNumber && (params.idNumber = idNumber);
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
    setPage(Number.parseInt(queryParams.page) || null);
    setDocumentNumber(queryParams.id || null);
    setUserId(queryParams.userId || null);
    setStatus(queryParams.status || null);
    setSaleStatus(queryParams.saleStatus || null);
    setDispatchStatus(queryParams.dispatchStatus || null);
    setIdNumber(queryParams.idNumber || null);
  };

  const updateState = (setState, value, isPagination) => {
    stateUpdateOrigin.current = "manual";
    setState(value);
    !isPagination && setPage(undefined);
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
      value: "EXPIRED",
      label: "Caducada",
    },
    {
      value: "PENDING_DISCOUNT_APPROVAL",
      label: "Pendiente de aprobacion",
    },
    {
      value: "CLOSED",
      label: "Vendida",
      // label: "Cerrada",
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
      value: "COMPLETED",
      label: "Despachado",
    },
    {
      value: "OPEN",
      label: "Habilitado",
    },
    {
      value: "LOCKED",
      label: "Pendiente",
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
            value={idNumber}
            onChange={(event) => setIdNumber(event.target.value)}
            addonBefore="DNI/RUC"
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
          scroll={{ y: windowHeight * 0.4 - 48 }}
          bordered
          rowKey={(record) => record.id}
          pagination={pagination}
          expandable={{
            expandedRowRender: (record) => {
              const discountProformasApproved =
                record?.discountProformas?.filter(
                  (discount) => discount.userId,
                );
              // return <p>hola</p>
              return (
                <List
                  itemLayout="horizontal"
                  dataSource={discountProformasApproved}
                  renderItem={(item, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <CheckCircleFilled style={{ color: "green" }} />
                        }
                        title={`Descuento aprobado por  ${
                          item?.user?.name || "No name found"
                        } (User ID: ${item.userId})`}
                        description={`Monto S/ ${(
                          Number(item.approvedDiscount) / 100
                        ).toFixed(2)} Fecha: ${new Date(
                          item.updatedAt,
                        ).toLocaleDateString("es-PE", {
                          timeZone: "America/Lima",
                        })}`}
                      />
                    </List.Item>
                  )}
                />
              );
            },
            rowExpandable: (record) => {
              return (
                record?.discountProformas?.filter((d) => d.userId !== null)
                  .length > 0
              );
              // if (record?.discountProformas?.length === 0) {
              //   return false;
              // }
              // return true;

              // if (record.discountProformas) {
              // }

              // return false;
            },
          }}
          dataSource={proformas}
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
