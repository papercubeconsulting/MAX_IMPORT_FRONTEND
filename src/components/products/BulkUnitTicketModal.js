import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Input, Modal, Table, Tag, notification } from "antd";
import { DeleteOutlined, ScanOutlined } from "@ant-design/icons";
import { saveAs } from "file-saver";
import Quagga from "quagga";
import styled from "styled-components";
import { Button } from "../Button";
import {
  createExplodedBoxTicketBatch,
  resolveInventoryCode,
} from "../../providers";
import { createMixedUnitTicketPdfBlob } from "../../util/mixedUnitTicketPdf";

const validateResolvedBox = (result) => {
  if (result?.type !== "BOX") return "El código no corresponde a una caja.";
  const box = result.productBox;
  if (box?.inventoryKind !== "PHYSICAL" || box?.lifecycleStatus !== "DISCARDED")
    return "La caja todavía no ha sido explotada.";
  if (!Number.isInteger(box?.boxSize) || box.boxSize <= 0)
    return "La caja no tiene una cantidad original válida.";
  const storeLots = (box.explodedLots || []).filter(
    (lot) =>
      lot.inventoryKind === "EXPLODED" &&
      lot.lifecycleStatus === "ACTIVE" &&
      lot.warehouse?.type === "Tienda",
  );
  if (!storeLots.length)
    return "No se encontró el lote unitario originado por esta caja.";
  return null;
};

export const BulkUnitTicketModal = ({ visible, onClose }) => {
  const cameraRef = useRef(null);
  const cameraActiveRef = useRef(false);
  const detectedHandlerRef = useRef(null);
  const pendingCodesRef = useRef(new Set());
  const [code, setCode] = useState("");
  const [rows, setRows] = useState([]);
  const [resolving, setResolving] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const stopCamera = () => {
    cameraActiveRef.current = false;
    try {
      if (detectedHandlerRef.current)
        Quagga.offDetected(detectedHandlerRef.current);
      Quagga.stop();
    } catch (error) {
      // Quagga throws when no camera stream was initialized.
    }
    detectedHandlerRef.current = null;
    setCameraActive(false);
  };

  useEffect(() => {
    if (!visible) {
      stopCamera();
      setCode("");
      setRows([]);
    }
    return () => stopCamera();
  }, [visible]);

  const addCode = async (rawCode) => {
    const trackingCode = String(rawCode || "").trim();
    if (!trackingCode || pendingCodesRef.current.has(trackingCode)) return;
    if (rows.some((row) => row.trackingCode === trackingCode)) {
      notification.info({ message: "La caja ya fue agregada" });
      setCode("");
      return;
    }

    pendingCodesRef.current.add(trackingCode);
    setResolving(true);
    try {
      const result = await resolveInventoryCode(trackingCode);
      const reason = validateResolvedBox(result);
      setRows((current) => [
        ...current,
        {
          key: trackingCode,
          trackingCode,
          boxSize: result.productBox?.boxSize || 0,
          productCode: result.product?.code || "-",
          modelName: result.product?.modelName || "-",
          valid: !reason,
          reason,
        },
      ]);
    } catch (error) {
      setRows((current) => [
        ...current,
        {
          key: trackingCode,
          trackingCode,
          boxSize: 0,
          productCode: "-",
          modelName: "-",
          valid: false,
          reason: error.userMessage || "Código de caja no encontrado.",
        },
      ]);
    } finally {
      pendingCodesRef.current.delete(trackingCode);
      setCode("");
      setResolving(pendingCodesRef.current.size > 0);
    }
  };

  const startCamera = () => {
    if (cameraActive) {
      stopCamera();
      return;
    }
    cameraActiveRef.current = true;
    setCameraActive(true);
    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: cameraRef.current,
          constraints: { facingMode: "environment" },
        },
        decoder: { readers: ["code_128_reader"] },
        locate: true,
      },
      (error) => {
        if (error) {
          cameraActiveRef.current = false;
          setCameraActive(false);
          notification.error({
            message: "No se pudo iniciar la cámara",
            description: error.message,
          });
          return;
        }
        Quagga.start();
      },
    );
    const detectedHandler = (data) => {
      const scannedCode = data?.codeResult?.code;
      if (!scannedCode) return;
      Quagga.pause();
      addCode(scannedCode).finally(() => {
        if (cameraActiveRef.current) Quagga.start();
      });
    };
    detectedHandlerRef.current = detectedHandler;
    Quagga.onDetected(detectedHandler);
  };

  const invalidRows = rows.filter((row) => !row.valid);
  const totalTickets = useMemo(
    () => rows.reduce((sum, row) => sum + (row.valid ? row.boxSize : 0), 0),
    [rows],
  );

  const print = async () => {
    if (!rows.length || invalidRows.length) return;
    try {
      setPrinting(true);
      const response = await createExplodedBoxTicketBatch(
        rows.map((row) => row.trackingCode),
      );
      const pdf = createMixedUnitTicketPdfBlob(response.boxes);
      saveAs(pdf, `tickets-unitarios-${response.batchId}.pdf`);
      notification.success({
        message: "PDF de tickets generado",
        description: `${response.totalTickets} tickets de ${response.totalBoxes} cajas.`,
      });
      onClose();
    } catch (error) {
      const invalidBoxes = error.data?.invalidBoxes || [];
      if (invalidBoxes.length) {
        const reasons = new Map(
          invalidBoxes.map((box) => [box.trackingCode, box.reason]),
        );
        setRows((current) =>
          current.map((row) =>
            reasons.has(row.trackingCode)
              ? {
                  ...row,
                  valid: false,
                  reason: reasons.get(row.trackingCode),
                }
              : row,
          ),
        );
      }
      notification.error({
        message: "No se pudo generar la impresión masiva",
        description: error.userMessage || error.message,
      });
    } finally {
      setPrinting(false);
    }
  };

  const columns = [
    { title: "Caja", dataIndex: "trackingCode" },
    { title: "Producto", dataIndex: "productCode" },
    { title: "Modelo", dataIndex: "modelName" },
    { title: "Tickets", dataIndex: "boxSize", align: "right" },
    {
      title: "Estado",
      key: "status",
      render: (_, row) =>
        row.valid ? (
          <Tag color="green">Explotada</Tag>
        ) : (
          <Tag color="red">{row.reason}</Tag>
        ),
    },
    {
      key: "remove",
      width: 54,
      render: (_, row) => (
        <Button
          type="danger"
          padding="0 0.5rem"
          onClick={() =>
            setRows((current) =>
              current.filter((item) => item.trackingCode !== row.trackingCode),
            )
          }
        >
          <DeleteOutlined />
        </Button>
      ),
    },
  ];

  return (
    <Modal
      visible={visible}
      width="92%"
      title="Impresión masiva de tickets unitarios"
      okText={`Generar PDF (${totalTickets})`}
      cancelText="Cancelar"
      okButtonProps={{
        disabled: !rows.length || invalidRows.length > 0 || resolving,
      }}
      confirmLoading={printing}
      onOk={print}
      onCancel={onClose}
    >
      <Summary>
        <Tag color="blue">{rows.length} caja(s)</Tag>
        <Tag color="geekblue">{totalTickets} ticket(s)</Tag>
        <span>Se usará la cantidad original de cada caja.</span>
      </Summary>
      <ScannerRow>
        <Input.Search
          autoFocus
          value={code}
          loading={resolving}
          placeholder="Escanee o ingrese un código de caja 1..."
          enterButton="Agregar"
          onChange={(event) => {
            const value = event.target.value.trim();
            if (/^\d{16}$/.test(value)) {
              setCode("");
              addCode(value);
              return;
            }
            setCode(value);
          }}
          onSearch={addCode}
        />
        <Button onClick={startCamera}>
          <ScanOutlined /> {cameraActive ? "Detener cámara" : "Usar cámara"}
        </Button>
      </ScannerRow>
      {invalidRows.length > 0 && (
        <Alert
          showIcon
          type="error"
          message="Hay cajas que no pueden imprimirse"
          description="Retire las cajas marcadas en rojo y vuelva a escanearlas. La impresión completa está bloqueada."
        />
      )}
      {cameraActive && (
        <Camera>
          <div ref={cameraRef} className="viewport" />
        </Camera>
      )}
      <Table
        rowKey="trackingCode"
        columns={columns}
        dataSource={rows}
        pagination={false}
        scroll={{ x: 900, y: 360 }}
        locale={{ emptyText: "Escanee cajas explotadas para comenzar" }}
      />
    </Modal>
  );
};

const Summary = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ScannerRow = styled.div`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(0, 1fr) auto;
  margin-bottom: 1rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Camera = styled.div`
  margin: 1rem auto;
  max-width: 640px;
  overflow: hidden;
  video,
  canvas {
    max-width: 100%;
  }
`;
