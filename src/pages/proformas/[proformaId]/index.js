import React, { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Container, Grid, ModalProduct } from "../../../components";
import {
  getProforma,
  postProforma,
  resetExpireStatus,
  sendEmail,
} from "../../../providers";
import { get } from "lodash";
import { MailOutlined, MailFilled, DownloadOutlined } from "@ant-design/icons";
import { Input, Table, Modal, Alert, notification, Spin } from "antd";
import { ModalValidateDiscount } from "../../../components/proforma/ModalValidateDiscount";
import { getLocalHostWithPath } from "../../../util";
import { useSendEmailProforma } from "../../../util/hooks/useSendEmail";

export default ({ setPageTitle }) => {
  setPageTitle("Información de proforma");
  // States for handling modal validate discount approval
  const [isModalDiscountOpen, setIsModalDiscountOpen] = useState(false);
  //extraccion de params de url
  const router = useRouter();
  const { proformaId } = router.query;

  const columns = [
    {
      dataIndex: "id",
      title: "",
      width: "fit-content",
      align: "center",
      render: (id, record, index) => index + 1,
    },
    {
      title: "Cód. Inventario",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
      render: (product) => get(product, "code", null),
    },
    {
      title: "Familia",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
      render: (product) => get(product, "familyName", null),
    },
    {
      title: "Sub-Familia",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
      render: (product) => get(product, "subfamilyName", null),
    },
    {
      title: "Elemento",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
      render: (product) => get(product, "elementName", null),
    },
    {
      title: "Modelo",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
      render: (product) => get(product, "modelName", null),
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Precio",
      dataIndex: "unitPrice",
      width: "fit-content",
      align: "center",
      render: (unitPrice) => `S/ ${(unitPrice / 100).toFixed(2)}`,
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      width: "fit-content",
      align: "center",
      render: (subtotal) => `S/ ${(subtotal / 100).toFixed(2)}`,
    },
    {
      title: "Disponibilidad",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
      render: (product) => get(product, "availableStock", 0),
    },
    {
      dataIndex: "id",
      width: "fit-content",
      align: "center",
      render: (id, product) => (
        <>
          <Button
            padding="0 0.5rem"
            type="primary"
            onClick={() => {
              setIsVisible(true);
              setIdModal(product.productId);
            }}
          >
            VER
          </Button>
        </>
      ),
    },
  ];
  const [api, contextHolder] = notification.useNotification();
  const handleOnRenovar = async () => {
    try {
      // const postData = {
      //   clientId: get(proforma, "client.id"),
      //   efectivo: (Number(get(proforma, "efectivo")) / 100).toFixed(2), // remember: this will default the credit to the total final , credtit + efectivo
      //   // discount: Math.roundNumber(get(proforma, "discount")), // remember: this will default the credit to the total final , credtit + efectivo
      //   // discount: Math.round(
      //   // //   Number(get(proforma, "total")) *
      //   // //     Number(get(proforma, "discountPercentage"))
      //   // // ),
      //   discount: get(proforma, "discount"),
      //   proformaProducts: proforma.proformaProducts.map((proformaProduct) => ({
      //     productId: get(proformaProduct, "product.id", null),
      //     unitPrice: Math.round(get(proformaProduct, "unitPrice", 0)),
      //     //unitPrice: price,
      //     quantity: get(proformaProduct, "quantity", null),
      //   })),
      // };

      // const response = await postProforma(postData);

      const resonse = await resetExpireStatus(proformaId);

      router.push(`/proformas/${proformaId}`);
    } catch (error) {
      notification.error({
        message: error.message,
      });
    }
  };

  //costumizadas por JM
  const [proforma, setProforma] = useState(null);
  const [windowHeight, setWindowHeight] = useState(0);
  const {
    loading: loadingEmail,
    setLoading,
    handleSendEmail,
    bodyUrlPDF,
    handleDownloadEmail,
  } = useSendEmailProforma({
    proforma,
    proformaId,
  });

  //Modal
  const [isVisible, setIsVisible] = useState(false);
  const [idModal, setIdModal] = useState("");

  //para setear el tamaño de pantalla
  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  //para setear la info de la proforma
  useMemo(() => {
    const fetchProforma = async () => {
      try {
        const _proforma = await getProforma(proformaId);
        setProforma(_proforma);
      } catch (error) {
        console.error(error);
        router.back();
      }
    };
    proformaId && fetchProforma();
  }, [router]);

  const statusValidationModal = React.useMemo(() => {
    const discountTransactionId =
      proforma?.discountProforma?.id || proforma?.discountValidationId;
    if (
      discountTransactionId &&
      proforma.status === "PENDING_DISCOUNT_APPROVAL"
    ) {
      return {
        discountTransactionId,
        status: proforma.status,
      };
    }
    return {
      discountTransactionId: null,
      status: null,
    };
  }, [proforma?.discountProforma?.id, proforma?.status, isModalDiscountOpen]);

  const isProformaPendingDiscountValidation =
    proforma?.status === "PENDING_DISCOUNT_APPROVAL";

  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  return (
    <>
      <Modal
        visible={isEmailModalOpen}
        onOk={() => setIsEmailModalOpen(false)}
        onCancel={() => setIsEmailModalOpen(false)}
        title="Vista previa de proforma"
        style={{ minWidth: "1360px", overflowX: "auto" }}
        wrapClassName="test-antd"
        width={"90%"}
      >
        <iframe
          src={bodyUrlPDF}
          width="100%"
          title="Vista Previa Proforma"
          style={{ transform: "scale(0.8)" }}
          height="700px"
          frameBorder={0}
        />
      </Modal>
      <Modal
        visible={isVisible}
        width="90%"
        title="Información del producto"
        onCancel={() => setIsVisible(false)}
        footer={null}
      >
        <ModalProduct id={idModal}></ModalProduct>
      </Modal>
      <ModalValidateDiscount
        qr={statusValidationModal.discountTransactionId}
        isModalOpen={isModalDiscountOpen}
        onOk={() => setIsModalDiscountOpen((prev) => !prev)}
        onCancel={() => setIsModalDiscountOpen((prev) => !prev)}
      />

      <Container height="fit-content">
        <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="1rem">
          <Input value={proformaId} disabled addonBefore="Proforma" />
          <Input
            value={proforma?.statusDescription}
            disabled
            addonBefore="Estatus"
          />
          <Input
            value={proforma?.dispatchStatusDescription}
            disabled
            addonBefore="Despacho"
          />

          <Input
            value={proforma?.client ? proforma.client.idNumber : ""}
            disabled
            addonBefore="DNI/RUC"
          />

          <Input
            value={proforma?.client ? proforma.client.name : ""}
            disabled
            addonBefore="Cliente"
          />
          <Input
            value={proforma?.client ? proforma.client.lastname : ""}
            disabled
          />

          <Input
            value={proforma?.client ? proforma.client.email : ""}
            disabled
            addonBefore="Correo"
          />
          <Input
            value={proforma?.client ? proforma.client.phoneNumber : ""}
            disabled
            addonBefore="Teléfono"
          />

          <Input
            value={proforma?.client ? proforma.client.region : ""}
            disabled
            addonBefore="Departamento"
          />

          <Input
            value={proforma?.client ? proforma.client.province : ""}
            disabled
            addonBefore="Provincia"
          />

          <Input
            value={proforma?.client ? proforma.client.district : ""}
            disabled
            addonBefore="Distrito"
          />

          <Input
            value={proforma?.client ? proforma.client.address : ""}
            disabled
            addonBefore="Dirección"
          />
        </Grid>
      </Container>
      <Container padding="0px" width="100vw" height="35%">
        <Table
          rowKey={(record) => record.id}
          columns={columns}
          scroll={{ y: windowHeight * 0.3 - 48 }}
          bordered
          pagination={false}
          dataSource={
            proforma?.proformaProducts ? proforma.proformaProducts : []
          }
        />
      </Container>
      <Container height="fit-content" padding="2rem 1rem 1rem"></Container>
      <Container height="fit-content">
        <Grid gridTemplateColumns="45% 45%" gridGap="10%">
          <Grid gridTemplateColumns="2fr 5fr" gridGap="2rem">
            <br />
            <Input
              value={
                proforma?.efectivo
                  ? `S/ ${(proforma?.efectivo / 100).toFixed(2)}`
                  : proforma?.sale?.due
                  ? `S/ ${(proforma?.sale.due / 100).toFixed(2)}`
                  : `-`
              }
              disabled
              addonBefore="Efectivo"
            />
            <br />

            <Input
              value={
                proforma?.credit
                  ? `S/ ${(proforma?.credit / 100).toFixed(2)}`
                  : proforma?.sale?.credit
                  ? `S/ ${(proforma?.sale.credit / 100).toFixed(2)}`
                  : `-`
              }
              disabled
              addonBefore="Crédito"
            />
            <br />
            <Button
              type="primary"
              disabled={
                proforma?.status === "CLOSED" || proforma?.status === "EXPIRED"
              }
              onClick={async () => router.push(`/proforma?id=${proformaId}`)}
            >
              Editar
            </Button>
            {proforma?.status === "EXPIRED" && (
              <>
                <br />
                <Button type="primary" onClick={handleOnRenovar}>
                  Renovar
                </Button>
              </>
            )}
            <br />
            {proforma ? (
              <>
                <Button
                  // type="dashed"
                  loading={loadingEmail}
                  icon={<MailOutlined />}
                  disabled={
                    proforma?.status === "PENDING_DISCOUNT_APPROVAL" ||
                    proforma?.status === "EXPIRED"
                  }
                  onClick={() => setIsEmailModalOpen(true)}
                  // onClick={handleSendEmail}
                >
                  Vista previa proforma
                </Button>
                <br />
                <Button
                  // type="dashed"
                  loading={loadingEmail}
                  icon={<DownloadOutlined />}
                  disabled={
                    proforma?.status === "PENDING_DISCOUNT_APPROVAL" ||
                    proforma?.status === "EXPIRED"
                  }
                  onClick={handleDownloadEmail}
                  // onClick={handleSendEmail}
                >
                  Descargar proforma
                </Button>
                <br />
                <Button
                  // type="dashed"
                  loading={loadingEmail}
                  icon={<MailOutlined />}
                  disabled={
                    proforma?.status === "PENDING_DISCOUNT_APPROVAL" ||
                    proforma?.status === "EXPIRED"
                  }
                  onClick={handleSendEmail}
                >
                  Enviar e-mail
                </Button>
              </>
            ) : (
              <Spin />
            )}
          </Grid>
          <Grid gridTemplateColumns="5fr 2fr" gridGap="2rem">
            <Input
              value={
                proforma?.subtotal
                  ? `S/ ${(proforma.subtotal / 100).toFixed(2)}`
                  : `S/ 0.00`
              }
              disabled
              addonBefore="Total"
            />
            <br />
            <Input
              value={
                proforma?.discount
                  ? `S/ ${(proforma.discount / 100).toFixed(2)}`
                  : `S/ 0.00`
              }
              disabled
              addonBefore="Descuento"
            />
            <Input
              value={
                proforma?.discount
                  ? `${((proforma.discount * 100) / proforma.subtotal).toFixed(
                      2
                    )}%`
                  : `0.00%`
              }
              disabled
            />
            <Input
              value={
                proforma?.total
                  ? `S/ ${(proforma.total / 100).toFixed(2)}`
                  : `S/ 0.00`
              }
              disabled
              addonBefore="Total Final"
            />
            <br />
          </Grid>
        </Grid>
      </Container>
      <Button
        width="20%"
        margin="2% 5% 2% 40%"
        type="primary"
        onClick={async () => router.back()}
      >
        Regresar
      </Button>
      {statusValidationModal.discountTransactionId &&
        statusValidationModal.status && (
          <Alert
            message="Warning"
            description="Proforma pendiente de aprobacion de descuento"
            type="warning"
            action={
              <Button
                onClick={() => setIsModalDiscountOpen(true)}
                size="middle"
                danger
              >
                Ver QR
              </Button>
            }
            showIcon
          />
        )}
    </>
  );
};
