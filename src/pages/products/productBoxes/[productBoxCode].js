import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { get } from "lodash";
import { Alert, Checkbox, Input, Modal, Table, Tag, notification } from "antd";
import { faPeopleCarry } from "@fortawesome/free-solid-svg-icons";
import moment from "moment-timezone";
import styled, { createGlobalStyle } from "styled-components";

import {
  getProductBox,
  getProductBarcodeByProductId,
  putProductBox,
  getWarehouses,
} from "../../../providers";

import { Container, Grid, Select, Button, Icon } from "../../../components";
import { ReadProductCode } from "../../../components/products/productBoxes/ReadProductCode";
import {
  generateUnitTicketPdf,
  UnitTicketModal,
} from "../../../components/products/UnitTicketModal";

const renderUser = (user) =>
  user ? [user.name, user.lastname].filter(Boolean).join(" ") || "-" : "-";

export default ({ setPageTitle, setShowButton }) => {
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
      render: renderUser,
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
      render: (warehouse) => warehouse?.name || "-",
    },
  ];

  const [productBox, setProductBox] = useState(null);
  const [product, setProduct] = useState(null);
  const [newWarehouse, setNewWarehouse] = useState({});
  const [warehouses, setWarehouses] = useState([]);
  const [unitBarcode, setUnitBarcode] = useState("");
  const [ticketVisible, setTicketVisible] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const isActivePhysicalBox =
    productBox?.inventoryKind !== "EXPLODED" &&
    productBox?.lifecycleStatus !== "DISCARDED";
  // const [productBoxLogs, setProductBoxLogs] = useState(null);
  const [
    isModalReadProductBoxCodeVisible,
    setIsModalReadProductBoxCodeVisible,
  ] = useState(false);

  const router = useRouter();
  const { productBoxCode } = router.query;

  useEffect(() => {
    setShowButton(true);
  }, []);

  useEffect(() => {
    const productCode = get(product, "code");
    const modelName = get(product, "modelName");
    const boxCode = get(productBox, "trackingCode", productBoxCode);

    setPageTitle(
      productCode && modelName
        ? `Caja ${boxCode} - ${productCode} - ${modelName}`
        : "Caja de productos"
    );
  }, [product, productBox, productBoxCode]);

  useMemo(() => {
    const fetchProductBox = async () => {
      try {
        const _productBox = await getProductBox(productBoxCode);
        const _product = get(_productBox, "product", {});
        const barcode = await getProductBarcodeByProductId(_product.id);
        setProductBox(_productBox);
        setProduct(_product);
        setUnitBarcode(barcode.barcode);
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
      setWarehouses(
        _warehouses.filter((warehouse) => warehouse.type !== "AjusteInventario")
      );
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

    const destinationIsStore = newWarehouse.type === "Tienda";
    let shouldGenerateUnitTickets = destinationIsStore;
    Modal.confirm({
      width: "50%",
      title: "¿Está seguro de que desea cambiar la ubicación de la caja?",
      okText: destinationIsStore ? "Mover y explotar" : "Mover",
      onOk: async () => moveProductBox(shouldGenerateUnitTickets),
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
            {destinationIsStore && (
              <Alert
                type="warning"
                showIcon
                message="La caja será explotada al ingresar a Tienda"
                description="La caja física quedará bloqueada y su stock pasará a unidades."
              />
            )}
            {destinationIsStore && (
              <Checkbox
                defaultChecked
                onChange={(event) => {
                  shouldGenerateUnitTickets = event.target.checked;
                }}
              >
                Generar PDF de tickets unitarios después del movimiento
              </Checkbox>
            )}
          </Grid>
        </Container>
      ),
    });
  };

  const moveProductBox = async (shouldGenerateUnitTickets = false) => {
    try {
      const body = {
        message: "MOVEMENT",
        warehouseId: newWarehouse.id,
      };

      // props.trigger(false);

      const response = await putProductBox(productBox.id, body);

      notification.success({ message: "La caja fue movida correctamente" });
      if (response.wasExploded && shouldGenerateUnitTickets) {
        await generateUnitTicketPdf({
          product,
          barcode: unitBarcode,
          quantity: response.explodedLot.stock,
          productBoxId: response.productBox.id,
          warehouseId: response.explodedLot.warehouseId,
        });
        notification.success({ message: "PDF de tickets unitarios generado" });
      }
      router.reload();
    } catch (error) {
      Modal.error({
        title: "Error al intentar subir producto",
        content: error.message,
        // onOk: () => props.toggleUpdateTable(prevState => !prevState)
      });
    }
  };
  return (
    <>
      <ProductBoxResponsiveStyles />
      <ReadProductCode
        visible={isModalReadProductBoxCodeVisible}
        trigger={setIsModalReadProductBoxCodeVisible}
      />
      <UnitTicketModal
        visible={ticketVisible}
        onClose={() => setTicketVisible(false)}
        product={product}
        barcode={unitBarcode}
        initialQuantity={ticketQuantity}
        productBoxId={productBox?.id}
        warehouseId={get(productBox, "explodedLots.0.warehouseId")}
      />
      <BoxPageShell>
        <BoxSummaryHeader>
          <div>
            <span>Caja</span>
            <h1>{get(productBox, "trackingCode", productBoxCode || "-")}</h1>
            <p>
              {get(product, "code", "-")} - {get(product, "modelName", "-")}
            </p>
          </div>
          <BoxStatusTag $active={isActivePhysicalBox}>
            {isActivePhysicalBox ? "Caja física activa" : "Caja bloqueada"}
          </BoxStatusTag>
        </BoxSummaryHeader>
      <Container height="auto" flexDirection="column">
        <SectionTitle>Información de caja</SectionTitle>
        <Grid gridTemplateRows="1fr" gridGap="1rem">
          <Grid
            className="product-box-info-grid"
            gridTemplateColumns="repeat(3, 1fr)"
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
      <MoveSection>
        <h3>Movimiento de caja</h3>
        {!isActivePhysicalBox && (
          <Alert
            type="warning"
            showIcon
            message="Esta caja ya fue explotada y no puede volver a moverse."
          />
        )}
        {!isActivePhysicalBox && get(productBox, "explodedLots.length", 0) > 0 && (
          <Button
            onClick={() => {
              const explodedQuantity = get(productBox, "explodedLots", []).reduce(
                (total, lot) => total + Number(lot.boxSize || lot.stock || 0),
                0
              );
              setTicketQuantity(explodedQuantity || productBox.boxSize || 1);
              setTicketVisible(true);
            }}
            type="primary"
          >
            Generar PDF de tickets unitarios
          </Button>
        )}
        <Grid
          className="product-box-move-grid"
          gridTemplateColumns="2fr 1fr"
          justifyContent="center"
          gridGap="1.25rem"
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
          <Button
            disabled={!isActivePhysicalBox}
            onClick={() => confirmMoveProductBox()}
            type="primary"
          >
            <Icon icon={faPeopleCarry} />
            Mover
          </Button>
        </Grid>
      </MoveSection>
      <Container
        className="product-box-log-section"
        height="auto"
        flexDirection="column"
        textAlign="center"
        padding="1rem"
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
      <Container className="product-box-footer-actions" height="auto" justifyContent="center">
        <Button
          onClick={() => setIsModalReadProductBoxCodeVisible(true)}
          size="large"
          width="240px"
          type="primary"
        >
          Mover Caja(s)
        </Button>
      </Container>
      </BoxPageShell>
    </>
  );
};

const BoxPageShell = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1rem;

  > div {
    background: #ffffff;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
  }
`;

const BoxSummaryHeader = styled.section`
  align-items: center;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 1rem;

  span {
    color: #667085;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  h1 {
    color: #1f2937;
    font-size: 1.35rem;
    line-height: 1.7rem;
    margin: 0.2rem 0;
    overflow-wrap: anywhere;
  }

  p {
    color: #5f6b7a;
    margin: 0;
    overflow-wrap: anywhere;
  }
`;

const BoxStatusTag = styled.div`
  background: ${(props) => (props.$active ? "#e6f7ff" : "#fff7e6")};
  border: 1px solid ${(props) => (props.$active ? "#91d5ff" : "#ffd591")};
  border-radius: 999px;
  color: ${(props) => (props.$active ? "#0050b3" : "#ad6800")};
  font-weight: 700;
  padding: 0.35rem 0.75rem;
  white-space: nowrap;
`;

const SectionTitle = styled.h3`
  color: #1f2937;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  text-align: left;
`;

const MoveSection = styled.section`
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  display: grid;
  gap: 1rem;
  padding: 1rem;

  h3 {
    color: #1f2937;
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
    text-align: left;
  }
`;

const ProductBoxResponsiveStyles = createGlobalStyle`
  .product-box-info-grid,
  .product-box-move-grid {
    width: 100%;
  }

  .product-box-log-section h3 {
    color: #1f2937;
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
    text-align: left;
  }

  .product-box-log-section br {
    display: none;
  }

  .product-box-log-section .ant-table-thead > tr > th,
  .product-box-log-section .ant-table-tbody > tr > td {
    padding: 0.6rem 0.5rem;
    white-space: normal;
    word-break: break-word;
  }

  .product-box-footer-actions {
    padding: 1rem;
  }

  @media (max-width: 768px) {
    ${BoxPageShell} {
      gap: 0.75rem;
      padding: 0.75rem;
    }

    ${BoxSummaryHeader} {
      grid-template-columns: 1fr;
      padding: 0.85rem;
    }

    ${BoxSummaryHeader} h1 {
      font-size: 1.12rem;
      line-height: 1.4rem;
    }

    ${BoxStatusTag} {
      justify-self: flex-start;
      white-space: normal;
    }

    .product-box-info-grid,
    .product-box-move-grid {
      grid-template-columns: 1fr !important;
      grid-template-rows: none !important;
      grid-gap: 0.75rem !important;
    }

    .product-box-info-grid .ant-input-wrapper.ant-input-group {
      display: grid;
      grid-template-columns: 1fr;
      width: 100%;
    }

    .product-box-info-grid .ant-input-group-addon {
      border-bottom: 0;
      border-radius: 4px 4px 0 0;
      border-right: 1px solid #d9d9d9;
      display: block;
      line-height: 1.2rem;
      padding: 0.45rem 0.65rem;
      text-align: left;
      white-space: normal;
      width: 100%;
    }

    .product-box-info-grid .ant-input {
      border-radius: 0 0 4px 4px;
      display: block;
      min-height: 2.15rem;
      width: 100%;
    }

    .product-box-move-grid button,
    .product-box-footer-actions button {
      width: 100% !important;
    }

    .product-box-log-section {
      overflow-x: auto;
      padding: 0.75rem !important;
    }

    .product-box-log-section .ant-table {
      min-width: 680px;
    }

    .product-box-footer-actions {
      padding: 0.75rem !important;
    }
  }
`;
