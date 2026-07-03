import React, { useEffect, useState } from "react";
import { Button, Container, Grid, ModalProduct } from "../components";
import { getProforma } from "../providers";
import { get } from "lodash";
import { Input, Table, Modal } from "antd";
import styled from "styled-components";

const ModalProformaContent = styled.div`
  display: contents;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    min-height: 0;
  }
`;

const ModalProformaHeader = styled(Container)`
  @media (max-width: 768px) {
    display: none;
  }
`;

const ModalProformaMobileSummary = styled.div`
  display: none;

  @media (max-width: 768px) {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    display: grid;
    gap: 0.45rem;
    padding: 0.75rem;
  }
`;

const ModalProformaMobileTitle = styled.div`
  @media (max-width: 768px) {
    color: #111827;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.2rem;
  }
`;

const ModalProformaMetaRow = styled.div`
  @media (max-width: 768px) {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: minmax(6.5rem, 0.45fr) minmax(0, 1fr);

    span {
      color: #667085;
      font-size: 0.78rem;
    }

    strong {
      color: #374151;
      font-size: 0.86rem;
      font-weight: 600;
      overflow-wrap: anywhere;
      text-align: right;
    }
  }
`;

const ModalProformaTableWrap = styled(Container)`
  @media (max-width: 768px) {
    display: none;
  }
`;

const ModalProformaDesktopSpacer = styled(Container)`
  @media (max-width: 768px) {
    display: none;
  }
`;

const ModalProformaMobileList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: grid;
    gap: 0.75rem;
  }
`;

const ModalProformaProductCard = styled.div`
  @media (max-width: 768px) {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
    padding: 0.85rem;
  }
`;

const ModalProformaProductHeader = styled.div`
  @media (max-width: 768px) {
    align-items: flex-start;
    display: flex;
    gap: 0.75rem;
    justify-content: space-between;
  }
`;

const ModalProformaProductTitle = styled.div`
  @media (max-width: 768px) {
    color: #111827;
    font-size: 0.98rem;
    font-weight: 700;
    line-height: 1.2rem;
    overflow-wrap: anywhere;
  }
`;

const ModalProformaProductCode = styled.div`
  @media (max-width: 768px) {
    color: #667085;
    font-size: 0.78rem;
    margin-top: 0.2rem;
  }
`;

const ModalProformaProductSubtotal = styled.div`
  @media (max-width: 768px) {
    color: #111827;
    flex: 0 0 auto;
    font-size: 0.95rem;
    font-weight: 700;
    text-align: right;
  }
`;

const ModalProformaFooter = styled(Container)`
  @media (max-width: 768px) {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    height: auto !important;
    padding: 0.75rem !important;

    > div {
      grid-gap: 0.55rem !important;
      grid-template-columns: 1fr !important;
    }

    br {
      display: none;
    }

    .ant-input {
      text-align: right;
    }
  }
`;

export const ModalProforma = (props) => {
  const columns = [
    {
      dataIndex: "id",
      title: "",
      width: "40px",
      align: "center",
      render: (id, record, index) => index + 1,
    },
    {
      title: "Cód. Inventario",
      dataIndex: "product",
      align: "center",
      render: (product) => get(product, "code", null),
    },
    {
      title: "Familia",
      dataIndex: "product",
      align: "center",
      render: (product) => get(product, "familyName", null),
    },
    {
      title: "Sub-Familia",
      dataIndex: "product",
      align: "center",
      render: (product) => get(product, "subfamilyName", null),
    },
    {
      title: "Elemento",
      dataIndex: "product",
      align: "center",
      render: (product) => get(product, "elementName", null),
    },
    {
      title: "Modelo",
      dataIndex: "product",
      align: "center",
      render: (product) => get(product, "modelName", null),
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      align: "center",
    },
    {
      title: "Precio",
      dataIndex: "unitPrice",
      align: "center",
      render: (unitPrice) => `S/.${(unitPrice / 100).toFixed(2)}`,
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      align: "center",
      render: (subtotal) => `S/.${(subtotal / 100).toFixed(2)}`,
    },
    {
      title: "Disponibilidad",
      dataIndex: "product",
      width: '130px',
      align: "center",
      render: (product) => get(product, "availableStock", 0),
    },
    {
      dataIndex: "id",
      width: "80px",
      align: "center",
      render: (id, product) => (
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
      ),
    },
  ];

  const [proforma, setProforma] = useState([]);
  const [windowHeight, setWindowHeight] = useState(0);

  //Modal
  const [isVisible, setIsVisible] = useState(false);
  const [idModal, setIdModal] = useState("");

  //para setear el tamaño de pantalla
  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  // trae información de la proforma seleccionada
  useEffect(() => {
    const fetchProforma = async () => {
      try {
        const _proforma = await getProforma(props.id);
        setProforma(_proforma);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProforma();
  }, [props.id]);

  return (
    <>
      <Modal
        visible={isVisible}
        width="90%"
        title="Información del producto"
        onCancel={() => setIsVisible(false)}
        footer={null}
        wrapClassName="product-info-modal"
      >
        <ModalProduct id={idModal}></ModalProduct>
      </Modal>
      <ModalProformaContent>
        <ModalProformaHeader height="fit-content">
          <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="1rem">
            <Input value={proforma.id} disabled addonBefore="Proforma" />
            <Input
              value={proforma.statusDescription}
              disabled
              addonBefore="Estatus"
            />
            <Input
              value={proforma.dispatchStatusDescription}
              disabled
              addonBefore="Despacho"
            />

            <Input
              value={proforma.client ? proforma.client.idNumber : ""}
              disabled
              addonBefore="DNI/RUC"
            />

            <Input
              value={proforma.client ? proforma.client.name : ""}
              disabled
              addonBefore="Cliente"
            />
            <Input
              value={proforma.client ? proforma.client.lastname : ""}
              disabled
            />

            <Input
              value={proforma.client ? proforma.client.email : ""}
              disabled
              addonBefore="Correo"
            />
            <Input
              value={proforma.client ? proforma.client.phoneNumber : ""}
              disabled
              addonBefore="Teléfono"
            />

            <Input
              value={proforma.client ? proforma.client.region : ""}
              disabled
              addonBefore="Departamento"
            />

            <Input
              value={proforma.client ? proforma.client.province : ""}
              disabled
              addonBefore="Provincia"
            />

            <Input
              value={proforma.client ? proforma.client.district : ""}
              disabled
              addonBefore="Distrito"
            />

            <Input
              value={proforma.client ? proforma.client.address : ""}
              disabled
              addonBefore="Dirección"
            />
          </Grid>
        </ModalProformaHeader>
        <ModalProformaMobileSummary>
          <ModalProformaMobileTitle>
            Proforma N° {proforma.id || "-"}
          </ModalProformaMobileTitle>
          <ModalProformaMetaRow>
            <span>Cliente</span>
            <strong>
              {`${proforma.client?.name || ""} ${
                proforma.client?.lastname || ""
              }`.trim() || "-"}
            </strong>
          </ModalProformaMetaRow>
          <ModalProformaMetaRow>
            <span>DNI/RUC</span>
            <strong>{proforma.client?.idNumber || "-"}</strong>
          </ModalProformaMetaRow>
          <ModalProformaMetaRow>
            <span>Despacho</span>
            <strong>{proforma.dispatchStatusDescription || "-"}</strong>
          </ModalProformaMetaRow>
          <ModalProformaMetaRow>
            <span>Dirección</span>
            <strong>{proforma.client?.address || "-"}</strong>
          </ModalProformaMetaRow>
        </ModalProformaMobileSummary>
        <ModalProformaTableWrap padding="0px" width="100%" height="35%">
          <Table
            columns={columns}
            scroll={{ y: windowHeight * 0.3 - 48 }}
            bordered
            pagination={false}
            dataSource={
              proforma.proformaProducts ? proforma.proformaProducts : []
            }
          />
        </ModalProformaTableWrap>
        <ModalProformaMobileList>
          {(proforma.proformaProducts || []).map((item) => (
            <ModalProformaProductCard key={item.id}>
              <ModalProformaProductHeader>
                <div>
                  <ModalProformaProductTitle>
                    {get(item, "product.modelName", "-")}
                  </ModalProformaProductTitle>
                  <ModalProformaProductCode>
                    Cód. Inventario: {get(item, "product.code", "-")}
                  </ModalProformaProductCode>
                </div>
                <ModalProformaProductSubtotal>
                  S/.{((get(item, "subtotal", 0) || 0) / 100).toFixed(2)}
                </ModalProformaProductSubtotal>
              </ModalProformaProductHeader>
              <ModalProformaMetaRow>
                <span>Familia</span>
                <strong>{get(item, "product.familyName", "-")}</strong>
              </ModalProformaMetaRow>
              <ModalProformaMetaRow>
                <span>Cantidad</span>
                <strong>{get(item, "quantity", 0)}</strong>
              </ModalProformaMetaRow>
              <ModalProformaMetaRow>
                <span>Precio</span>
                <strong>
                  S/.{((get(item, "unitPrice", 0) || 0) / 100).toFixed(2)}
                </strong>
              </ModalProformaMetaRow>
              <ModalProformaMetaRow>
                <span>Disponibilidad</span>
                <strong>{get(item, "product.availableStock", 0)}</strong>
              </ModalProformaMetaRow>
            </ModalProformaProductCard>
          ))}
        </ModalProformaMobileList>
      <ModalProformaDesktopSpacer
        height="fit-content"
        padding="2rem 1rem 1rem"
      />
      <ModalProformaFooter height="fit-content">
        <Grid gridTemplateColumns="45% 45%" gridGap="10%">
          <Grid gridTemplateColumns="2fr 5fr" gridGap="2rem">
            <br />
            <Input
              value={
                proforma.sale?.due
                  ? `S/.${(proforma.sale.due / 100).toFixed(2)}`
                  : `-`
              }
              disabled
              addonBefore="Efectivo"
            />
            <br />

            <Input
              value={
                proforma.sale?.credit
                  ? `S/.${(proforma.sale.credit / 100).toFixed(2)}`
                  : `-`
              }
              disabled
              addonBefore="Crédito"
            />
            <br />
          </Grid>
          <Grid gridTemplateColumns="5fr 2fr" gridGap="2rem">
            <Input
              value={
                proforma.subtotal
                  ? `S/.${(proforma.subtotal / 100).toFixed(2)}`
                  : `S/.0.00`
              }
              disabled
              addonBefore="Total"
            />
            <br />
            <Input
              value={
                proforma.discount
                  ? `S/.${(proforma.discount / 100).toFixed(2)}`
                  : `S/.0.00`
              }
              disabled
              addonBefore="Descuento"
            />
            <Input
              value={
                proforma.discount
                  ? `${((proforma.discount * 100) / proforma.subtotal).toFixed(
                      2
                    )}%`
                  : `0.00%`
              }
              disabled
            />
            <Input
              value={
                proforma.total
                  ? `S/.${(proforma.total / 100).toFixed(2)}`
                  : `S/.0.00`
              }
              disabled
              addonBefore="Total Final"
            />
            <br />
          </Grid>
        </Grid>
      </ModalProformaFooter>
      </ModalProformaContent>
    </>
  );
};
