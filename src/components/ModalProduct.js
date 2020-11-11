import React, { useEffect, useState } from "react";
import { Container } from "./Container";
import { Grid } from "./Grid";
import { getProduct } from "../providers";
import { get } from "lodash";
import { Input, Modal, Table } from "antd";
import styled from "styled-components";

const ImagePreviewContainer = styled(Container)`
  img {
    height: 70vh;
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
      <Modal
        visible={showImagePreview}
        width="90%"
        footer={null}
        onCancel={() => setShowImagePreview(false)}
      >
        <ImagePreviewContainer justifyContent="center">
          <img src={get(product, "imageBase64", null)} alt="image" />
        </ImagePreviewContainer>
      </Modal>
      <Container height="fit-content" flexDirection="column">
        <Grid
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
        </Grid>
      </Container>
      <Container height="80%" flexDirection="column" textAlign="center">
        <Grid gridTemplateRows="repeat(2, auto)" gridGap="1rem">
          <div>
            <h3>
              Disponibilidad del producto en los almacenes(unidades totales)
            </h3>
            <br />
            <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="1rem">
              <Table
                columns={stockByWarehouseColumns}
                bordered
                scrollToFirstRowOnChange
                pagination={false}
                dataSource={get(product, "stockByWarehouse", [])}
              />
              <Container
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
              </Container>
            </Grid>
          </div>
          <div>
            <h3>Disponibilidad del producto en los almacenes(cajas)</h3>
            <br />
            <Table
              columns={stockByWarehouseAndBoxSizeColumns}
              bordered
              scrollToFirstRowOnChange
              pagination={false}
              dataSource={get(product, "stockByWarehouseAndBoxSize", [])}
            />
          </div>
        </Grid>
      </Container>
    </>
  );
};
