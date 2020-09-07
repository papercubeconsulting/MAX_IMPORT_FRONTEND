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
import {
  urlQueryParams,
  clientDateFormat,
  serverDateFormat,
  clientHourFormat,
} from "../../util";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

export default ({ setPageTitle }) => {
  const router = useRouter();
  setPageTitle("Historial de Caja");
  const columns = [
    {
      dataIndex: "createdAt",
      title: "Fecha",
      width: "fit-content",
      align: "center",
    },

    {
      dataIndex: "createdAt",
      title: "Hora",
      width: "fit-content",
      align: "center",
    },
    {
      dataIndex: "id",
      title: "Cajero",
      width: "fit-content",
      align: "center",
    },
    {
      dataIndex: "id",
      title: "Proforma",
      width: "fit-content",
      align: "center",
    },
    {
      dataIndex: "client",
      title: "Cliente",
      width: "fit-content",
      align: "center",
    },
    {
      dataIndex: "totalUnits",
      title: "Tot. Final",
      width: "fit-content",
      align: "center",
    },
    {
      dataIndex: "user",
      title: "Cobro",
      width: "fit-content",
      align: "center",
    },
    {
      dataIndex: "total",
      title: "Medio de Pago",
      width: "fit-content",
      align: "center",
    },

    {
      dataIndex: "sale",
      title: "Recibido",
      width: "fit-content",
      align: "center",
    },

    {
      dataIndex: "sale",
      title: "Vuelto",
      width: "fit-content",
      align: "center",
    },
  ];

  const [windowHeight, setWindowHeight] = useState(0);
  const [pagination, setPagination] = useState(null);
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
