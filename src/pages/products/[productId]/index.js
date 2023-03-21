import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { get } from "lodash";
import {
  Input,
  Modal,
  Table,
  Button,
  notification,
  Upload,
  Carousel,
} from "antd";
import styled from "styled-components";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { getProduct, updateProduct } from "../../../providers";
import { toBase64 } from "../../../util";

import {
  Container,
  Grid,
  Icon,
  Button as CustomButton,
} from "../../../components";
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

  // campos editables de producto
  const [suggestedPrice, setSuggestedPrice] = useState("");
  const [compatibility, setCompatibility] = useState("");
  const [tradename, setTradename] = useState("");
  //images
  const [imagesList, setImageList] = useState([]);

  // preview
  const [previewImage, setPreviewImage] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imagesPreview, setImagesPreview] = useState([]);

  //disabled
  const [disabled, setDisabled] = useState(true);

  // modal código de caja
  const [isModalBoxesDetailVisible, setIsModalBoxesDetailVisible] =
    useState(false);

  // modal código de caja
  const [
    isModalReadProductBoxCodeVisible,
    setIsModalReadProductBoxCodeVisible,
  ] = useState(false);

  const router = useRouter();
  const { productId } = router.query;

  // Product info getting
  const setImagesFromProduct = async (product) => {
    let _images = ["imageBase64", "secondImageBase64", "thirdImageBase64"]
      .filter((field) => product[field])
      .map((field, index) => {
        let _src = product[field];
        let image = {
          uid: index,
          name: `image_p${productId}_n${index}.${
            _src.split("data:image/").pop().split(";base64")[0]
          }`,
          status: "done",
          url: _src,
        };
        return image;
      });
    setImageList(_images);
    await getPreviews(_images);
  };

  useMemo(() => {
    const fetchProduct = async () => {
      try {
        const _product = await getProduct(productId);
        setProduct(_product);
        setSuggestedPrice((_product.suggestedPrice / 100).toFixed(2));
        setCompatibility(_product.compatibility);
        setTradename(_product.tradename);
        await setImagesFromProduct(_product);
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
  const getImagesBody = async () => {
    switch (imagesList.length) {
      case 1:
        return {
          imageBase64:
            imagesList[0].url || (await toBase64(imagesList[0].originFileObj)),
          secondImageBase64: null,
          thirdImageBase64: null,
        };
      case 2:
        return {
          imageBase64:
            imagesList[0].url || (await toBase64(imagesList[0].originFileObj)),
          secondImageBase64:
            imagesList[1].url || (await toBase64(imagesList[1].originFileObj)),
          thirdImageBase64: null,
        };
      case 3:
        return {
          imageBase64:
            imagesList[0].url || (await toBase64(imagesList[0].originFileObj)),
          secondImageBase64:
            imagesList[1].url || (await toBase64(imagesList[1].originFileObj)),
          thirdImageBase64:
            imagesList[2].url || (await toBase64(imagesList[2].originFileObj)),
        };
      default:
        return {};
    }
  };

  const updateProductFields = async () => {
    try {
      let body;
      let imagesBodySection = await getImagesBody();

      body = {
        suggestedPrice: parseFloat(suggestedPrice) * 100,
        compatibility,
        tradename,
        ...imagesBodySection,
      };
      const _response = await updateProduct(productId, body);
      if (imagesList.length > 0) {
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

  // Upload component handlers
  const getPreviews = async (images = imagesList) => {
    const _imagesPreviews = images.map(async (file) => {
      let filePreview = "";
      if (!file.url && !file.preview) {
        filePreview = await toBase64(file.originFileObj);
      }
      return { image: file.url || file.preview || filePreview, uid: file.uid };
    });
    const _values = await Promise.all(_imagesPreviews);
    setImagesPreview(_values);
  };

  const handleChange = async ({ fileList: newFileList }) => {
    await getPreviews(newFileList);
    setImageList(newFileList);
  };

  const handleRemove = async (uid) => {
    const files = (imagesList || []).filter((v) => v.uid !== uid);
    setImageList(files);
    await getPreviews(files);
  };

  const handlePreview = async (image) => {
    setPreviewImage(image);
    setShowImagePreview(true);
  };

  // habilitar o deshabilitar botón de actualizar
  useEffect(() => {
    if (
      (suggestedPrice === (product?.suggestedPrice / 100).toFixed(2) ||
        suggestedPrice === "") &&
      (compatibility === product?.compatibility || compatibility === "") &&
      (tradename === product?.tradename || tradename === "") &&
      imagesList.length === 0
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [suggestedPrice, compatibility, tradename, imagesList]);

  return (
    <>
      {isModalReadProductBoxCodeVisible && (
        <ReadProductCode
          visible={isModalReadProductBoxCodeVisible}
          trigger={setIsModalReadProductBoxCodeVisible}
        />
      )}
      <Modal
        open={showImagePreview}
        width="90%"
        footer={null}
        onCancel={() => setShowImagePreview(false)}
      >
        <ImagePreviewContainer justifyContent="center">
          <img src={previewImage} alt="image" />
        </ImagePreviewContainer>
      </Modal>
      <Modal
        open={isModalBoxesDetailVisible}
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
                padding="0px"
                flexDirection="row"
              >
                <Container display="block" width="350px" height="250px" padding="0px">
                  <StyledCarousel>
                    {imagesPreview.map((file) => (
                      <CarouselImageContainer key={file.uid}>
                        <CarouselImagePanel>
                          <Button
                            type="primary"
                            shape="circle"
                            onClick={() => handlePreview(file.image)}
                            icon={<EyeOutlined />}
                          />
                          <Button
                            type="primary"
                            shape="circle"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemove(file.uid)}
                          />
                        </CarouselImagePanel>

                        <CarouselImage src={file.image} alt={file.uid} />
                      </CarouselImageContainer>
                    ))}
                  </StyledCarousel>
                </Container>
                <Container width="200px">
                  <Upload
                    className="ant-upload-wrapper"
                    fileList={imagesList}
                    onChange={handleChange}
                    accept="image/png, image/jpeg"
                    showUploadList={false}
                  >
                    {imagesList.length >= 3 ||
                    (disabled && imagesList.length !== 0) ? null : (
                      <Button>
                        <Icon icon={faUpload} />
                        Imagen
                      </Button>
                    )}
                  </Upload>
                </Container>
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
          Mover Caja(s)
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

const StyledCarousel = styled(Carousel)`
  .slick-dots {
    li {
      button {
        border: 2px solid #1890ff !important;
        height: 6px !important;
      }
    }
  }
`;

const CarouselImage = styled.img`
  max-width: 100%;
  max-height: 230px;
  @media (max-width: 900px) {
    max-height: 220px;
  }
`;

const CarouselImageContainer = styled.div`
  display: flex !important;
  justify-content: center;
`;

const CarouselImagePanel = styled.div`
  top: 0;
  z-index: 10;
  padding: 0.5rem;
  position: absolute;
  display: flex;
  justify-content: space-between;
  width: 318px;
`;

const ImagePreviewContainer = styled(Container)`
  img {
    width: 100%;
  }
`;
