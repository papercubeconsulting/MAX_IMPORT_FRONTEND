import React, { useEffect, useMemo, useState } from "react";
import { Alert, InputNumber, Modal, Table, notification } from "antd";
import {
  createInventoryReconciliation,
  getWarehouses,
  previewInventoryReconciliation,
} from "../../providers";
import { Select } from "../Select";

export const ReconciliationModal = ({ visible, onClose, product, onCompleted }) => {
  const [stores, setStores] = useState([]);
  const [warehouseId, setWarehouseId] = useState(null);
  const [countedStock, setCountedStock] = useState(0);
  const [preview, setPreview] = useState(null);
  const [selectedSources, setSelectedSources] = useState({});
  const [loading, setLoading] = useState(false);

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
    setPreview(null);
    setSelectedSources({});
    setCountedStock(0);
  }, [visible]);

  const selectedTotal = useMemo(
    () => Object.values(selectedSources).reduce((sum, value) => sum + (Number(value) || 0), 0),
    [selectedSources]
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

  const confirm = async () => {
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
      notification.success({ message: "Inventario reconciliado correctamente" });
      onCompleted && onCompleted();
      onClose();
    } catch (error) {
      notification.error({
        message: "No se pudo reconciliar el inventario",
        description: error.userMessage || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Tipo", dataIndex: "inventoryKind", render: (value) => value === "EXPLODED" ? "Unitario" : "Caja" },
    { title: "Código caja", dataIndex: "trackingCode", render: (value) => value || "Lote lógico" },
    { title: "Ubicación", dataIndex: "warehouseName" },
    { title: "Disponible", dataIndex: "stock" },
    {
      title: "A AjusteInventario",
      dataIndex: "productBoxId",
      render: (id, source) => (
        <InputNumber
          min={0}
          max={source.stock}
          value={selectedSources[id] || 0}
          onChange={(value) =>
            setSelectedSources((current) => ({ ...current, [id]: Number(value) || 0 }))
          }
        />
      ),
    },
  ];

  return (
    <Modal
      visible={visible}
      width="900px"
      title={`Reconciliar inventario: ${product?.code || "-"}`}
      okText={preview ? "Confirmar reconciliación" : "Calcular"}
      confirmLoading={loading}
      onOk={confirm}
      onCancel={onClose}
    >
      <div style={{ display: "grid", gap: "1rem" }}>
        <Select
          label="Tienda de referencia"
          value={warehouseId}
          onChange={setWarehouseId}
          options={stores.map((store) => ({ value: store.id, label: store.name }))}
        />
        <label>
          Conteo físico global (sin Averiado ni AjusteInventario):{" "}
          <InputNumber min={0} value={countedStock} onChange={(value) => setCountedStock(Number(value) || 0)} />
        </label>
        {preview && (
          <Alert
            type={preview.delta > 0 ? "success" : preview.delta < 0 ? "warning" : "info"}
            showIcon
            message={`Sistema activo: ${preview.systemStock} | Conteo: ${preview.countedStock} | Diferencia: ${preview.delta}`}
            description={
              preview.delta > 0
                ? `Se agregarán ${preview.delta} unidades directas a la tienda como Ajuste Inventario.`
                : preview.delta < 0
                ? `Seleccione ${Math.abs(preview.delta)} unidades para trasladarlas a AjusteInventario. Seleccionadas: ${selectedTotal}.`
                : "No se requiere modificar inventario."
            }
          />
        )}
        {preview?.delta < 0 && (
          <Table
            rowKey="productBoxId"
            columns={columns}
            dataSource={preview.sources}
            pagination={false}
            scroll={{ x: 700, y: 360 }}
          />
        )}
      </div>
    </Modal>
  );
};
