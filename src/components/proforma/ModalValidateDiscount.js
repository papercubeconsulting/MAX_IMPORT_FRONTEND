import { Modal, Result, Alert, Tag, Button, Divider } from "antd";
import React from "react";
import QRCode from "react-qr-code";
import styled from "styled-components";
import { useRouter } from "next/router";

export const ModalValidateDiscount = (props) => {
  // console.log('ModalValidateDiscount',props.qr);
  const qr =
    typeof window !== "undefined" &&
    `${window.location.host.includes("localhost") ? "http" : "https"}://${
      window.location.host
    }/proformas/validate/${props.qr}`;

  const router = useRouter();
  return (
    <Modal
      style={{ top: 10 }}
      open={props.isModalOpen}
      // width="30%"
      onOk={props.onOk}
      bodyStyle={{padding:0}}
      onCancel={props.onCancel}
    >
      <ModalWrapperContent>
        <Result
          status="warning"
          title="Validación de descuento de proforma"
          subTitle="El descuento ingresado en esta proforma requiere la validación de un supervisor."
          extra={
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Alert
                message="Escanear el siguiente código QR para redirigirse a la validación"
                type="primary"
              />
              <QRCode size={206} value={props.qr || ""} />
              <Tag>{qr}</Tag>
              <Divider>O visita la pagina</Divider>
              <Button type="primary" onClick={() => router.push(qr)}>
                Ir
              </Button>
            </div>
          }
        />
      </ModalWrapperContent>
    </Modal>
  );
};
const ModalWrapperContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.div`
  font-size: 1rem;
`;
