import React, { useEffect, useMemo, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Barcode from "react-barcode";
import { get } from "lodash";
import {
  Checkbox,
  Empty,
  Input,
  Modal,
  Table,
  Tag,
  notification,
} from "antd";
import {
  faBarcode,
  faBoxOpen,
  faExchangeAlt,
  faPrint,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

import { Button, Container, Grid, Icon, Select } from "../../components";
import {
  generateProductBoxUnitTickets,
  getProductBarcodeByProductId,
  getProductBox,
  getWarehouses,
  putProductBox,
} from "../../providers";

const getIncludedProductBarcode = (productBox) =>
  get(productBox, "productBarcode", null) ||
  get(productBox, "product.productBarcodes.0", null) ||
  get(productBox, "product.productBarcodes", null);

const getWarehouseOptions = (warehouses) =>
  warehouses.map((warehouse) => ({
    label: `${warehouse.name} (${warehouse.type})`,
    value: warehouse.id,
  }));

export default function BoxMaintenance({ setPageTitle, setShowButton }) {
  const [boxCode, setBoxCode] = useState("");
  const [productBox, setProductBox] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [printAfterMove, setPrintAfterMove] = useState(true);
  const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);
  const [productBarcode, setProductBarcode] = useState(null);

  const product = get(productBox, "product", null);
  const unitBarcode = useMemo(
    () => get(productBarcode, "barcode", ""),
    [productBarcode],
  );

  const selectedWarehouse = warehouses.find(
    (warehouse) => warehouse.id === warehouseId,
  );

  const ticketQuantity = get(productBox, "stock", 0);
  const isExplodedBox = !!get(productBox, "unitTicketsGeneratedAt");
  const explodedAt = get(productBox, "unitTicketsGeneratedAt")
    ? new Date(get(productBox, "unitTicketsGeneratedAt")).toLocaleString("es-PE")
    : "-";

  useEffect(() => {
    setPageTitle("Mantenimiento de cajas");
    setShowButton && setShowButton(false);
  }, []);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await getWarehouses();
        setWarehouses(response);
      } catch (error) {
        notification.error({
          message: "No se pudieron cargar las ubicaciones",
          description: get(error, "userMessage", error.message),
        });
      }
    };

    fetchWarehouses();
  }, []);

  const searchProductBox = async (code = boxCode) => {
    if (!code) {
      notification.error({
        message: "Ingrese un codigo de caja",
      });
      return;
    }

    try {
      setIsSearching(true);
      const response = await getProductBox(code.trim());
      setProductBox(response);
      setWarehouseId(null);
      setBoxCode(response.trackingCode);
      const includedBarcode = getIncludedProductBarcode(response);
      if (includedBarcode) {
        setProductBarcode(includedBarcode);
      } else if (get(response, "product.id")) {
        const fetchedBarcode = await getProductBarcodeByProductId(
          get(response, "product.id"),
        );
        setProductBarcode(fetchedBarcode);
      }
    } catch (error) {
      setProductBox(null);
      setProductBarcode(null);
      notification.error({
        message: "Caja no encontrada",
        description: get(error, "userMessage", error.message),
      });
    } finally {
      setIsSearching(false);
    }
  };

  const moveProductBox = async () => {
    if (!productBox) return;

    if (!warehouseId || warehouseId === productBox.warehouseId) {
      notification.error({
        message: "Seleccione una ubicacion distinta",
      });
      return;
    }

    Modal.confirm({
      title: "Mover caja",
      content: `La caja ${productBox.trackingCode} se movera a ${selectedWarehouse.name}.`,
      okText: "Mover",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setIsMoving(true);
          await putProductBox(productBox.id, {
            message: "MOVEMENT",
            warehouseId,
          });

          notification.success({
            message: "Caja movida correctamente",
          });

          await searchProductBox(productBox.trackingCode);

          if (printAfterMove) setIsPrintModalVisible(true);
        } catch (error) {
          notification.error({
            message: "No se pudo mover la caja",
            description: get(error, "userMessage", error.message),
          });
        } finally {
          setIsMoving(false);
        }
      },
    });
  };

  const printTickets = async () => {
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

  const movementColumns = [
    {
      title: "Fecha",
      dataIndex: "createdAt",
      align: "center",
      render: (value) => new Date(value).toLocaleDateString("es-PE"),
    },
    {
      title: "Usuario",
      dataIndex: "user",
      align: "center",
      render: (user) =>
        user ? `${get(user, "name", "")} ${get(user, "lastname", "")}` : "-",
    },
    {
      title: "Accion",
      dataIndex: "log",
      align: "center",
    },
    {
      title: "Ubicacion",
      dataIndex: "warehouse",
      align: "center",
      render: (warehouse) => get(warehouse, "name", "-"),
    },
  ];

  const referenceColumns = [
    {
      title: "Codigo de barra unidad",
      dataIndex: "barcode",
      align: "center",
    },
    {
      title: "Codigo inventario",
      dataIndex: "productCode",
      align: "center",
    },
    {
      title: "Estado",
      dataIndex: "status",
      align: "center",
      render: (status) => <Tag color="gold">{status}</Tag>,
    },
  ];

  const referenceRows = product
    ? [
        {
          key: product.id,
          barcode: unitBarcode,
          productCode: product.code,
          status: "Activo",
        },
      ]
    : [];

  const tickets = Array.from({ length: ticketQuantity }, (_, index) => index);

  return (
    <>
      <PrintStyles />
      <Page padding="1rem" height="auto" flexDirection="column">
        <SearchBand>
          <SearchHeader>
            <Icon icon={faBoxOpen} />
            <strong>Buscar caja</strong>
          </SearchHeader>
          <SearchActions>
            <Input.Search
              value={boxCode}
              enterButton={
                <>
                  <Icon icon={faSearch} />
                  Buscar
                </>
              }
              loading={isSearching}
              onChange={(event) => setBoxCode(event.target.value)}
              onSearch={searchProductBox}
              placeholder="Escanee o ingrese el codigo de caja"
            />
          </SearchActions>
        </SearchBand>

        {!productBox && (
          <EmptyState>
            <Empty description="Busque una caja para ver mantenimiento, movimiento e impresion de tickets unitarios." />
          </EmptyState>
        )}

        {productBox && (
          <>
            <SummaryGrid gridTemplateColumns="2fr 1fr" gridGap="1rem">
              <Section>
                <SectionTitle>
                  <Icon icon={faBarcode} />
                  Caja encontrada
                </SectionTitle>
                <InfoGrid gridTemplateColumns="repeat(3, 1fr)" gridGap="0.75rem">
                  <Input
                    disabled
                    addonBefore="Codigo caja"
                    value={get(productBox, "trackingCode", "-")}
                  />
                  <Input
                    disabled
                    addonBefore="Ubicacion"
                    value={`${get(productBox, "warehouse.name", "-")} (${get(
                      productBox,
                      "warehouse.type",
                      "-",
                    )})`}
                  />
                  <Input
                    disabled
                    addonBefore="Stock"
                    value={`${get(productBox, "stock", 0)} unidades`}
                  />
                  <Input
                    disabled
                    addonBefore="Unid/caja"
                    value={get(productBox, "boxSize", "-")}
                  />
                  <Input
                    disabled
                    addonBefore="Abastecimiento"
                    value={get(productBox, "supply.code", productBox.supplyId)}
                  />
                  <Input
                    disabled
                    addonBefore="Caja nro"
                    value={get(productBox, "indexFromSupliedProduct", "-")}
                  />
                </InfoGrid>
              </Section>

              <Section>
                <SectionTitle>
                  <Icon icon={faExchangeAlt} />
                  Movimiento
                </SectionTitle>
                <MoveStack>
                  <Select
                    label="Destino"
                    value={warehouseId}
                    onChange={setWarehouseId}
                    options={getWarehouseOptions(warehouses)}
                  />
                  <Checkbox
                    checked={printAfterMove}
                    onChange={(event) => setPrintAfterMove(event.target.checked)}
                  >
                    Ofrecer tickets unitarios al mover
                  </Checkbox>
                  <Button
                    type="primary"
                    loading={isMoving}
                    disabled={!warehouseId || warehouseId === productBox.warehouseId}
                    onClick={moveProductBox}
                  >
                    <Icon icon={faExchangeAlt} />
                    Mover caja
                  </Button>
                </MoveStack>
              </Section>
            </SummaryGrid>

            <SummaryGrid gridTemplateColumns="2fr 1fr" gridGap="1rem">
              <Section>
                <SectionTitle>Producto</SectionTitle>
                <InfoGrid gridTemplateColumns="repeat(2, 1fr)" gridGap="0.75rem">
                  <Input
                    disabled
                    addonBefore="Codigo inventario"
                    value={get(product, "code", "-")}
                  />
                  <Input
                    disabled
                    addonBefore="Codigo unidad"
                    value={unitBarcode || "-"}
                  />
                  <Input
                    disabled
                    addonBefore="Nombre comercial"
                    value={get(product, "tradename", "-")}
                  />
                  <Input
                    disabled
                    addonBefore="Proveedor"
                    value={get(product, "provider.name", "-")}
                  />
                  <Input
                    disabled
                    addonBefore="Familia"
                    value={get(product, "familyName", "-")}
                  />
                  <Input
                    disabled
                    addonBefore="Modelo"
                    value={get(product, "modelName", "-")}
                  />
                </InfoGrid>
              </Section>

              <Section>
                <SectionTitle>
                  <Icon icon={faPrint} />
                  Tickets unitarios
                </SectionTitle>
                <MoveStack>
                  <Input
                    disabled
                    addonBefore="Tickets"
                    value={`${ticketQuantity} unidades`}
                  />
                  <Input
                    disabled
                    addonBefore="Caja"
                    value={isExplodedBox ? "Explotada" : "Sin explotar"}
                  />
                  <Input
                    disabled
                    addonBefore="Explotada el"
                    value={explodedAt}
                  />
                  <Input
                    disabled
                    addonBefore="Tickets emitidos"
                    value={
                      isExplodedBox
                        ? `${get(productBox, "unitTicketsGeneratedQuantity", 0)} unidades`
                        : "-"
                    }
                  />
                  <HelperText>
                    Puedes volver a visualizar o imprimir los tickets cuando lo necesites.
                  </HelperText>
                  <Button
                    type="primary"
                    disabled={!ticketQuantity || !unitBarcode}
                    onClick={() => setIsPrintModalVisible(true)}
                  >
                    <Icon icon={faPrint} />
                    Ver / imprimir
                  </Button>
                </MoveStack>
              </Section>
            </SummaryGrid>

            <Section>
              <SectionTitle>Referencia codigo producto</SectionTitle>
              <Table
                columns={referenceColumns}
                dataSource={referenceRows}
                pagination={false}
                bordered
                size="middle"
              />
            </Section>

            <Section>
              <SectionTitle>Bitacora de caja</SectionTitle>
              <Table
                columns={movementColumns}
                dataSource={get(productBox, "productBoxLogs", [])}
                rowKey="id"
                pagination={false}
                bordered
                size="middle"
              />
            </Section>
          </>
        )}
      </Page>

      <Modal
        visible={isPrintModalVisible}
        width="900px"
        title="Tickets unitarios"
        okText="Imprimir"
        cancelText="Cerrar"
        onOk={printTickets}
        onCancel={() => setIsPrintModalVisible(false)}
      >
        <PrintToolbar>
          <Tag color="blue">{ticketQuantity} ticket(s)</Tag>
          <span>
            Todos imprimen el mismo codigo de producto: <strong>{unitBarcode}</strong>
          </span>
        </PrintToolbar>
        <TicketPrintArea className="unit-ticket-print-area">
          {tickets.map((index) => (
            <UnitTicket key={index}>
              <TicketTitle>Ticket de unidad</TicketTitle>
              <TicketLine>
                <span>Codigo inventario</span>
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
}

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

const Page = styled(Container)`
  gap: 1rem;
  overflow: auto;
`;

const SearchBand = styled.div`
  align-items: center;
  border-bottom: 1px solid #d9d9d9;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 1rem;
  padding: 0 0 1rem 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SearchHeader = styled.div`
  align-items: center;
  display: flex;
  font-size: 1rem;
`;

const SearchActions = styled.div`
  min-width: 0;
`;

const EmptyState = styled.div`
  align-items: center;
  display: flex;
  min-height: 280px;
  justify-content: center;
`;

const SummaryGrid = styled(Grid)`
  grid-template-columns: ${(props) => props.gridTemplateColumns};

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.section`
  border: 1px solid #d9d9d9;
  padding: 1rem;
`;

const SectionTitle = styled.h3`
  align-items: center;
  display: flex;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
`;

const InfoGrid = styled(Grid)`
  grid-template-columns: ${(props) => props.gridTemplateColumns};

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const MoveStack = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const HelperText = styled.span`
  color: #6b7280;
  font-size: 0.9rem;
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
