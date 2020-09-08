import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  DatePicker,
  Grid,
  Icon,
  Select,
} from "../../components";
import { RadioGroup } from "../../components/RadioGroup";
import { getSales, getUsers, userProvider, putSale } from "../../providers";
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
      dataIndex: "initialPayment",
      title: "Pago a Cuenta",
      align: "center",
      render: (initialPayment) => `S/.${initialPayment}`,
    },
    {
      title: "Cobro",
      align: "center",
      render: (id, dataSale) => (
        <Button
          onClick={() => {
            setDataModal(dataSale);
            setIsVisible(true);
            setIdCondition(dataSale.id);
            setName(dataSale.proforma.client.name);
            setLastName(dataSale.proforma.client.lastname);
          }}
          type={idCondition === dataSale.id ? "primary" : ""}
        >
          Cobro
        </Button>
      ),
    },
  ];

  const selectOptions = (collection) =>
    collection.map((document) => ({
      value: document.id,
      label: document.name,
    }));

  const [windowHeight, setWindowHeight] = useState(0);
  const [sales, setsales] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idCondition, setIdCondition] = useState();
  const [dataModal, setDataModal] = useState([]);
  console.log("modal", dataModal);
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
            return {
              ...elem,
              initialPayment: elem.initialPayment / 100,
              received: elem.initialPayment / 100,
              check: true,
            };
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

  const onPutSale = async () => {
    try {
      let _response;
      if (dataModal.paymentMethod === "Efectivo") {
        _response = await putSale(dataModal.id, {
          billingType: dataModal.billingType,
          paymentMethod: dataModal.paymentMethod,
          initialPayment: parseFloat(dataModal.initialPayment) * 100,
          receivedAmount: parseFloat(dataModal.received) * 100,
        });
      } else {
        _response = await putSale(dataModal.id, {
          billingType: dataModal.billingType,
          paymentMethod: dataModal.paymentMethod,
          initialPayment: parseFloat(dataModal.initialPayment) * 100,
          referenceNumber: dataModal.referenceNumber,
        });
      }
      notification.success({
        message: "Pago a Cuenta registrado exitosamente",
      });
      console.log("resp", _response);
    } catch (error) {
      notification.error({
        message: error.message,
      });
    }
  };

  return (
    <>
      <Modal
        visible={isVisible}
        width="40%"
        title="¿Está seguro que desea cobrar esta proforma?"
        onCancel={() => setIsVisible(false)}
        footer={[
          <Button key="submit" type="primary" onClick={onPutSale}>
            Confirmar Cobro
          </Button>,
        ]}
      >
        <Grid gridTemplateRows="repeat(1, 1fr)" gridGap="1rem">
          <Grid gridTemplateColumns="repeat(3, 1fr)" gridGap="1rem">
            <h3>Forma de pago:</h3>
            <RadioGroup
              gridColumnStart="2"
              gridColumnEnd="4"
              gridTemplateColumns="repeat(2, 1fr)"
              value={dataModal.billingType}
              onChange={(event) => {
                setsales((prevState) => {
                  const remainingsales = prevState.filter(
                    (_sale) => _sale.id !== dataModal.id
                  );
                  return [
                    ...remainingsales,
                    {
                      ...dataModal,
                      billingType: event.target.value,
                    },
                  ];
                });
                setDataModal({
                  ...dataModal,
                  billingType: event.target.value,
                });
              }}
            >
              <Radio value={"SALE"}>Venta</Radio>
              <Radio value={"CONSIGNMENT"}>Consignación</Radio>
            </RadioGroup>
          </Grid>
          <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="1rem">
            <h3>Total:</h3>
            <Input
              disabled
              value={(dataModal.total / 100).toFixed(2)}
              addonBefore="S/."
            />
          </Grid>
          <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="1rem">
            <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="1rem">
              <h3>Pago a Cuenta:</h3>
              <Checkbox
                checked={dataModal.check}
                onChange={(event) => {
                  setDataModal({
                    ...dataModal,
                    check: !dataModal.check,
                  });
                }}
              />
            </Grid>
            <Input
              disabled={dataModal.check}
              value={dataModal.initialPayment}
              min={0}
              onChange={(event) => {
                setsales((prevState) => {
                  const remainingsales = prevState.filter(
                    (_sale) => _sale.id !== dataModal.id
                  );
                  return [
                    ...remainingsales,
                    {
                      ...dataModal,
                      initialPayment: event.nativeEvent.target.value,
                      received: event.nativeEvent.target.value,
                    },
                  ];
                });
                setDataModal({
                  ...dataModal,
                  initialPayment: event.nativeEvent.target.value,
                  received: event.nativeEvent.target.value,
                });
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
                      initialPayment: parseFloat(
                        event.nativeEvent.target.value || "0"
                      ).toFixed(2),
                      received: parseFloat(
                        event.nativeEvent.target.value || "0"
                      ).toFixed(2),
                    },
                  ];
                });
                setDataModal({
                  ...dataModal,
                  initialPayment: parseFloat(
                    event.nativeEvent.target.value || "0"
                  ).toFixed(2),
                  received: parseFloat(
                    event.nativeEvent.target.value || "0"
                  ).toFixed(2),
                });
                event.persist();
              }}
              addonBefore="S/."
            />
          </Grid>
          <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="1rem">
            <h3>Medio de pago:</h3>
            <Select
              value={dataModal.paymentMethod}
              options={selectOptions([
                { name: "Efectivo", id: "Efectivo" },
                { name: "Tarjeta", id: "Tarjeta" },
              ])}
              onChange={(event) => {
                setsales((prevState) => {
                  const remainingsales = prevState.filter(
                    (_sale) => _sale.id !== dataModal.id
                  );
                  return [
                    ...remainingsales,
                    {
                      ...dataModal,
                      paymentMethod: event,
                    },
                  ];
                });
                setDataModal({
                  ...dataModal,
                  paymentMethod: event,
                });
              }}
            />
          </Grid>
          {dataModal.paymentMethod === "Efectivo" ? (
            <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="1rem">
              <h3>Recibido:</h3>
              <Input
                value={dataModal.received}
                onChange={(event) => {
                  setsales((prevState) => {
                    const remainingsales = prevState.filter(
                      (_sale) => _sale.id !== dataModal.id
                    );
                    return [
                      ...remainingsales,
                      {
                        ...dataModal,
                        received: event.nativeEvent.target.value,
                      },
                    ];
                  });
                  setDataModal({
                    ...dataModal,
                    received: event.nativeEvent.target.value,
                  });
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
                  setDataModal({
                    ...dataModal,
                    received: parseFloat(
                      event.nativeEvent.target.value || "0"
                    ).toFixed(2),
                  });
                  event.persist();
                }}
                addonBefore="S/."
              />
              <h3>Vuelto:</h3>
              <Input
                disabled
                value={(dataModal.received - dataModal.initialPayment).toFixed(
                  2
                )}
                addonBefore="S/."
              />
            </Grid>
          ) : (
            <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="1rem">
              <h3>Nro de Referencia:</h3>
              <Input
                onChange={(event) => {
                  setsales((prevState) => {
                    const remainingsales = prevState.filter(
                      (_sale) => _sale.id !== dataModal.id
                    );
                    return [
                      ...remainingsales,
                      {
                        ...dataModal,
                        referenceNumber: event.nativeEvent.target.value,
                      },
                    ];
                  });
                  setDataModal({
                    ...dataModal,
                    referenceNumber: event.nativeEvent.target.value,
                  });
                  event.persist();
                }}
              />
            </Grid>
          )}
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
          <Input value={name} disabled addonBefore="Cliente" />
          <Input value={lastName} disabled />
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
