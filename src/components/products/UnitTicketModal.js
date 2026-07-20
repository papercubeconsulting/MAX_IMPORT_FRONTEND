import React, { useEffect, useState } from "react";
import Barcode from "react-barcode";
import { InputNumber, Modal, Tag, notification } from "antd";
import { get } from "lodash";
import styled from "styled-components";
import { createUnitTicketPrint } from "../../providers";

export const generateUnitTicketPdf = async ({
  product,
  barcode,
  quantity,
  productBoxId,
  warehouseId,
  originBoxCode,
}) => {
  const response = await createUnitTicketPrint({
    productId: product.id,
    quantity: Number(quantity),
    productBoxId,
    warehouseId,
  });
  const currentProduct = response.product || product;
  const currentBarcode = get(response, "productBarcode.barcode", barcode);
  const currentOriginBoxCode =
    get(response, "originProductBox.trackingCode") || originBoxCode || "";
  const query = new URLSearchParams({
    printId: get(response, "print.id", ""),
    quantity: String(quantity),
    barcode: currentBarcode,
    productCode: get(currentProduct, "code", ""),
    familyName: get(currentProduct, "familyName", ""),
    subfamilyName: get(currentProduct, "subfamilyName", ""),
    elementName: get(currentProduct, "elementName", ""),
    modelName: get(currentProduct, "modelName", ""),
    tradename: get(currentProduct, "tradename", ""),
    providerName: get(currentProduct, "provider.name", ""),
    originBoxCode: currentOriginBoxCode,
  }).toString();
  const link = document.createElement("a");
  link.href = `/products/${currentProduct.id}/unit-tickets?${query}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
  return response;
};

export const UnitTicketModal = ({
  visible,
  onClose,
  product,
  barcode,
  initialQuantity = 1,
  productBoxId,
  warehouseId,
  originBoxCode,
}) => {
  const [quantity, setQuantity] = useState(initialQuantity || 1);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (visible) setQuantity(Math.max(1, initialQuantity || 1));
  }, [visible, initialQuantity]);

  const print = async () => {
    if (!product?.id || !barcode || !quantity) return;
    try {
      setPrinting(true);
      await generateUnitTicketPdf({
        product,
        barcode,
        quantity,
        productBoxId,
        warehouseId,
        originBoxCode,
      });
      notification.success({ message: "PDF de tickets generado" });
      onClose();
    } catch (error) {
      notification.error({
        message: "No se pudo registrar la impresión",
        description: error.userMessage || error.message,
      });
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Modal
        visible={visible}
        width="900px"
        title="Tickets unitarios"
        okText="Generar PDF"
        confirmLoading={printing}
        onOk={print}
        onCancel={onClose}
      >
        <Toolbar>
          <label>
            Cantidad:{" "}
            <InputNumber
              min={1}
              max={10000}
              value={quantity}
              onChange={(value) => setQuantity(value || 1)}
            />
          </label>
          <Tag color="blue">{Number(quantity) || 0} ticket(s)</Tag>
          <span>
            Código compartido: <strong>{barcode || "-"}</strong>
          </span>
        </Toolbar>
        <PrintArea>
            <Ticket>
              <TicketTop>
                <TicketLine className="primary">
                  <span>Código Max</span>
                  <strong>{get(product, "code", "-")}</strong>
                </TicketLine>
                <TicketLine>
                  <span>Caja</span>
                  <strong>{originBoxCode || "-"}</strong>
                </TicketLine>
              </TicketTop>
              <TicketLine className="model">
                <span>Modelo</span>
                <strong>{get(product, "modelName", "-")}</strong>
              </TicketLine>
              <TicketBarcodeWrap>
                <Barcode
                  value={barcode || "2123456789012345"}
                  format="CODE128"
                  height={64}
                  width={2}
                  fontSize={14}
                  margin={10}
                />
              </TicketBarcodeWrap>
              <TicketLine>
                <span>Código unitario</span>
                <strong>{barcode || "-"}</strong>
              </TicketLine>
              {/* Datos secundarios disponibles para referencia, fuera de la prioridad impresa. */}
              <SecondaryData>
                <span>Familia</span>
                <strong>{get(product, "familyName", "-")}</strong>
                <span>Nombre comercial</span>
                <strong>{get(product, "tradename", "-")}</strong>
              </SecondaryData>
            </Ticket>
        </PrintArea>
      </Modal>
  );
};

const Toolbar = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
`;
const PrintArea = styled.div`
  margin: 0 auto;
  max-width: 520px;
`;
const Ticket = styled.div`
  border: 1px solid #111827;
  min-height: 220px;
  padding: 0.75rem;
`;
const TicketTop = styled.div`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: 1fr 0.8fr;
`;
const TicketLine = styled.div`
  margin-bottom: 0.35rem;
  span {
    color: #4b5563;
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
  }
  strong { overflow-wrap: anywhere; }

  &.primary strong {
    font-size: 1.35rem;
  }

  &.model strong {
    font-size: 1.1rem;
  }
`;
const TicketBarcodeWrap = styled.div`
  display: flex;
  justify-content: center;
  margin: 0.75rem 0 0.35rem;
  overflow: hidden;
`;
const SecondaryData = styled.div`
  border-top: 1px solid #e5e7eb;
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 0.5fr 1fr;
  margin-top: 0.75rem;
  padding-top: 0.5rem;

  span {
    color: #6b7280;
    font-size: 0.75rem;
  }

  strong {
    min-width: 0;
    overflow-wrap: anywhere;
  }
`;
