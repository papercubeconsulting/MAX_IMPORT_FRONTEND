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
              <TicketTitle>Ticket de unidad</TicketTitle>
              <TicketLine>
                <span>Código inventario</span>
                <strong>{get(product, "code", "-")}</strong>
              </TicketLine>
              <TicketLine>
                <span>Familia</span>
                <strong>{get(product, "familyName", "-")}</strong>
              </TicketLine>
              <TicketLine>
                <span>Sub-Familia</span>
                <strong>{get(product, "subfamilyName", "-")}</strong>
              </TicketLine>
              <TicketLine>
                <span>Elemento</span>
                <strong>{get(product, "elementName", "-")}</strong>
              </TicketLine>
              <TicketLine>
                <span>Modelo</span>
                <strong>{get(product, "modelName", "-")}</strong>
              </TicketLine>
              <TicketLine>
                <span>Nombre comercial</span>
                <strong>{get(product, "tradename", "-")}</strong>
              </TicketLine>
              {originBoxCode && (
                <TicketLine>
                  <span>Caja origen</span>
                  <strong>{originBoxCode}</strong>
                </TicketLine>
              )}
              <BarcodeWrap>
                <Barcode
                  value={barcode}
                  format="CODE128"
                  height={62}
                  width={2}
                  fontSize={16}
                  margin={0}
                />
              </BarcodeWrap>
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
  max-width: 430px;
`;
const Ticket = styled.div`
  border: 1px solid #111827;
  min-height: 280px;
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
  margin-bottom: 0.3rem;
  span { color: #4b5563; }
  strong { overflow-wrap: anywhere; }
`;
const BarcodeWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 0.75rem;
  overflow: hidden;
`;
