import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import styled, { createGlobalStyle } from "styled-components";
import Barcode from "react-barcode";
import { get } from "lodash";
import { Checkbox, Input, Modal, Table, Tag, notification } from "antd";
import { faBarcode, faPeopleCarry, faPrint } from "@fortawesome/free-solid-svg-icons";
import moment from "moment-timezone";

import {
  generateProductBoxUnitTickets,
  getProductBox,
  getProductBarcodeByProductId,
  putProductBox,
  getWarehouses,
} from "../../../providers";

import { Container, Grid, Select, Button, Icon } from "../../../components";
import { ReadProductCode } from "../../../components/products/productBoxes/ReadProductCode";

const getIncludedProductBarcode = (productBox) =>
  get(productBox, "productBarcode", null) ||
  get(productBox, "product.productBarcodes.0", null) ||
  get(productBox, "product.productBarcodes", null);

export default ({ setPageTitle, setShowButton }) => {
  setPageTitle("Caja de productos");
  setShowButton(true);
  const productBoxLogColumns = [
    {
      width: "20%",
      title: "Fecha",
      dataIndex: "createdAt",
      key: "date",
      align: "center",
      render: (datetime) =>
        moment(datetime).tz("America/Lima").locale("es").format("dddd LL"),
    },
    {
      width: "20%",
      title: "Hora",
      dataIndex: "createdAt",
      key: "time",
      align: "center",
      render: (datetime) =>
        moment(datetime).tz("America/Lima").locale("es").format("h:mm a"),
    },
    {
      width: "20%",
      title: "Usuario",
      dataIndex: "user",
      align: "center",
      render: (user) => `${user.name} ${user.lastname}`,
    },
    {
      width: "20%",
      title: "Acción",
      dataIndex: "log",
      align: "center",
    },
    {
      width: "20%",
      title: "Ubicación",
      dataIndex: "warehouse",
      align: "center",
      render: (warehouse) => warehouse.name,
    },
  ];

  const [productBox, setProductBox] = useState(null);
  const [product, setProduct] = useState(null);
  const [productBarcode, setProductBarcode] = useState(null);
  const [newWarehouse, setNewWarehouse] = useState({});
  const [warehouses, setWarehouses] = useState([]);
  const [printAfterMove, setPrintAfterMove] = useState(true);
  const [isUnitTicketsModalVisible, setIsUnitTicketsModalVisible] =
    useState(false);
  // const [productBoxLogs, setProductBoxLogs] = useState(null);
  const [
    isModalReadProductBoxCodeVisible,
    setIsModalReadProductBoxCodeVisible,
  ] = useState(false);

  const router = useRouter();
  const { productBoxCode } = router.query;
  const unitBarcode = useMemo(
    () => get(productBarcode, "barcode", ""),
    [productBarcode]
  );
  const ticketQuantity = get(productBox, "stock", 0);
  const unitTickets = Array.from({ length: ticketQuantity }, (_, index) => index);

  useMemo(() => {
    const fetchProductBox = async () => {
      try {
        const _productBox = await getProductBox(productBoxCode);
        setProductBox(_productBox);
        setProduct(get(_productBox, "product", {}));
        const includedBarcode = getIncludedProductBarcode(_productBox);
        if (includedBarcode) {
          setProductBarcode(includedBarcode);
        } else if (get(_productBox, "product.id")) {
          const _productBarcode = await getProductBarcodeByProductId(
            get(_productBox, "product.id")
          );
          setProductBarcode(_productBarcode);
        }
        // setProductBoxLogs(get(_productBox, 'productBoxLogs', []));
      } catch (error) {
        Modal.error({
          title: "Código no encontrado",
          content: error.message,
          onOk: () => router.back(),
        });
      }
    };

    productBoxCode && fetchProductBox();
  }, [router]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      const _warehouses = await getWarehouses();
      setWarehouses(_warehouses);
    };
    fetchWarehouses();
  }, []);

  const selectOptions = (collection) =>
    collection.map((document) => ({
      label: document.name,
      value: document.id,
    }));
  const confirmMoveProductBox = () => {
    if (!newWarehouse.id || newWarehouse.id === productBox.warehouseId) {
      return notification.error({
        message: "Error al intentar mover la caja",
        description: "Debe seleccionar una ubicación distinta a la actual",
      });
    }

    Modal.confirm({
      width: "50%",
      title: "¿Está seguro de que desea cambiar la ubicación de la caja?",
      onOk: async () => moveProductBox(),
      content: (
        <Container padding="20px" flexDirection="column">
          <Grid
            gridTemplateColumns="repeat(1fr)"
            gridTemplateRows="repeat(1, 1fr)"
            justifyContent="center"
            gridGap="1rem"
          >
            <Input
              disabled
              addonBefore="Código de caja"
              value={productBoxCode}
            />
            <Input
              disabled
              addonBefore="Ubicación actual"
              value={productBox.warehouse.name}
            />
            <Input
              disabled
              addonBefore="Nueva ubicación"
              value={newWarehouse.name}
            />
            <Checkbox
              checked={printAfterMove}
              onChange={(event) => setPrintAfterMove(event.target.checked)}
            >
              Mostrar tickets unitarios despues de mover
            </Checkbox>
          </Grid>
        </Container>
      ),
    });
  };

  const moveProductBox = async () => {
    try {
      const body = {
        message: "MOVEMENT",
        warehouseId: newWarehouse.id,
      };

      // props.trigger(false);

      const response = await putProductBox(productBox.id, body);

      Modal.success({
        title: "Se ha movido la caja correctamente",
        content: `Caja: ${productBoxCode} | Nueva ubicación: ${newWarehouse.name}`,
        onOk: () => {
          if (printAfterMove) {
            setIsUnitTicketsModalVisible(true);
            setProductBox((prev) => ({
              ...prev,
              previousWarehouseId: prev.warehouseId,
              warehouseId: newWarehouse.id,
              previousWarehouse: prev.warehouse,
              warehouse: newWarehouse,
            }));
            return;
          }
          router.reload();
        },
      });
    } catch (error) {
      Modal.error({
        title: "Error al intentar subir producto",
        content: error.message,
        // onOk: () => props.toggleUpdateTable(prevState => !prevState)
      });
    }
  };
  const printUnitTickets = async () => {
    try {
      if (productBox?.id) {
        const updatedProductBox = await generateProductBoxUnitTickets(productBox.id);
        setProductBox((prev) => ({
          ...prev,
          ...updatedProductBox,
          product: prev.product,
          productBarcode: prev.productBarcode,
          productBoxLogs: prev.productBoxLogs,
        }));
      }
      window.print();
    } catch (error) {
      notification.error({
        message: "No se pudo registrar la emisión de tickets",
        description: get(error, "userMessage", error.message),
      });
    }
  };

  return (
    <>
      <PrintStyles />
      <ReadProductCode
        visible={isModalReadProductBoxCodeVisible}
        trigger={setIsModalReadProductBoxCodeVisible}
      />
      <Container height="auto" flexDirection="column">
        <Grid gridTemplateRows="1fr" gridGap="1rem">
          <Grid
            gridTemplateColumns="repeat(3, 1fr)"
            gridTemplateRows="repeat(1, 2rem)"
            gridGap="1rem"
          >
            <Input
              disabled
              addonBefore="Código Inventario"
              value={get(product, "code", "-")}
            />
            <Input
              disabled
              addonBefore="Código de caja"
              value={get(productBox, "trackingCode", "-")}
            />
            <Input
              disabled
              addonBefore="Código de abastecimiento"
              value={get(productBox, "supplyId", "-")}
            />
            <Input
              disabled
              addonBefore="Correlativo en abastecimiento"
              value={get(productBox, "indexFromSupliedProduct", "-")}
            />
            <Input
              disabled
              addonBefore="Familia"
              value={get(product, "familyName", "-")}
            />
            <Input
              disabled
              addonBefore="Sub-Familia"
              value={get(product, "subfamilyName", "-")}
            />
            <Input
              disabled
              addonBefore="Elemento"
              value={get(product, "elementName", "-")}
            />
            <Input
              disabled
              addonBefore="Modelo"
              value={get(product, "modelName", "-")}
            />
            <Input
              disabled
              addonBefore="Proveedor"
              value={get(product, "provider.name", "-")}
            />
            <Input
              disabled
              addonBefore="Ubicación"
              value={`${get(productBox, "warehouse.name", "-")} (${get(
                productBox,
                "warehouse.type",
                "-"
              )})`}
            />
            <Input
              disabled
              addonBefore="Unidades/caja"
              value={get(productBox, "boxSize", "-")}
            />
            <Input
              disabled
              addonBefore="Unidades disponibles"
              value={get(productBox, "stock", "-")}
            />
          </Grid>
        </Grid>
      </Container>
      <Container
        height="auto"
        //    width="50%"
        flexDirection="column"
        textAlign="center"
        justifyContent="center"
        alignItems="center"
        padding="1rem"
      >
        <h3>Movimiento de caja</h3>
        <Grid
          gridTemplateColumns="2fr 1fr"
          gridTemplateRows="repeat(1, 1fr)"
          justifyContent="center"
          gridGap="1rem"
        >
          <Select
            value={newWarehouse.name}
            label="Ubicación destino"
            onChange={(value) => {
              const _warehouse = warehouses.find(
                (warehouse) => warehouse.id === value
              );
              setNewWarehouse(_warehouse);
            }}
            options={selectOptions(warehouses)}
          />
          <Button onClick={() => confirmMoveProductBox()} type="primary">
            <Icon icon={faPeopleCarry} />
            Mover
          </Button>
        </Grid>
        <MovementTicketPanel>
          <TicketPanelHeader>
            <Icon icon={faBarcode} />
            <strong>Tickets unitarios al mover</strong>
          </TicketPanelHeader>
          <TicketPanelGrid>
            <TicketFields>
              <Input
                disabled
                addonBefore="Código unidad"
                value={unitBarcode || "-"}
              />
              <Input
                disabled
                addonBefore="Tickets"
                value={`${ticketQuantity} unidades`}
              />
              <Input
                disabled
                addonBefore="Estado"
                value={
                  productBox?.unitTicketsGeneratedAt
                    ? "Tickets generados"
                    : "Sin tickets"
                }
              />
            </TicketFields>
            <TicketActions>
            <Checkbox
              checked={printAfterMove}
              onChange={(event) => setPrintAfterMove(event.target.checked)}
            >
              Mostrar después de mover
            </Checkbox>
            <Button
              type="primary"
              disabled={!ticketQuantity || !unitBarcode}
              onClick={() => setIsUnitTicketsModalVisible(true)}
            >
              <Icon icon={faPrint} />
              Ver tickets
            </Button>
            </TicketActions>
          </TicketPanelGrid>
        </MovementTicketPanel>
      </Container>
      <Container
        height="auto"
        flexDirection="column"
        textAlign="center"
        padding="1rem 0"
      >
        <Grid gridTemplateRows="repeat(1, auto)" gridGap="1rem">
          <div>
            <h3>Bitácora de movimientos de caja</h3>
            <br />
            <Table
              columns={productBoxLogColumns}
              bordered
              scrollToFirstRowOnChange
              pagination={false}
              rowKey="id"
              dataSource={get(productBox, "productBoxLogs", [])}
            />
          </div>
        </Grid>
      </Container>
      <Container height="15%" justifyContent="space-around">
        <Button
          onClick={() => setIsModalReadProductBoxCodeVisible(true)}
          size="large"
          width="30%"
          type="primary"
        >
          Mover Caja(s)
        </Button>
      </Container>
      <Modal
        visible={isUnitTicketsModalVisible}
        width="900px"
        title="Tickets unitarios"
        okText="Imprimir"
        cancelText="Cerrar"
        onOk={printUnitTickets}
        onCancel={() => setIsUnitTicketsModalVisible(false)}
      >
        <PrintToolbar>
          <Tag color="blue">{unitTickets.length} ticket(s)</Tag>
          <span>
            Todos imprimen el mismo código de producto:{" "}
            <strong>{unitBarcode}</strong>
          </span>
        </PrintToolbar>
        <TicketPrintArea className="unit-ticket-print-area">
          {unitTickets.map((index) => (
            <UnitTicket key={index}>
              <TicketTitle>Ticket de unidad</TicketTitle>
              <TicketLine>
                <span>Código inventario</span>
                <strong>{get(product, "code", "-")}</strong>
              </TicketLine>
              <TicketLine>
                <span>Nombre comercial</span>
                <strong>{get(product, "tradename", "-")}</strong>
              </TicketLine>
              <TicketLine>
                <span>Modelo</span>
                <strong>{get(product, "modelName", "-")}</strong>
              </TicketLine>
              <TicketLine>
                <span>Caja origen</span>
                <strong>{get(productBox, "trackingCode", "-")}</strong>
              </TicketLine>
              <BarcodeWrap>
                <Barcode
                  value={unitBarcode}
                  format="CODE128"
                  height={56}
                  width={2}
                  fontSize={16}
                  margin={0}
                />
              </BarcodeWrap>
            </UnitTicket>
          ))}
        </TicketPrintArea>
      </Modal>
    </>
  );
};

const PrintStyles = createGlobalStyle`
  @media print {
    body * {
      visibility: hidden;
    }

    .unit-ticket-print-area,
    .unit-ticket-print-area * {
      visibility: visible;
    }

    .unit-ticket-print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 0;
    }
  }
`;

const MovementTicketPanel = styled.div`
  border: 1px solid #d9d9d9;
  margin-top: 1rem;
  padding: 1rem;
  text-align: left;
  width: 100%;
`;

const TicketPanelHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const TicketPanelGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const TicketFields = styled.div`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(260px, 2fr) minmax(140px, 1fr) minmax(150px, 1fr);
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const TicketActions = styled.div`
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;

  @media (max-width: 768px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const PrintToolbar = styled.div`
  align-items: center;
  border-bottom: 1px solid #d9d9d9;
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
`;

const TicketPrintArea = styled.div`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const UnitTicket = styled.div`
  border: 1px solid #111827;
  min-height: 260px;
  padding: 0.75rem;
`;

const TicketTitle = styled.div`
  border-bottom: 1px solid #111827;
  font-weight: 700;
  margin-bottom: 0.5rem;
  padding-bottom: 0.35rem;
  text-align: center;
`;

const TicketLine = styled.div`
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 120px 1fr;
  margin-bottom: 0.35rem;

  span {
    color: #4b5563;
  }

  strong {
    min-width: 0;
    overflow-wrap: anywhere;
  }
`;

const BarcodeWrap = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-top: 0.75rem;
  overflow: hidden;
`;
