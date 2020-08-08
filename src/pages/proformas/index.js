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
import { getProformas } from "../../providers";
import { get, orderBy } from "lodash";
import { Input, Table } from "antd";

import moment from "moment";
import {
  urlQueryParams,
  clientDateFormat,
  serverDateFormat,
  clientHourFormat,
} from "../../util";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

export default ({ setPageTitle }) => {
  setPageTitle("Historial");

  const columns = [
    {
      dataIndex: "id",
      title: "Nro",
      width: "fit-content",
      align: "center",
      render: (text, record, index) => index + 1,
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
      dataIndex: "subtotal",
      title: "Total Final",
      width: "fit-content",
      align: "center",
    },

    {
      dataIndex: "discount",
      title: "A Cuenta",
      width: "fit-content",
      align: "center",
    },

    {
      dataIndex: "total",
      title: "Tot. Deuda",
      width: "fit-content",
      align: "center",
    },
  ];

  //!Exportadas

  //Costumizadas por JM
  const [windowHeight, setWindowHeight] = useState(0);
  const [proformas, setProformas] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);
  const [page, setPage] = useState(null);

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

  //extraccion de params de url
  const stateUpdateOrigin = useRef("url");
  const router = useRouter();
  const queryParams = router.query;

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    const fetchProformas = async () => {
      try {
        const _proformas = await getProformas(queryParams);
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
  }, [queryParams, toggleUpdateTable]); //Se ejecuta si los queryParams cambian

  /*useEffect(() => {
    if (stateUpdateOrigin.current === "manual") stateToUrl();
  }, [documentNumber, to, from]);
*/
  const stateToUrl = async () => {
    const params = {};
    documentNumber && (params.id = documentNumber);
    status && (params.status = status);
    saleStatus && (params.saleStatus = saleStatus);
    dispatchStatus && (params.dispatchStatus = dispatchStatus);
    clientName && (params.name = clientName);
    clientLastName && (params.lastname = clientLastName);

    //to && (params.to = to);
    //from && (params.from = from);
    await router.push(`/proformas${urlQueryParams(params)}`);
  };

  const searchWithState = (isPagination) => {
    stateToUrl();
    !isPagination && setPage(undefined);
  };

  const urlToState = () => {
    //TODO: Falta completar
    setDocumentNumber(queryParams.id || null);
    setStatus(queryParams.status || null);
    setSaleStatus(queryParams.saleStatus || null);
    setDispatchStatus(queryParams.dispatchStatus || null);
    setClientName(queryParams.name || null);
    setClientLastName(queryParams.lastname || null);
  };

  // estados de proforma para los select inputs
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
          <Input //value={code}
            //TODO: campo de usuario sin metodo onChange solo de presentación
            disabled
            //onChange={event => setCode(event.target.value)}
            addonBefore="Usuario"
          />

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
            //TODO: campo de vendedor, options debe venir de un listado, falta salesMan y setSalesMan)
            //value={region}
            label="Vendedor"
            //onChange={(value) => setRegion(value)}
            options={[]}
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
            style={{ "grid-column-start": "4" }}
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
          //TODO: La pagination se mostrara cuando existan elementos
          dataSource={proformas}
          //dataSource={orderBy(suppliedProducts, "id", "asc")}
        />
      </Container>

      <Container height="15%">
        <Grid gridTemplateColumns="repeat(3, 1fr)" gridGap="1rem">
          <Button
            type="primary"
            style={{ "grid-column-start": "2" }}
            //TODO: Falta setear la funcion onClick
            //onClick={async () => router.push(`/supplies/new`)}
          >
            Salir
          </Button>
        </Grid>
      </Container>
    </>
  );
};
