import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Container,
  DatePicker,
  Grid,
  Icon,
  Select,
} from "../../components";
import { RadioGroup } from "../../components/RadioGroup";
import { getSales, getUsers, userProvider } from "../../providers";
import { orderBy } from "lodash";
import { Input, notification, Table, Checkbox, Modal, Radio } from "antd";

import moment from "moment";
import { clientDateFormat } from "../../util";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

export default ({ setPageTitle }) => {
  setPageTitle("Pagos en caja");
  const columns = [
    {
      dataIndex: "index",
      title: "Turno",
      width: "70px",
      align: "center",
      render: (id, dataSale, index) => (
        <Button
          onClick={() => {
            setIdCondition(dataSale.id);
            setName(dataSale.proforma.client.name);
            setLastName(dataSale.proforma.client.lastname);
          }}
          type={idCondition === dataSale.id ? "primary" : ""}
        >
          {index + 1}
        </Button>
      ),
    },
    {
      dataIndex: "proformaId",
      title: "Proforma",
      align: "center",
      render: (proformaId) => `N° ${proformaId}`,
    },

    {
      dataIndex: "proforma",
      title: "Cliente",
      align: "center",
      render: (proforma) => proforma.client.name,
    },
    {
      dataIndex: "proforma",
      title: "Apellido",
      align: "center",
      render: (proforma) => proforma.client.lastname,
    },
    {
      dataIndex: "subtotal",
      title: "Total",
      align: "center",
      render: (subtotal) => `S/.${(subtotal / 100).toFixed(2)}`,
    },
    {
      dataIndex: "discount",
      title: "Descuento",
      align: "center",
      render: (discount) => `S/.${(discount / 100).toFixed(2)}`,
    },
    {
      dataIndex: "total",
      title: "Tot. Final",
      align: "center",
      render: (total) => `S/.${(total / 100).toFixed(2)}`,
    },
    {
      title: "Tot.",
      width: "70px",
      align: "center",
      render: () => <Checkbox checked={check}></Checkbox>,
    },
    {
      dataIndex: "due",
      title: "Pago a Cuenta",
      align: "center",
      render: (due, dataSale) => (
        <Input
          value={due}
          min={0}
          onChange={(event) => {
            setsales((prevState) => {
              const remainingsales = prevState.filter(
                (_sale) => _sale.id !== dataSale.id
              );
              return [
                ...remainingsales,
                {
                  ...dataSale,
                  due: event.nativeEvent.target.value,
                  received: event.nativeEvent.target.value,
                },
              ];
            });
          }}
          onBlur={(event) => {
            setsales((prevState) => {
              const remainingsales = prevState.filter(
                (_sale) => _sale.id !== dataSale.id
              );
              return [
                ...remainingsales,
                {
                  ...dataSale,
                  due: parseFloat(
                    event.nativeEvent.target.value || "0"
                  ).toFixed(2),
                  received: parseFloat(
                    event.nativeEvent.target.value || "0"
                  ).toFixed(2),
                },
              ];
            });
            event.persist();
          }}
          addonBefore="S/."
        />
      ),
    },
    {
      title: "Cobro",
      align: "center",
      render: (id, dataSale) => (
        <Button
          onClick={() => {
            setDataModal(dataSale);
            setIsVisible(true);
          }}
          type="primary"
        >
          Cobro
        </Button>
      ),
    },
  ];

  const [windowHeight, setWindowHeight] = useState(0);
  const [sales, setsales] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idCondition, setIdCondition] = useState();
  const [dataModal, setDataModal] = useState([]);
  const [check, setCheck] = useState(true);
  console.log("sales", sales);
  //para el filtro por vendedor
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [me, setMe] = useState({ name: null });

  //Modal
  const [isVisible, setIsVisible] = useState(false);

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

  //Trae todas las ventas
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const _sales = await getSales();
        setPagination({
          position: ["bottomCenter"],
          total: _sales.count,
          current: _sales.page,
          pageSize: _sales.pageSize,
          showSizeChanger: false,
        });
        setsales(
          _sales.rows.map((elem) => {
            return { ...elem, received: elem.due, change: 0 };
          })
        );
        setIdCondition(_sales.rows[0].id);
        setName(_sales.rows[0].proforma.client.name);
        setLastName(_sales.rows[0].proforma.client.lastname);
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };
    fetchSales();
  }, [toggleUpdateTable]);

  return (
    <>
      <Modal
        visible={isVisible}
        width="35%"
        title="¿Está seguro que desea cobrar esta proforma?"
        onCancel={() => setIsVisible(false)}
        footer={[
          <Button key="submit" type="primary">
            Confirmar Cobro
          </Button>,
        ]}
      >
        <RadioGroup
          gridColumnStart="2"
          gridColumnEnd="4"
          gridTemplateColumns="repeat(2, 1fr)"
          marginBottom="5%"
        >
          <Radio value={1}>Consignación</Radio>
          <Radio value={2}>Venta</Radio>
        </RadioGroup>
        <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="1rem">
          <Input value="Medio de Pago" />
          <Select />
          <Input value="Total a Cobrar" />
          <Input disabled value={`S/.${(dataModal.due / 100).toFixed(2)}`} />
          <Input value="Recibido" />
          <Input
            value={dataModal.received}
            onChange={(event) => {
              setsales((prevState) => {
                const remainingsales = prevState.filter(
                  (_sale) => _sale.id !== dataModal.id
                );
                console.log('remain', remainingsales)
                return [
                  ...remainingsales,
                  {
                    ...dataModal,
                    received: event.nativeEvent.target.value,
                  },
                ];
              });
              setDataModal({...dataModal, received: event.nativeEvent.target.value})
            }}
            onBlur={(event) => {
              setsales((prevState) => {
                const remainingsales = prevState.filter(
                  (_sale) => _sale.id !== dataModal.id
                );
                return [
                  ...remainingsales,
                  {
                    ...dataModal,
                    received: parseFloat(
                      event.nativeEvent.target.value || "0"
                    ).toFixed(2),
                  },
                ];
              });
              setDataModal({...dataModal, received: parseFloat(
                event.nativeEvent.target.value || "0"
              ).toFixed(2),})
              event.persist();
            }}
            addonBefore="S/."
          />
          <Input value="Vuelto" />
          <Input disabled value={`S/.${(dataModal.change / 100).toFixed(2)}`} />
          <Input value="Nro de Referencia" />
          <Input />
        </Grid>
      </Modal>
      <Container height="fit-content">
        <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="1rem">
          <Input value={me.name} disabled addonBefore="Usuario" />
          <DatePicker
            value={moment()}
            format={clientDateFormat}
            label={
              <>
                <Icon icon={faCalendarAlt} />
                Fecha
              </>
            }
            disabledDate={(value) => value}
          />
          <Input value={name} addonBefore="Cliente" />
          <Input value={lastName} />
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
      <Container height="20%">
        <Grid gridTemplateColumns="repeat(3, 1fr)" gridGap="1rem">
          <Button
            type="primary"
            gridColumnStart="2"
            //TODO: Cambiar el router de este boton
            onClick={async () => router.push(`/`)}
          >
            Historial de Caja
          </Button>
        </Grid>
      </Container>
    </>
  );
};
