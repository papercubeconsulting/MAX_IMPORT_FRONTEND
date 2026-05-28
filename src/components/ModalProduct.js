import React, { useEffect, useState } from "react";
import { Container } from "./Container";
import { Grid } from "./Grid";
import { getProduct } from "../providers";
import { get } from "lodash";
import { Input, Modal, Table } from "antd";
import styled, { createGlobalStyle } from "styled-components";

const ImagePreviewContainer = styled(Container)`
  img {
    height: 70vh;
  }

  @media (max-width: 768px) {
    padding: 0;

    img {
      height: auto;
      max-height: 78vh;
      max-width: 100%;
      object-fit: contain;
      width: 100%;
    }
  }
`;

const ProductInfoModalStyles = createGlobalStyle`
  @media (max-width: 768px) {
    .product-info-modal {
      top: 0;
      max-width: 100vw;
      padding: 0;
    }

    .product-info-modal .ant-modal {
      margin: 0;
      max-width: 100vw;
      padding: 0;
      width: 100vw !important;
    }

    .product-info-modal .ant-modal-content {
      border-radius: 0;
      display: flex;
      flex-direction: column;
      height: 100vh;
      max-height: 100vh;
      overflow: hidden;
    }

    .product-info-modal .ant-modal-header {
      flex: 0 0 auto;
      padding: 0.85rem 2.85rem 0.85rem 1rem;
    }

    .product-info-modal .ant-modal-title {
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.25rem;
    }

    .product-info-modal .ant-modal-close-x {
      height: 3rem;
      line-height: 3rem;
      width: 3rem;
    }

    .product-info-modal .ant-modal-body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      padding: 0.75rem;
    }
  }
`;

const ProductInfoContent = styled.div`
  display: contents;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 0;
  }
`;

const ProductFieldsContainer = styled(Container)`
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const ProductFieldsGrid = styled(Grid)`
  @media (max-width: 768px) {
    display: none !important;
  }
`;

const ProductMobileFieldsGrid = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: grid;
    gap: 0.55rem;
  }
`;

const ProductMobileInfoRow = styled.div`
  @media (max-width: 768px) {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    display: grid;
    gap: 0.35rem;
    padding: 0.65rem 0.75rem;

    span {
      color: #667085;
      font-size: 0.76rem;
      line-height: 1rem;
    }

    strong {
      color: #1f2937;
      font-size: 0.9rem;
      font-weight: 600;
      line-height: 1.15rem;
      overflow-wrap: anywhere;
    }
  }
`;

const ProductStockContent = styled.div`
  display: grid;
  gap: 1rem;
`;

const ProductStockSection = styled.section`
  @media (max-width: 768px) {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0.75rem;
    text-align: left;

    h3 {
      color: #111827;
      font-size: 0.95rem;
      font-weight: 700;
      line-height: 1.2rem;
      margin: 0;
    }

    br {
      display: none;
    }
  }
`;

const ProductStockGrid = styled(Grid)`
  @media (max-width: 768px) {
    grid-gap: 0.75rem !important;
    grid-template-columns: 1fr !important;
    margin-top: 0.65rem;
  }
`;

const ProductImageContainer = styled(Container)`
  img {
    height: auto;
    max-width: 100%;
  }

  @media (max-width: 768px) {
    background: #f9fafb;
    border: 1px solid #eef2f7;
    border-radius: 8px;
    min-height: 12rem;
    padding: 0.65rem;

    img {
      max-height: 14rem;
      object-fit: contain;
      width: 100%;
    }
  }
`;

const ProductTableWrap = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

const ProductStockContainer = styled(Container)`
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const ProductMobileStockList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: grid;
    gap: 0.55rem;
    margin-top: 0.65rem;
  }
`;

const ProductMobileStockCard = styled.div`
  @media (max-width: 768px) {
    background: #f9fafb;
    border: 1px solid #eef2f7;
    border-radius: 8px;
    display: grid;
    gap: 0.45rem;
    padding: 0.65rem 0.75rem;
  }
`;

const ProductMobileStockCardTitle = styled.div`
  @media (max-width: 768px) {
    color: #111827;
    font-size: 0.9rem;
    font-weight: 700;
    line-height: 1.15rem;
    overflow-wrap: anywhere;
  }
`;

const ProductMobileStockRow = styled.div`
  @media (max-width: 768px) {
    display: flex;
    gap: 0.75rem;
    justify-content: space-between;

    span {
      color: #667085;
      flex: 1 1 auto;
      font-size: 0.76rem;
    }

    strong {
      color: #374151;
      flex: 0 0 auto;
      font-size: 0.82rem;
      font-weight: 600;
      text-align: right;
    }
  }
`;

export const ModalProduct = (props) => {
  const stockByWarehouseColumns = [
    {
      title: "Almacén",
      dataIndex: "warehouseName",
      align: "center",
    },
    {
      title: "Stock",
      dataIndex: "stock",
      align: "center",
    },
  ];

  const stockByWarehouseAndBoxSizeColumns = [
    {
      title: "Ubicación",
      dataIndex: "warehouseName",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Cajas",
      dataIndex: "quantityBoxes",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Uni/Caja",
      dataIndex: "boxSize",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Unidades",
      dataIndex: "stock",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Cajas completas",
      dataIndex: "completeBoxes",
      width: "fit-content",
      align: "center",
    },
  ];

  const [product, setProduct] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const stockByWarehouse = get(product, "stockByWarehouse", []);
  const stockByWarehouseAndBoxSize = get(
    product,
    "stockByWarehouseAndBoxSize",
    [],
  );

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const _product = await getProduct(props.id);
        setProduct(_product);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProduct();
  }, [props.id]);

  const stockByType = (type) => {
    const stockByWarehouseTypeArray = get(product, "stockByWarehouseType", []);

    const stockByWarehouseType = stockByWarehouseTypeArray.find(
      (_stockByWarehouseType) => _stockByWarehouseType.warehouseType === type
    );

    return get(stockByWarehouseType, "stock", 0);
  };

  return (
    <>
      <ProductInfoModalStyles />
      <Modal
        open={showImagePreview}
        width="90%"
        footer={null}
        wrapClassName="product-info-modal"
        onCancel={() => setShowImagePreview(false)}
      >
        <ImagePreviewContainer justifyContent="center">
          <img src={get(product, "imageBase64", null)} alt="image" />
        </ImagePreviewContainer>
      </Modal>
      <ProductInfoContent>
        <ProductFieldsContainer height="fit-content" flexDirection="column">
          <ProductFieldsGrid
            gridTemplateColumns="repeat(3, 1fr)"
            gridTemplateRows="repeat(2, 2rem)"
            gridGap="1rem"
          >
            <Input
              disabled
              addonBefore="Familia"
              value={get(product, "familyName", "-")}
            />
            <Input
              disabled
              addonBefore="Sub-Familia"
              value={get(product, "subfamilyName", "-")}
            />
            <Input
              disabled
              addonBefore="Elemento"
              value={get(product, "elementName", "-")}
            />
            <Input
              disabled
              addonBefore="Modelo"
              value={get(product, "modelName", "-")}
            />
            <Input
              disabled
              addonBefore="Proveedor"
              value={get(product, "provider.name", "-")}
            />
            <Input
              disabled
              addonBefore="Código Inventario"
              value={get(product, "code", "-")}
            />
            <Input
              disabled
              addonBefore="Disponibles"
              value={stockByType("Almacén")}
            />
            <Input
              disabled
              addonBefore="Averiados"
              value={stockByType("Averiado")}
            />
            <Input
              disabled
              addonBefore="Compatibilidad"
              value={get(product, "compatibility", "-")}
            />
            <Input
              disabled
              addonBefore="Nombre comercial"
              value={get(product, "tradename", "-")}
            />
            <Input
              disabled
              addonBefore="Precio sugerido S/."
              value={(get(product, "suggestedPrice", "-") / 100).toFixed(2)}
            />
          </ProductFieldsGrid>
          <ProductMobileFieldsGrid>
            <ProductMobileInfoRow>
              <span>Modelo</span>
              <strong>{get(product, "modelName", "-")}</strong>
            </ProductMobileInfoRow>
            <ProductMobileInfoRow>
              <span>Código Inventario</span>
              <strong>{get(product, "code", "-")}</strong>
            </ProductMobileInfoRow>
            <ProductMobileInfoRow>
              <span>Nombre comercial</span>
              <strong>{get(product, "tradename", "-")}</strong>
            </ProductMobileInfoRow>
            <ProductMobileInfoRow>
              <span>Familia</span>
              <strong>{get(product, "familyName", "-")}</strong>
            </ProductMobileInfoRow>
            <ProductMobileInfoRow>
              <span>Sub-Familia</span>
              <strong>{get(product, "subfamilyName", "-")}</strong>
            </ProductMobileInfoRow>
            <ProductMobileInfoRow>
              <span>Elemento</span>
              <strong>{get(product, "elementName", "-")}</strong>
            </ProductMobileInfoRow>
            <ProductMobileInfoRow>
              <span>Proveedor</span>
              <strong>{get(product, "provider.name", "-")}</strong>
            </ProductMobileInfoRow>
            <ProductMobileInfoRow>
              <span>Disponibles</span>
              <strong>{stockByType("Almacén")}</strong>
            </ProductMobileInfoRow>
            <ProductMobileInfoRow>
              <span>Averiados</span>
              <strong>{stockByType("Averiado")}</strong>
            </ProductMobileInfoRow>
            <ProductMobileInfoRow>
              <span>Compatibilidad</span>
              <strong>{get(product, "compatibility", "-")}</strong>
            </ProductMobileInfoRow>
            <ProductMobileInfoRow>
              <span>Precio sugerido S/.</span>
              <strong>
                {(get(product, "suggestedPrice", 0) / 100).toFixed(2)}
              </strong>
            </ProductMobileInfoRow>
          </ProductMobileFieldsGrid>
        </ProductFieldsContainer>
        <ProductStockContainer height="80%" flexDirection="column" textAlign="center">
          <ProductStockContent>
            <ProductStockSection>
              <h3>
                Disponibilidad del producto en almacenes (unidades totales)
              </h3>
              <br />
              <ProductStockGrid
                gridTemplateColumns="repeat(2, 1fr)"
                gridGap="1rem"
              >
                <ProductTableWrap>
                  <Table
                    columns={stockByWarehouseColumns}
                    bordered
                    scrollToFirstRowOnChange
                    pagination={false}
                    dataSource={stockByWarehouse}
                  />
                </ProductTableWrap>
                <ProductMobileStockList>
                  {stockByWarehouse.map((stockItem, index) => (
                    <ProductMobileStockCard
                      key={`${stockItem.warehouseName}-${index}`}
                    >
                      <ProductMobileStockCardTitle>
                        {stockItem.warehouseName || "-"}
                      </ProductMobileStockCardTitle>
                      <ProductMobileStockRow>
                        <span>Stock</span>
                        <strong>{stockItem.stock || 0}</strong>
                      </ProductMobileStockRow>
                    </ProductMobileStockCard>
                  ))}
                </ProductMobileStockList>
                <ProductImageContainer
                  justifyContent="center"
                  alignItems="center"
                  padding="0px"
                >
                  {get(product, "imageBase64", false) ? (
                    <img
                      src={get(product, "imageBase64", null)}
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowImagePreview(true)}
                      width="300px"
                      alt="product-image"
                    />
                  ) : (
                    <img
                      src="/imagePlaceholder.png"
                      width="300px"
                      alt="product-image"
                    />
                  )}
                </ProductImageContainer>
              </ProductStockGrid>
            </ProductStockSection>
            <ProductStockSection>
              <h3>Disponibilidad del producto en almacenes (cajas)</h3>
              <br />
              <ProductTableWrap>
                <Table
                  columns={stockByWarehouseAndBoxSizeColumns}
                  bordered
                  scrollToFirstRowOnChange
                  pagination={false}
                  dataSource={stockByWarehouseAndBoxSize}
                />
              </ProductTableWrap>
              <ProductMobileStockList>
                {stockByWarehouseAndBoxSize.map((stockItem, index) => (
                  <ProductMobileStockCard
                    key={`${stockItem.warehouseName}-${stockItem.boxSize}-${index}`}
                  >
                    <ProductMobileStockCardTitle>
                      {stockItem.warehouseName || "-"}
                    </ProductMobileStockCardTitle>
                    <ProductMobileStockRow>
                      <span>Cajas</span>
                      <strong>{stockItem.quantityBoxes || 0}</strong>
                    </ProductMobileStockRow>
                    <ProductMobileStockRow>
                      <span>Uni/Caja</span>
                      <strong>{stockItem.boxSize || 0}</strong>
                    </ProductMobileStockRow>
                    <ProductMobileStockRow>
                      <span>Unidades</span>
                      <strong>{stockItem.stock || 0}</strong>
                    </ProductMobileStockRow>
                    <ProductMobileStockRow>
                      <span>Cajas completas</span>
                      <strong>{stockItem.completeBoxes || 0}</strong>
                    </ProductMobileStockRow>
                  </ProductMobileStockCard>
                ))}
              </ProductMobileStockList>
            </ProductStockSection>
          </ProductStockContent>
        </ProductStockContainer>
      </ProductInfoContent>
    </>
  );
};
