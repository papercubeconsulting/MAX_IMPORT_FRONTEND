import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Input,
  InputNumber,
  Modal,
  Table,
  Tabs,
  Tag,
  notification,
} from "antd";
import {
  createInventoryReconciliation,
  getReconciliationBoxes,
  getWarehouses,
  previewInventoryReconciliation,
} from "../../providers";
import { Select } from "../Select";

const modes = {
  GLOBAL_COUNT: "GLOBAL_COUNT",
  BOX_STOCK: "BOX_STOCK",
};

export const ReconciliationModal = ({
  visible,
  onClose,
  product,
  onCompleted,
}) => {
  const [mode, setMode] = useState(modes.GLOBAL_COUNT);
  const [stores, setStores] = useState([]);
  const [warehouseId, setWarehouseId] = useState(null);
  const [countedStock, setCountedStock] = useState(0);
  const [preview, setPreview] = useState(null);
  const [selectedSources, setSelectedSources] = useState({});
  const [boxSearch, setBoxSearch] = useState("");
  const [boxPage, setBoxPage] = useState(1);
  const [boxData, setBoxData] = useState({
    rows: [],
    count: 0,
    page: 1,
    pageSize: 20,
    systemStock: 0,
  });
  const [boxChanges, setBoxChanges] = useState({});
  const [loading, setLoading] = useState(false);
  const [boxesLoading, setBoxesLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    getWarehouses("Tienda")
      .then((response) => {
        setStores(response);
        if (response.length === 1) setWarehouseId(response[0].id);
      })
      .catch((error) =>
        notification.error({
          message: "No se pudieron cargar las tiendas",
          description: error.userMessage || error.message,
        })
      );
    setMode(modes.GLOBAL_COUNT);
    setPreview(null);
    setSelectedSources({});
    setCountedStock(0);
    setBoxSearch("");
    setBoxPage(1);
    setBoxChanges({});
  }, [visible]);

  useEffect(() => {
    if (!visible || mode !== modes.BOX_STOCK || !product?.id) return undefined;
    const timer = setTimeout(async () => {
      try {
        setBoxesLoading(true);
        const response = await getReconciliationBoxes({
          productId: product.id,
          search: boxSearch,
          page: boxPage,
          pageSize: 20,
        });
        setBoxData(response);
      } catch (error) {
        notification.error({
          message: "No se pudieron cargar las cajas disponibles",
          description: error.userMessage || error.message,
        });
      } finally {
        setBoxesLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [visible, mode, product?.id, boxSearch, boxPage]);

  const selectedTotal = useMemo(
    () =>
      Object.values(selectedSources).reduce(
        (sum, value) => sum + (Number(value) || 0),
        0
      ),
    [selectedSources]
  );

  const changedBoxes = useMemo(
    () => Object.values(boxChanges),
    [boxChanges]
  );
  const boxReduction = useMemo(
    () =>
      changedBoxes.reduce(
        (sum, item) => sum + item.stock - item.targetStock,
        0
      ),
    [changedBoxes]
  );

  const calculate = async () => {
    if (!product?.id || !warehouseId) {
      notification.warning({ message: "Seleccione una tienda" });
      return;
    }
    try {
      setLoading(true);
      const response = await previewInventoryReconciliation({
        productId: product.id,
        warehouseId,
        countedStock,
      });
      setPreview(response);
      setSelectedSources({});
    } catch (error) {
      notification.error({
        message: "No se pudo calcular la reconciliación",
        description: error.userMessage || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const completeRequest = () => {
    notification.success({ message: "Solicitud de reconciliación registrada" });
    onCompleted && onCompleted();
    onClose();
  };

  const confirmGlobal = async () => {
    if (!preview) return calculate();
    const expected = Math.abs(Math.min(0, preview.delta));
    if (preview.delta < 0 && selectedTotal !== expected) {
      notification.warning({
        message: "Selección incompleta",
        description: `Debe seleccionar exactamente ${expected} unidades. Seleccionó ${selectedTotal}.`,
      });
      return;
    }
    try {
      setLoading(true);
      await createInventoryReconciliation({
        mode: modes.GLOBAL_COUNT,
        productId: product.id,
        warehouseId,
        countedStock,
        systemStock: preview.systemStock,
        sources: Object.entries(selectedSources)
          .filter(([, quantity]) => Number(quantity) > 0)
          .map(([productBoxId, quantity]) => ({
            productBoxId: Number(productBoxId),
            quantity: Number(quantity),
          })),
      });
      completeRequest();
    } catch (error) {
      notification.error({
        message: "No se pudo solicitar la reconciliación",
        description: error.userMessage || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmBoxes = async () => {
    if (!changedBoxes.length) {
      notification.warning({
        message: "Modifique al menos una caja",
        description: "La nueva cantidad debe ser menor que el stock actual.",
      });
      return;
    }
    try {
      setLoading(true);
      await createInventoryReconciliation({
        mode: modes.BOX_STOCK,
        productId: product.id,
        boxes: changedBoxes.map((item) => ({
          productBoxId: item.productBoxId,
          targetStock: item.targetStock,
        })),
      });
      completeRequest();
    } catch (error) {
      notification.error({
        message: "No se pudo solicitar el ajuste por cajas",
        description: error.userMessage || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const globalColumns = [
    {
      title: "Tipo",
      dataIndex: "inventoryKind",
      render: (value) => (value === "EXPLODED" ? "Unitario" : "Caja"),
    },
    {
      title: "Código caja",
      dataIndex: "trackingCode",
      render: (value) => value || "Lote lógico",
    },
    { title: "Ubicación", dataIndex: "warehouseName" },
    { title: "Disponible", dataIndex: "stock" },
    {
      title: "A AjusteInventario",
      dataIndex: "productBoxId",
      render: (id, source) => (
        <InputNumber
          min={0}
          max={source.stock}
          precision={0}
          value={selectedSources[id] || 0}
          onChange={(value) =>
            setSelectedSources((current) => ({
              ...current,
              [id]: Number(value) || 0,
            }))
          }
        />
      ),
    },
  ];

  const boxColumns = [
    { title: "Código de caja", dataIndex: "trackingCode", width: 190 },
    { title: "Almacén", dataIndex: "warehouseName" },
    { title: "Unidades/caja", dataIndex: "boxSize", align: "center" },
    { title: "Stock actual", dataIndex: "stock", align: "center" },
    {
      title: "Nuevo stock",
      dataIndex: "productBoxId",
      align: "center",
      render: (id, source) => (
        <InputNumber
          min={0}
          max={source.stock}
          precision={0}
          value={boxChanges[id]?.targetStock ?? source.stock}
          onChange={(value) => {
            const targetStock = Number(value);
            setBoxChanges((current) => {
              const next = { ...current };
              if (targetStock === source.stock || value === null) delete next[id];
              else next[id] = { ...source, targetStock };
              return next;
            });
          }}
        />
      ),
    },
    {
      title: "Retirar",
      dataIndex: "productBoxId",
      align: "center",
      render: (id, source) => {
        const targetStock = boxChanges[id]?.targetStock ?? source.stock;
        const reduction = source.stock - targetStock;
        return <Tag color={reduction > 0 ? "orange" : "default"}>{reduction}</Tag>;
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      width="1050px"
      title={`Reconciliar inventario: ${product?.code || "-"}`}
      okText={
        mode === modes.BOX_STOCK
          ? "Solicitar aprobación"
          : preview
          ? "Solicitar aprobación"
          : "Calcular"
      }
      okButtonProps={{
        disabled: mode === modes.BOX_STOCK && !changedBoxes.length,
      }}
      confirmLoading={loading}
      onOk={mode === modes.BOX_STOCK ? confirmBoxes : confirmGlobal}
      onCancel={onClose}
    >
      <Tabs
        activeKey={mode}
        onChange={(value) => {
          setMode(value);
          setPreview(null);
        }}
      >
        <Tabs.TabPane tab="Conteo global" key={modes.GLOBAL_COUNT}>
          <div style={{ display: "grid", gap: "1rem" }}>
            <Select
              label="Tienda de referencia"
              value={warehouseId}
              onChange={setWarehouseId}
              options={stores.map((store) => ({
                value: store.id,
                label: store.name,
              }))}
            />
            <label>
              Conteo físico global (sin Averiado ni AjusteInventario):{" "}
              <InputNumber
                min={0}
                precision={0}
                value={countedStock}
                onChange={(value) => setCountedStock(Number(value) || 0)}
              />
            </label>
            {preview && (
              <Alert
                type={
                  preview.delta > 0
                    ? "success"
                    : preview.delta < 0
                    ? "warning"
                    : "info"
                }
                showIcon
                message={`Sistema activo: ${preview.systemStock} | Conteo: ${preview.countedStock} | Diferencia: ${preview.delta}`}
                description={
                  preview.delta > 0
                    ? `Se agregarán ${preview.delta} unidades directas a la tienda como Ajuste Inventario.`
                    : preview.delta < 0
                    ? `Seleccione ${Math.abs(
                        preview.delta
                      )} unidades para trasladarlas a AjusteInventario. Seleccionadas: ${selectedTotal}.`
                    : "No se requiere modificar inventario."
                }
              />
            )}
            {preview?.delta < 0 && (
              <Table
                rowKey="productBoxId"
                columns={globalColumns}
                dataSource={preview.sources}
                pagination={false}
                scroll={{ x: 700, y: 360 }}
              />
            )}
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Por cajas" key={modes.BOX_STOCK}>
          <div style={{ display: "grid", gap: "1rem" }}>
            <Alert
              type="info"
              showIcon
              message="Solo se muestran cajas físicas activas ubicadas en Almacén."
              description="Ingrese el stock físico que debe quedar en cada caja. La solicitud no modificará el inventario hasta que sea aprobada."
            />
            <Input.Search
              allowClear
              value={boxSearch}
              placeholder="Buscar por código de caja"
              onChange={(event) => {
                setBoxSearch(event.target.value);
                setBoxPage(1);
              }}
            />
            <Table
              rowKey="productBoxId"
              loading={boxesLoading}
              columns={boxColumns}
              dataSource={boxData.rows || []}
              scroll={{ x: 850, y: 360 }}
              pagination={{
                current: boxData.page || boxPage,
                total: boxData.count || 0,
                pageSize: boxData.pageSize || 20,
                showSizeChanger: false,
                position: ["bottomCenter"],
                onChange: setBoxPage,
              }}
            />
            <Alert
              type={changedBoxes.length ? "warning" : "info"}
              showIcon
              message={`${changedBoxes.length} caja(s) modificada(s) | ${boxReduction} unidad(es) a retirar`}
              description={
                changedBoxes.length
                  ? `Stock activo de referencia: ${boxData.systemStock}. Después de aprobar: ${
                      boxData.systemStock - boxReduction
                    }.`
                  : "Reduzca el valor de Nuevo stock para incluir una caja en la solicitud."
              }
            />
          </div>
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};
