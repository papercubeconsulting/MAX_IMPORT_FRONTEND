import React, { useEffect, useMemo, useState } from "react";
import { useGlobal } from "reactn";
import { Alert, Checkbox, Empty, Input, Modal, Table, Tag, notification } from "antd";
import styled from "styled-components";
import { get } from "lodash";
import { Button, Select } from "../../components";
import {
  getWarehouses,
  putProductBox,
  resolveInventoryCode,
} from "../../providers";
import { UnitTicketModal } from "../../components/products/UnitTicketModal";
import { BulkUnitTicketModal } from "../../components/products/BulkUnitTicketModal";
import { ReconciliationModal } from "../../components/products/ReconciliationModal";

export default function BoxMaintenance({ setPageTitle }) {
  const [authUser] = useGlobal("authUser");
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [destinationId, setDestinationId] = useState(null);
  const [printAfterMove, setPrintAfterMove] = useState(true);
  const [loading, setLoading] = useState(false);
  const [ticketVisible, setTicketVisible] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [reconciliationVisible, setReconciliationVisible] = useState(false);
  const [bulkTicketVisible, setBulkTicketVisible] = useState(false);

  const role = get(authUser, "user.role");
  const canReconcile = ["superuser", "manager"].includes(role);
  const product = result?.product;
  const productBox = result?.productBox;
  const barcode = get(result, "productBarcode.barcode", result?.code);

  useEffect(() => {
    setPageTitle("Mantenimiento de cajas");
    getWarehouses()
      .then((response) =>
        setWarehouses(response.filter((warehouse) => warehouse.type !== "AjusteInventario"))
      )
      .catch(() => notification.error({ message: "No se pudieron cargar las ubicaciones" }));
  }, []);

  const search = async (value = code) => {
    const normalized = String(value || "").trim();
    if (!normalized) return;
    try {
      setLoading(true);
      const response = await resolveInventoryCode(normalized);
      setResult(response);
      setCode(normalized);
      setDestinationId(null);
    } catch (error) {
      setResult(null);
      notification.error({
        message: "Código no encontrado",
        description: error.userMessage || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const destination = warehouses.find((warehouse) => warehouse.id === destinationId);

  const moveBox = () => {
    if (!productBox || !destination) return;
    const explodes = destination.type === "Tienda";
    Modal.confirm({
      title: explodes ? "Mover y explotar caja" : "Mover caja",
      content: explodes
        ? `La caja se romperá al ingresar a ${destination.name}; después no podrá volver a moverse.`
        : `La caja se moverá a ${destination.name}.`,
      okText: explodes ? "Mover y explotar" : "Mover",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setLoading(true);
          const response = await putProductBox(productBox.id, {
            message: "MOVEMENT",
            warehouseId: destination.id,
          });
          notification.success({ message: explodes ? "Caja explotada correctamente" : "Caja movida correctamente" });
          if (response.wasExploded && printAfterMove) {
            setTicketQuantity(response.explodedLot?.stock || productBox.stock || 1);
            setTicketVisible(true);
          }
          await search(productBox.trackingCode);
        } catch (error) {
          notification.error({
            message: "No se pudo mover la caja",
            description: error.userMessage || error.message,
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const movementColumns = [
    { title: "Fecha", dataIndex: "createdAt", render: (value) => new Date(value).toLocaleString("es-PE") },
    { title: "Tipo", dataIndex: "type" },
    { title: "Cantidad", dataIndex: "quantity" },
    { title: "Descripción", dataIndex: "description" },
  ];

  const storeStockColumns = [
    { title: "Tienda", dataIndex: "warehouseName" },
    { title: "Stock unitario", dataIndex: "stock" },
  ];

  const physicalBoxActive =
    result?.type === "BOX" &&
    productBox?.inventoryKind === "PHYSICAL" &&
    productBox?.lifecycleStatus === "ACTIVE";

  const currentStoreStock = useMemo(
    () => (result?.stockByStore || []).reduce((sum, row) => sum + row.stock, 0),
    [result]
  );

  return (
    <Page>
      <PageActions>
        <Button type="primary" onClick={() => setBulkTicketVisible(true)}>
          Imprimir tickets de varias cajas
        </Button>
      </PageActions>
      <SearchBar>
        <Input.Search
          value={code}
          loading={loading}
          placeholder="Escanee código de caja 1... o producto 2..."
          enterButton="Buscar"
          onChange={(event) => {
            const value = event.target.value;
            setCode(value);
            if (/^\d{16}$/.test(value)) search(value);
          }}
          onSearch={search}
        />
      </SearchBar>

      {!result && <Empty description="Escanee o ingrese un código para comenzar" />}

      {result?.type === "BOX" && (
        <>
          <Section>
            <Header>
              <h3>Caja {productBox.trackingCode}</h3>
              <Tag color={physicalBoxActive ? "green" : "red"}>
                {physicalBoxActive ? "Caja física activa" : "Caja explotada / bloqueada"}
              </Tag>
            </Header>
            <InfoGrid>
              <Info><span>Producto</span><strong>{product?.code}</strong></Info>
              <Info><span>Nombre</span><strong>{product?.tradename || "-"}</strong></Info>
              <Info><span>Ubicación</span><strong>{get(productBox, "warehouse.name", "-")}</strong></Info>
              <Info><span>Stock físico</span><strong>{productBox.stock}</strong></Info>
              <Info><span>Unidades/caja</span><strong>{productBox.boxSize}</strong></Info>
              <Info><span>Código unitario</span><strong>{barcode}</strong></Info>
              {productBox.explodedAt && (
                <Info><span>Explotada el</span><strong>{new Date(productBox.explodedAt).toLocaleString("es-PE")}</strong></Info>
              )}
              {productBox.explodedByUser && (
                <Info>
                  <span>Explotada por</span>
                  <strong>{`${productBox.explodedByUser.name || ""} ${productBox.explodedByUser.lastname || ""}`.trim()}</strong>
                </Info>
              )}
            </InfoGrid>
            {!physicalBoxActive && (
              <Alert
                type="warning"
                showIcon
                message="Esta caja fue rota/desechada y no puede volver a moverse."
              />
            )}
          </Section>

          {physicalBoxActive && (
            <Section>
              <h3>Movimiento</h3>
              <ActionGrid>
                <Select
                  label="Destino"
                  value={destinationId}
                  onChange={setDestinationId}
                  options={warehouses
                    .filter((warehouse) => warehouse.id !== productBox.warehouseId)
                    .map((warehouse) => ({
                      value: warehouse.id,
                      label: `${warehouse.name} (${warehouse.type})`,
                    }))}
                />
                <Checkbox checked={printAfterMove} onChange={(event) => setPrintAfterMove(event.target.checked)}>
                  Imprimir tickets si el destino es Tienda
                </Checkbox>
                <Button type="primary" disabled={!destinationId} loading={loading} onClick={moveBox}>
                  Mover caja
                </Button>
              </ActionGrid>
            </Section>
          )}

          <Section>
            <Button
              type="primary"
              onClick={() => {
                setTicketQuantity(get(productBox, "explodedLots.0.stock", productBox.boxSize || 1));
                setTicketVisible(true);
              }}
            >
              Imprimir tickets
            </Button>
          </Section>
        </>
      )}

      {result?.type === "PRODUCT" && (
        <>
          <Section>
            <Header>
              <h3>Producto {product?.code}</h3>
              <Tag color="blue">Código {barcode}</Tag>
            </Header>
            <InfoGrid>
              <Info><span>Nombre comercial</span><strong>{product?.tradename || "-"}</strong></Info>
              <Info><span>Modelo</span><strong>{product?.modelName || "-"}</strong></Info>
              <Info><span>Stock unitario en tiendas</span><strong>{currentStoreStock}</strong></Info>
            </InfoGrid>
            <Table
              rowKey="warehouseId"
              columns={storeStockColumns}
              dataSource={result.stockByStore || []}
              pagination={false}
            />
            <Actions>
              <Button type="primary" onClick={() => { setTicketQuantity(1); setTicketVisible(true); }}>
                Imprimir tickets
              </Button>
              {canReconcile && (
                <Button type="primary" onClick={() => setReconciliationVisible(true)}>
                  Reconciliar
                </Button>
              )}
            </Actions>
          </Section>
        </>
      )}

      {result && (
        <Section>
          <h3>Historial cuantitativo</h3>
          <Table
            rowKey="id"
            columns={movementColumns}
            dataSource={result.inventoryMovements || []}
            pagination={{ pageSize: 20 }}
            scroll={{ x: 700 }}
          />
        </Section>
      )}

      <UnitTicketModal
        visible={ticketVisible}
        onClose={() => setTicketVisible(false)}
        product={product}
        barcode={barcode}
        initialQuantity={ticketQuantity}
        productBoxId={productBox?.id}
        warehouseId={productBox?.warehouseId}
        originBoxCode={result?.type === "BOX" ? productBox?.trackingCode : null}
      />
      <ReconciliationModal
        visible={reconciliationVisible}
        onClose={() => setReconciliationVisible(false)}
        product={product}
        onCompleted={() => search(barcode)}
      />
      <BulkUnitTicketModal
        visible={bulkTicketVisible}
        onClose={() => setBulkTicketVisible(false)}
      />
    </Page>
  );
}

const Page = styled.div`
  display: grid;
  gap: 1rem;
  overflow: auto;
  padding: 1rem;
  width: 100%;
`;
const SearchBar = styled.div`max-width: 900px; width: 100%;`;
const PageActions = styled.div`display:flex; flex-wrap:wrap; gap:1rem;`;
const Section = styled.section`border: 1px solid #d9d9d9; display: grid; gap: 1rem; padding: 1rem;`;
const Header = styled.div`align-items: center; display: flex; gap: 1rem; justify-content: space-between;`;
const InfoGrid = styled.div`display: grid; gap: 0.75rem; grid-template-columns: repeat(3, minmax(0, 1fr)); @media(max-width:768px){grid-template-columns:1fr;}`;
const Info = styled.div`border: 1px solid #eee; display: grid; gap: 0.25rem; padding: 0.65rem; span{color:#667085;font-size:0.8rem;} strong{overflow-wrap:anywhere;}`;
const ActionGrid = styled.div`align-items:center; display:grid; gap:1rem; grid-template-columns:2fr 1fr auto; @media(max-width:768px){grid-template-columns:1fr;}`;
const Actions = styled.div`display:flex; flex-wrap:wrap; gap:1rem;`;
