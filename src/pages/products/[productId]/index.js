import React, { useMemo, useState, useEffect } from "react";
import {
  Container,
  Grid,
  Icon,
  Button as CustomButton,
} from "../../../components";
import { useRouter } from "next/router";
import { getProduct, updateProduct } from "../../../providers";
import { get } from "lodash";
import { toBase64 } from "../../../util";
import { Input, Modal, Table, Button, notification, Upload } from "antd";
import styled from "styled-components";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

import { ReadProductCode } from "../../../components/products/productBoxes/ReadProductCode";
import { ModalBoxesDetail } from "../../../components/products/ModalBoxesDetail";

export default () => {
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

  // campos editables de producto
  const [suggestedPrice, setSuggestedPrice] = useState("");
  const [compatibility, setCompatibility] = useState("");
  const [tradename, setTradename] = useState("");
  const [imageBase64, setImageBase64] = useState(null);
  const [disabled, setDisabled] = useState(true);

  // modal código de caja
  const [isModalBoxesDetailVisible, setIsModalBoxesDetailVisible] = useState(
    false
  );

  // modal código de caja
  const [
    isModalReadProductBoxCodeVisible,
    setIsModalReadProductBoxCodeVisible,
  ] = useState(false);

  const router = useRouter();
  const { productId } = router.query;

  useMemo(() => {
    const fetchProduct = async () => {
      try {
        const _product = await getProduct(productId);
        setProduct(_product);
        setSuggestedPrice((_product.suggestedPrice / 100).toFixed(2));
        setCompatibility(_product.compatibility);
        setTradename(_product.tradename);
      } catch (error) {
        router.back();
      }
    };

    productId && fetchProduct();
  }, [router]);

  const stockByType = (type) => {
    const stockByWarehouseTypeArray = get(product, "stockByWarehouseType", []);

    const stockByWarehouseType = stockByWarehouseTypeArray.find(
      (_stockByWarehouseType) => _stockByWarehouseType.warehouseType === type
    );

    return get(stockByWarehouseType, "stock", 0);
  };

  // Actualiza campos del producto

  const updateProductFields = async () => {
    try {
      let body;
      if (imageBase64) {
        body = {
          suggestedPrice: parseFloat(suggestedPrice) * 100,
          compatibility,
          tradename,
          imageBase64,
        };
        console.log("si hay img");
      } else {
        body = {
          suggestedPrice: parseFloat(suggestedPrice) * 100,
          compatibility,
          tradename,
        };
        console.log("no hay imagen subida");
      }
      console.log("campos", body);
      const _response = await updateProduct(productId, body);
      console.log("resp", _response);
      if (imageBase64) {
        window.location.reload();
      }
      notification.success({
        message: "Producto actualizado correctamente",
      });
    } catch (error) {
      notification.error({
        message: error.message,
      });
    }
  };

  // habilitar o deshabilitar boton de actualizar
  useEffect(() => {
    if (
      (suggestedPrice === (product?.suggestedPrice / 100).toFixed(2) ||
        suggestedPrice === "") &&
      (compatibility === product?.compatibility || compatibility === "") &&
      (tradename === product?.tradename || tradename === "") &&
      imageBase64 === null
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [suggestedPrice, compatibility, tradename, imageBase64]);

  return (
    <>
      {isModalReadProductBoxCodeVisible && (
        <ReadProductCode
          visible={isModalReadProductBoxCodeVisible}
          trigger={setIsModalReadProductBoxCodeVisible}
        />
      )}
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
      <Modal
        visible={isModalBoxesDetailVisible}
        centered
        width="80%"
        footer={null}
        onCancel={() => setIsModalBoxesDetailVisible(false)}
      >
        <ModalBoxesDetail productId={productId} />
      </Modal>
      <Container height="auto" flexDirection="column">
        <Grid gridTemplateRows="1fr" gridGap="1rem">
          <Grid
            gridTemplateColumns="repeat(4, 1fr)"
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
              addonBefore="Compatibilidad"
              value={compatibility}
              onChange={(e) => {
                setCompatibility(e.target.value);
              }}
            />
            <Input
              addonBefore="Nombre comercial"
              value={tradename}
              onChange={(e) => {
                setTradename(e.target.value);
              }}
            />
            <Input
              addonBefore="Precio sugerido S/."
              value={suggestedPrice}
              onChange={(e) => {
                setSuggestedPrice(e.target.value);
              }}
              onBlur={(e) => {
                setSuggestedPrice(parseFloat(e.target.value || "0").toFixed(2));
              }}
            />
            <Button
              type="primary"
              gridColumnStart="4"
              onClick={updateProductFields}
              disabled={disabled}
            >
              Actualizar
            </Button>
          </Grid>
        </Grid>
      </Container>
      <Container
        height="auto"
        flexDirection="column"
        textAlign="center"
        padding="1rem 0"
      >
        <Grid gridTemplateRows="repeat(2, auto)" gridGap="1rem">
          <div>
            <h3>
              Disponibilidad del producto en los almacenes (unidades totales)
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
                <Upload
                  className="ant-upload-wrapper"
                  onChange={async (info) => {
                    /* console.log("entender", info); */
                    if (info.file.status === "done") {
                      const encodedImage = await toBase64(
                        info.file.originFileObj
                      );
                      setImageBase64(encodedImage);
                    } else {
                      setImageBase64(null);
                    }
                  }}
                  accept="image/png, image/jpeg"
                >
                  <Button>
                    <Icon icon={faUpload} />
                    Imagen
                  </Button>
                </Upload>
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
      <Container height="15%" justifyContent="space-around">
        <CustomButton
          onClick={() => setIsModalReadProductBoxCodeVisible(true)}
          size="large"
          width="30%"
          type="primary"
        >
          Mover Caja
        </CustomButton>
        <CustomButton
          onClick={() => setIsModalBoxesDetailVisible(true)}
          size="large"
          width="30%"
          type="primary"
        >
          Ver detalle de cajas
        </CustomButton>
      </Container>
    </>
  );
};

const ImagePreviewContainer = styled(Container)`
  img {
    height: 70vh;
  }
`;
