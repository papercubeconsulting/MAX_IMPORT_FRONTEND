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
import {
  DownloadOutlined,
  FileSearchOutlined,
  MailFilled,
  MailOutlined,
} from "@ant-design/icons";
import { Input, Table, Modal, Alert, notification, Spin, Drawer } from "antd";
import { ModalValidateDiscount } from "../../../components/proforma/ModalValidateDiscount";
import { useSendEmailProforma } from "../../../util/hooks/useSendEmail";
import {
  DesktopProductTable,
  DetailActionsGrid,
  DetailFooter,
  DetailFooterGrid,
  DetailHeader,
  DetailHeaderGrid,
  DetailInfoDrawerActions,
  DetailInfoDrawerGrid,
  DetailInfoRow,
  DetailMobileSummary,
  DetailMobileSummaryMeta,
  DetailMobileSummaryTitle,
  DetailPage,
  DetailPaymentsGrid,
  DetailProducts,
  DetailTotalsGrid,
  MobileBackButton,
  MobileProductList,
  ProformaPreviewFrame,
  ProformaPreviewModalStyles,
  ProformaPreviewTitle,
  ProformaPreviewTitleMain,
  ProformaPreviewTitleMeta,
  ProductCard,
  ProductCardActions,
  ProductCardCode,
  ProductCardHeader,
  ProductCardMeta,
  ProductCardSubtotal,
  ProductCardTitle,
  ProductMetaRow,
} from "../../../components/proforma/ProformaDetailStyles";

export default ({ setPageTitle }) => {
  setPageTitle("Información de proforma");
  const formatMoney = (value) => `S/ ${((value || 0) / 100).toFixed(2)}`;
  // States for handling modal validate discount approval
  const [isModalDiscountOpen, setIsModalDiscountOpen] = useState(false);
  //extraccion de params de url
  const router = useRouter();
  const { proformaId } = router.query;

  const columns = [
    {
      dataIndex: "id",
      title: "#",
      width: 56,
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
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = React.useState(false);
  const clientFullName = `${proforma?.client?.name || ""} ${
    proforma?.client?.lastname || ""
  }`.trim();

  return (
    <>
      <ProformaPreviewModalStyles />
      <Modal
        visible={isEmailModalOpen}
        onCancel={() => setIsEmailModalOpen(false)}
        title={
          <ProformaPreviewTitle>
            <ProformaPreviewTitleMain>
              Vista previa de proforma
            </ProformaPreviewTitleMain>
            <ProformaPreviewTitleMeta>
              {`Proforma ${proforma?.id || proformaId || ""}${
                clientFullName ? ` - ${clientFullName}` : ""
              }`}
            </ProformaPreviewTitleMeta>
          </ProformaPreviewTitle>
        }
        centered
        destroyOnClose
        footer={null}
        width="min(1180px, 96vw)"
        wrapClassName="proforma-preview-modal"
      >
        <ProformaPreviewFrame>
          <iframe src={bodyUrlPDF} title="Vista previa de proforma" />
        </ProformaPreviewFrame>
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
      <Drawer
        className="proforma-info-drawer"
        placement="bottom"
        height="78vh"
        title="Detalle de proforma"
        visible={isInfoDrawerOpen}
        onClose={() => setIsInfoDrawerOpen(false)}
      >
        <DetailInfoDrawerGrid>
          <DetailInfoRow>
            <span>Proforma</span>
            <strong>{proformaId}</strong>
          </DetailInfoRow>
          <DetailInfoRow>
            <span>Estatus</span>
            <strong>{proforma?.statusDescription || "-"}</strong>
          </DetailInfoRow>
          <DetailInfoRow>
            <span>Despacho</span>
            <strong>{proforma?.dispatchStatusDescription || "-"}</strong>
          </DetailInfoRow>
          <DetailInfoRow>
            <span>DNI/RUC</span>
            <strong>{proforma?.client?.idNumber || "-"}</strong>
          </DetailInfoRow>
          <DetailInfoRow>
            <span>Cliente</span>
            <strong>{clientFullName || "-"}</strong>
          </DetailInfoRow>
          <DetailInfoRow>
            <span>Correo</span>
            <strong>{proforma?.client?.email || "-"}</strong>
          </DetailInfoRow>
          <DetailInfoRow>
            <span>Teléfono</span>
            <strong>{proforma?.client?.phoneNumber || "-"}</strong>
          </DetailInfoRow>
          <DetailInfoRow>
            <span>Departamento</span>
            <strong>{proforma?.client?.region || "-"}</strong>
          </DetailInfoRow>
          <DetailInfoRow>
            <span>Provincia</span>
            <strong>{proforma?.client?.province || "-"}</strong>
          </DetailInfoRow>
          <DetailInfoRow>
            <span>Distrito</span>
            <strong>{proforma?.client?.district || "-"}</strong>
          </DetailInfoRow>
          <DetailInfoRow>
            <span>Dirección</span>
            <strong>{proforma?.client?.address || "-"}</strong>
          </DetailInfoRow>
        </DetailInfoDrawerGrid>
        <DetailInfoDrawerActions>
          <Button type="primary" onClick={() => setIsInfoDrawerOpen(false)}>
            Cerrar
          </Button>
        </DetailInfoDrawerActions>
      </Drawer>

      <DetailPage>
      <DetailHeader>
        <DetailMobileSummary>
          <div>
            <DetailMobileSummaryTitle>
              Proforma N° {proformaId}
            </DetailMobileSummaryTitle>
            <DetailMobileSummaryMeta>
              {proforma?.statusDescription || "-"} ·{" "}
              {proforma?.dispatchStatusDescription || "-"}
            </DetailMobileSummaryMeta>
            <DetailMobileSummaryMeta>
              Cliente: {clientFullName || "-"}
            </DetailMobileSummaryMeta>
          </div>
          <Button onClick={() => setIsInfoDrawerOpen(true)}>Detalles</Button>
        </DetailMobileSummary>
        <DetailHeaderGrid gridTemplateColumns="repeat(4, 1fr)" gridGap="1rem">
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
        </DetailHeaderGrid>
      </DetailHeader>
      <DetailProducts>
        <DesktopProductTable>
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
        </DesktopProductTable>
        <MobileProductList>
          {(proforma?.proformaProducts || []).map((item) => (
            <ProductCard key={item.id}>
              <ProductCardHeader>
                <div>
                  <ProductCardTitle>
                    {get(item, "product.modelName", "-")}
                  </ProductCardTitle>
                  <ProductCardCode>
                    Cód. Inventario: {get(item, "product.code", "-")}
                  </ProductCardCode>
                </div>
                <ProductCardSubtotal>
                  {formatMoney(get(item, "subtotal", 0))}
                </ProductCardSubtotal>
              </ProductCardHeader>
              <ProductCardMeta>
                <ProductMetaRow>
                  <span>Familia</span>
                  <strong>{get(item, "product.familyName", "-")}</strong>
                </ProductMetaRow>
                <ProductMetaRow>
                  <span>Sub-Familia</span>
                  <strong>{get(item, "product.subfamilyName", "-")}</strong>
                </ProductMetaRow>
                <ProductMetaRow>
                  <span>Elemento</span>
                  <strong>{get(item, "product.elementName", "-")}</strong>
                </ProductMetaRow>
                <ProductMetaRow>
                  <span>Cantidad</span>
                  <strong>{get(item, "quantity", 0)}</strong>
                </ProductMetaRow>
                <ProductMetaRow>
                  <span>Precio</span>
                  <strong>{formatMoney(get(item, "unitPrice", 0))}</strong>
                </ProductMetaRow>
                <ProductMetaRow>
                  <span>Stock</span>
                  <strong>{get(item, "product.availableStock", 0)}</strong>
                </ProductMetaRow>
              </ProductCardMeta>
              <ProductCardActions>
                <Button
                  padding="0 0.5rem"
                  type="primary"
                  onClick={() => {
                    setIsVisible(true);
                    setIdModal(item.productId);
                  }}
                >
                  Ver producto
                </Button>
              </ProductCardActions>
            </ProductCard>
          ))}
        </MobileProductList>
      </DetailProducts>
      <DetailFooter>
        <DetailFooterGrid gridTemplateColumns="45% 45%" gridGap="10%">
          <Grid gridTemplateRows="auto auto" gridGap="0.75rem">
          <DetailPaymentsGrid gridTemplateColumns="2fr 5fr" gridGap="2rem">
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
          </DetailPaymentsGrid>
          <DetailActionsGrid gridTemplateColumns="2fr 5fr" gridGap="2rem">
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
              <Button type="primary" onClick={handleOnRenovar}>
                Renovar
              </Button>
            )}
            {proforma ? (
              <>
                <Button
                  // type="dashed"
                  loading={loadingEmail}
                  icon={<FileSearchOutlined />}
                  disabled={
                    proforma?.status === "PENDING_DISCOUNT_APPROVAL" ||
                    proforma?.status === "EXPIRED"
                  }
                  onClick={() => setIsEmailModalOpen(true)}
                  // onClick={handleSendEmail}
                >
                  Vista previa proforma
                </Button>
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
          </DetailActionsGrid>
          </Grid>
          <DetailTotalsGrid gridTemplateColumns="5fr 2fr" gridGap="2rem">
            <Input
              className="detail-total-input"
              value={
                proforma?.subtotal
                  ? `S/ ${(proforma.subtotal / 100).toFixed(2)}`
                  : `S/ 0.00`
              }
              disabled
              addonBefore="Total"
            />
            <Input
              className="detail-discount-input"
              value={
                proforma?.discount
                  ? `S/ ${(proforma.discount / 100).toFixed(2)}`
                  : `S/ 0.00`
              }
              disabled
              addonBefore="Descuento"
            />
            <Input
              className="detail-discount-percent-input"
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
              className="detail-final-input"
              value={
                proforma?.total
                  ? `S/ ${(proforma.total / 100).toFixed(2)}`
                  : `S/ 0.00`
              }
              disabled
              addonBefore="Total Final"
            />
          </DetailTotalsGrid>
        </DetailFooterGrid>
        <MobileBackButton>
          <Button
            width="20%"
            margin="2% 5% 2% 40%"
            type="primary"
            onClick={async () => router.back()}
          >
            Regresar
          </Button>
        </MobileBackButton>
      </DetailFooter>
      </DetailPage>
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
