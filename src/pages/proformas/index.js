import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  CheckCircleFilled,
  WarningTwoTone,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Grid,
  Icon,
  Select,
} from "../../components";
import {
  getProformas,
  getUsers,
} from "../../providers";
import {
  Drawer,
  Input,
  notification,
  Table,
  Tooltip,
  Tag,
  List,
  Pagination,
} from "antd";

import moment from "moment";
import { urlQueryParams, clientDateFormat, serverDateFormat } from "../../util";
import {
  faCalendarAlt,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import {
  DesktopHistoryTable,
  HistoryContent,
  HistoryFilters,
  HistoryFiltersGrid,
  HistoryFooter,
  HistoryFooterGrid,
  HistoryPage,
  MobileFilterDrawerActions,
  MobileFilterDrawerGrid,
  MobileFilterSummary,
  MobileQuickFilters,
  MobileQuickSearch,
  MobileHistoryList,
  MobilePagination,
  ProformaCard,
  ProformaCardActions,
  ProformaCardDate,
  ProformaCardHeader,
  ProformaCardMeta,
  ProformaCardTitle,
  ProformaCardTotal,
  ProformaMetaRow,
} from "../../components/proforma/ProformasHistoryStyles";

export default ({ setPageTitle }) => {
  setPageTitle("Historial de proformas");
  const formatMoney = (value) =>
    value ? `S/ ${(value / 100).toFixed(2)}` : "-";
  const formatDate = (value) =>
    `${moment(value).format("DD/MM/YY")} ${moment(value).format("hh:mm")}`;

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
      render: (createdAt) => formatDate(createdAt),
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
      render: (total) => formatMoney(total),
    },

    {
      // dataIndex: "sale",
      dataIndex: "efectivo",
      // title: "Pagado",
      title: "Efectivo",
      width: "fit-content",
      align: "center",
      render: (efectivo) => formatMoney(efectivo),
    },

    {
      // dataIndex: "sale",
      dataIndex: "credit",
      title: "Crédito",
      width: "fit-content",
      align: "center",
      render: (credit) => formatMoney(credit),
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
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

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

  const clearFilters = () => {
    setFrom(undefined);
    setTo(undefined);
    setDocumentNumber(null);
    setIdNumber(null);
    setUserId(null);
    setStatus(null);
    setSaleStatus(null);
    setDispatchStatus(null);
    setPage(undefined);
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

  const hasExpandableDiscountRows = proformas.some((record) =>
    record?.discountProformas?.some((discount) => discount.userId !== null),
  );

  return (
    <HistoryPage>
      <HistoryFilters>
        <HistoryFiltersGrid gridTemplateColumns="repeat(4, 1fr)" gridGap="1rem">
          <Grid
            className="history-date-range"
            gridTemplateColumns="repeat(2, 1fr)"
            gridGap="1rem"
            gridColumnStart="1"
            gridColumnEnd="3"
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
            className="history-search-button"
            type="primary"
            gridColumnStart="4"
            onClick={async () => searchWithState()}
          >
            Buscar
          </Button>
        </HistoryFiltersGrid>
        <MobileQuickFilters>
          <MobileQuickSearch>
            <Input
              value={documentNumber}
              onChange={(event) => setDocumentNumber(event.target.value)}
              placeholder="Proforma"
            />
            <Input
              value={idNumber}
              onChange={(event) => setIdNumber(event.target.value)}
              placeholder="DNI/RUC"
            />
          </MobileQuickSearch>
          <MobileQuickSearch>
            <Button onClick={() => setIsFilterDrawerOpen(true)}>
              Filtros
            </Button>
            <Button type="primary" onClick={async () => searchWithState()}>
              Buscar
            </Button>
          </MobileQuickSearch>
          <MobileFilterSummary>
            <span>
              {from ? from.format(clientDateFormat) : "Sin fecha inicio"}
            </span>
            <span>{to ? to.format(clientDateFormat) : "Sin fecha fin"}</span>
            <span>
              {statusOptions.find((option) => option.value === status)?.label ||
                "Todos los estados"}
            </span>
          </MobileFilterSummary>
        </MobileQuickFilters>
        <Drawer
          className="history-filter-drawer"
          placement="bottom"
          height="82vh"
          title="Filtros"
          visible={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
        >
          <MobileFilterDrawerGrid>
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
          </MobileFilterDrawerGrid>
          <MobileFilterDrawerActions>
            <Button onClick={clearFilters}>Limpiar</Button>
            <Button
              type="primary"
              onClick={() => {
                setIsFilterDrawerOpen(false);
                searchWithState();
              }}
            >
              Aplicar
            </Button>
          </MobileFilterDrawerActions>
        </Drawer>
      </HistoryFilters>
      <HistoryContent>
        <DesktopHistoryTable>
          <Table
            columns={columns}
            scroll={{ y: windowHeight * 0.4 - 48 }}
            bordered
            rowKey={(record) => record.id}
            pagination={pagination}
            expandable={
              hasExpandableDiscountRows
                ? {
                    expandedRowRender: (record) => {
                      const discountProformasApproved =
                        record?.discountProformas?.filter(
                          (discount) => discount.userId,
                        );
                      return (
                        <List
                          itemLayout="horizontal"
                          dataSource={discountProformasApproved}
                          renderItem={(item) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={
                                  <CheckCircleFilled
                                    style={{ color: "green" }}
                                  />
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
                    rowExpandable: (record) =>
                      record?.discountProformas?.some(
                        (discount) => discount.userId !== null,
                      ),
                  }
                : undefined
            }
            dataSource={proformas}
            onChange={(pagination) =>
              updateState(setPage, pagination.current, true)
            }
          />
        </DesktopHistoryTable>
        <MobileHistoryList>
          {proformas.map((proforma) => (
            <ProformaCard key={proforma.id}>
              <ProformaCardHeader>
                <div>
                  <ProformaCardTitle>Proforma N° {proforma.id}</ProformaCardTitle>
                  <ProformaCardDate>{formatDate(proforma.createdAt)}</ProformaCardDate>
                </div>
                <ProformaCardTotal>{formatMoney(proforma.total)}</ProformaCardTotal>
              </ProformaCardHeader>
              <ProformaCardMeta>
                <ProformaMetaRow>
                  <span>Cliente</span>
                  <strong>{proforma.client?.name || "-"}</strong>
                </ProformaMetaRow>
                <ProformaMetaRow>
                  <span>Estatus</span>
                  <strong>{proforma.statusDescription || "-"}</strong>
                </ProformaMetaRow>
                <ProformaMetaRow>
                  <span>Despacho</span>
                  <strong>{proforma.dispatchStatusDescription || "-"}</strong>
                </ProformaMetaRow>
                <ProformaMetaRow>
                  <span>Vendedor</span>
                  <strong>{proforma.user?.name || "-"}</strong>
                </ProformaMetaRow>
                <ProformaMetaRow>
                  <span>Unidades</span>
                  <strong>{proforma.totalUnits || 0}</strong>
                </ProformaMetaRow>
                <ProformaMetaRow>
                  <span>Efectivo</span>
                  <strong>{formatMoney(proforma.efectivo)}</strong>
                </ProformaMetaRow>
                <ProformaMetaRow>
                  <span>Crédito</span>
                  <strong>{formatMoney(proforma.credit)}</strong>
                </ProformaMetaRow>
              </ProformaCardMeta>
              <ProformaCardActions>
                <div>
                  {proforma.status === "PENDING_DISCOUNT_APPROVAL" && (
                    <Tag color="warning">Pendiente descuento</Tag>
                  )}
                </div>
                <Button
                  onClick={async () => router.push(`/proformas/${proforma.id}`)}
                  type="primary"
                >
                  Ver
                </Button>
              </ProformaCardActions>
            </ProformaCard>
          ))}
        </MobileHistoryList>
        {pagination && (
          <MobilePagination>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              showSizeChanger={false}
              onChange={(current) => updateState(setPage, current, true)}
            />
          </MobilePagination>
        )}
      </HistoryContent>
      <HistoryFooter>
        <HistoryFooterGrid gridTemplateColumns="repeat(3, 1fr)" gridGap="1rem">
          <Button
            type="primary"
            gridColumnStart="2"
            //! Aun no queda claro que hace este boton, lo mande al root
            onClick={async () => router.push(`/`)}
          >
            Salir
          </Button>
        </HistoryFooterGrid>
      </HistoryFooter>
    </HistoryPage>
  );
};
