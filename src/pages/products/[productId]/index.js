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
import styled, { createGlobalStyle } from "styled-components";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { getProduct, getProducts, me, updateProduct, addProductToGroup, removeProductFromGroup } from "../../../providers";
import { toBase64 } from "../../../util";

import {
  Container,
  Grid,
  Icon,
  Button as CustomButton,
} from "../../../components";
import { ReadProductCode } from "../../../components/products/productBoxes/ReadProductCode";
import { ModalBoxesDetail } from "../../../components/products/ModalBoxesDetail";
import { usePricingCalculation } from "../../../util/usePricingCalculation";

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
  // const [suggestedPrice, setSuggestedPrice] = useState("");
  const [compatibility, setCompatibility] = useState("");
  const [tradename, setTradename] = useState("");
  //images
  const [imagesList, setImagesList] = useState([]);
  const [groupProducts, setGroupProducts] = useState([]);
  const [isGroupRelationModalVisible, setIsGroupRelationModalVisible] = useState(false);
  const [groupSearchText, setGroupSearchText] = useState("");
  const [isAddingToGroup, setIsAddingToGroup] = useState(false);

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

  // user information
  const [user, setUser] = React.useState(null);
  const isLogistic = user?.role === "logistic";
  const isSeller = user?.role === "seller";

  const router = useRouter();
  const { productId } = router.query;

  const {
    costInputProps,
    priceInputProps,
    marginInputProps,
    setCost,
    setSuggestedPrice,
    setMargin,
    price: suggestedPrice,
    cost,
    margin,
  } = usePricingCalculation({});
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
    setImagesList(_images);
    await getPreviews(_images);
  };

  const fetchProduct = async () => {
    try {
      const _product = await getProduct(productId);
      const user = await me();
      setUser(user);
      // console.log({ user });
      setProduct(_product);
      setCost((_product.cost / 100).toFixed(2));
      setMargin(parsedMargin(_product));
      setSuggestedPrice((_product.suggestedPrice / 100).toFixed(2));
      setCompatibility(_product.compatibility);
      setTradename(_product.tradename);
      await setImagesFromProduct(_product);
    } catch (error) {
      console.log("error", error);
      notification.error({
        message: "No se pudo cargar el producto",
        description: error.message,
      });
    }
  };

  const getGroupRelatedTradename = (groupProduct) =>
    get(groupProduct, 'tradename', get(groupProduct, 'product.tradename', '-'));

  const getGroupRelatedModelCode = (groupProduct) =>
    get(groupProduct, 'model.code',
      get(groupProduct, 'product.model.code',
        get(groupProduct, 'modelName', get(groupProduct, 'product.modelName', '-'))
      )
    );

  const getProductGroupCode = (productItem) =>
    get(productItem, 'group.code',
      get(productItem, 'product.group.code',
        get(productItem, 'groupCode', get(productItem, 'product.groupCode', '-'))
      )
    );

  const getProductGroupSize = (productItem) => {
    const groupArray = get(productItem, 'productGroups',
      get(productItem, 'product.productGroups', []));
    if (Array.isArray(groupArray) && groupArray.length > 0) {
      return groupArray.length + 1;
    }
    return get(productItem, 'group.size', get(productItem, 'product.group.size', 1));
  };

  const findProductToAdd = (products, searchText) => {
    const normalized = (searchText || '').trim().toLowerCase();
    if (!normalized) return null;
    const exact = (products || []).find(
      (item) =>
        get(item, 'tradename', '').toLowerCase() === normalized ||
        get(item, 'code', '').toString().toLowerCase() === normalized
    );
    return exact || (products || [])[0] || null;
  };

  const loadGroupProducts = async () => {
    const relatedProducts = get(product, 'productGroups', []);
    if (relatedProducts && relatedProducts.length > 0) {
      setGroupProducts(relatedProducts);
      setIsGroupRelationModalVisible(true);
      return;
    }

    if (!product?.tradename) {
      setGroupProducts([]);
      setIsGroupRelationModalVisible(true);
      return;
    }

    try {
      const response = await getProducts({ tradename: product.tradename });
      const rows = get(response, 'rows', response);
      const filtered = (rows || []).filter(
        (item) => get(item, 'id') !== get(product, 'id')
      );
      setGroupProducts(filtered);
      setIsGroupRelationModalVisible(true);
    } catch (error) {
      console.log('error loading group products', error);
      notification.error({
        message: 'No se pudo cargar los productos relacionados',
        description: error.message,
      });
      setGroupProducts([]);
      setIsGroupRelationModalVisible(true);
    }
  };

  const removeProductFromGroup = async (groupProduct) => {
    try {
      await removeProductFromGroup(productId, get(groupProduct, 'id'));
      notification.success({
        message: 'Producto retirado del grupo correctamente',
      });
      await fetchProduct();
      setIsGroupRelationModalVisible(false);
    } catch (error) {
      notification.error({
        message: error.message,
      });
    }
  };

  const addProductToCurrentGroup = async () => {
    if (!groupSearchText.trim()) {
      notification.warning({
        message: 'Ingrese un nombre comercial o código para buscar el producto',
      });
      return;
    }

    setIsAddingToGroup(true);
    try {
      const response = await getProducts({ tradename: groupSearchText });
      const rows = get(response, 'rows', response);
      const productToAdd = findProductToAdd(rows, groupSearchText);
      if (!productToAdd) {
        notification.error({
          message: 'No se encontró ningún producto para agregar',
        });
        return;
      }

      if (get(productToAdd, 'id') === get(product, 'id')) {
        notification.warning({
          message: 'No puede agregar el mismo producto al grupo',
        });
        return;
      }

      const targetGroupSize = getProductGroupSize(productToAdd);
      const targetGroupCode = getProductGroupCode(productToAdd);

      const executeAdd = async () => {
        const existingGroups = get(product, 'productGroups', []) || [];
        const alreadyInGroup = existingGroups.some(
          (item) => get(item, 'id') === get(productToAdd, 'id')
        );
        if (alreadyInGroup) {
          notification.info({
            message: 'El producto ya pertenece a este grupo',
          });
          return;
        }

        await addProductToGroup(productId, get(productToAdd, 'id'));
        notification.success({
          message: 'Producto agregado al grupo correctamente',
        });
        await fetchProduct();
        setGroupSearchText('');
      };

      if (targetGroupSize > 1) {
        Modal.confirm({
          title: `Este producto pertenece al grupo ${targetGroupCode}. ¿Está seguro que quiere moverlo de grupo?`,
          okText: 'ok',
          cancelText: 'cancelar',
          onOk: executeAdd,
        });
      } else {
        await executeAdd();
      }
    } catch (error) {
      notification.error({
        message: 'Error al buscar o agregar el producto',
        description: error.message,
      });
    } finally {
      setIsAddingToGroup(false);
    }
  };

  const confirmRemoveFromGroup = (groupProduct) => {
    Modal.confirm({
      title: '¿Está seguro que quiere retirar este producto del grupo?',
      okText: 'ok',
      cancelText: 'cancelar',
      onOk: () => removeProductFromGroup(groupProduct),
    });
  };

  const groupColumns = [
    {
      title: 'Nombre comercial',
      dataIndex: 'tradename',
      key: 'tradename',
      render: (_, record) => getGroupRelatedTradename(record),
    },
    {
      title: 'Código de modelo',
      key: 'modelCode',
      render: (_, record) => getGroupRelatedModelCode(record),
    },
    {
      title: '',
      key: 'actions',
      width: '140px',
      align: 'center',
      render: (_, record) => (
        <Button
          type="danger"
          shape="circle"
          icon={<DeleteOutlined />}
          title="eliminar producto de grupo"
          onClick={() => confirmRemoveFromGroup(record)}
        />
      ),
    },
  ];

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const parsedMargin = (_product) => {
    return _product?.margin === 1
      ? Number(0).toFixed(2)
      : ((_product?.margin - 1) * 100).toFixed(2);
  };

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
        suggestedPrice: Math.round(parseFloat(suggestedPrice) * 100),
        cost: Math.round(cost * 100),
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
      (Number(suggestedPrice).toFixed(2) ===
        (product?.suggestedPrice / 100).toFixed(2) ||
        Number(suggestedPrice).toFixed(0) === Number(0).toFixed(0)) &&
      (compatibility === product?.compatibility || compatibility === "") &&
      (tradename === product?.tradename || tradename === "") &&
      imagesList.length === 0 &&
      (Number(cost * 100).toFixed(2) === Number(product?.cost).toFixed(2) ||
        cost === "") &&
      (Number(margin).toFixed(2) === parsedMargin(product) ||
        Number(margin).toFixed(0) === Number(0).toFixed(0))
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [suggestedPrice, compatibility, tradename, imagesList, margin, cost]);

  return (
    <>
      <ProductDetailResponsiveStyles />
      {isModalReadProductBoxCodeVisible && (
        <ReadProductCode
          visible={isModalReadProductBoxCodeVisible}
          trigger={setIsModalReadProductBoxCodeVisible}
        />
      )}
      <Modal
        title="Productos relacionados"
        open={isGroupRelationModalVisible}
        width="80%"
        wrapClassName="group-products-modal"
        footer={null}
        onCancel={() => setIsGroupRelationModalVisible(false)}
      >
        <Table
          className="group-products-table"
          columns={groupColumns}
          dataSource={(groupProducts || []).map((item, index) => ({
            ...item,
            key: get(item, 'id', index),
          }))}
          pagination={false}
          scroll={{ x: 520, y: 400 }}
          rowKey={(record) => get(record, 'id', record.key)}
        />
        <div className="group-products-mobile-list">
          {(groupProducts || []).map((item, index) => (
            <div
              className="group-products-mobile-card"
              key={get(item, 'id', index)}
            >
              <div className="group-products-mobile-field">
                <span>Nombre comercial</span>
                <strong>{getGroupRelatedTradename(item)}</strong>
              </div>
              <div className="group-products-mobile-field">
                <span>Código de modelo</span>
                <strong>{getGroupRelatedModelCode(item)}</strong>
              </div>
              <div className="group-products-mobile-actions">
                <Button
                  type="danger"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  title="eliminar producto de grupo"
                  onClick={() => confirmRemoveFromGroup(item)}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="group-products-add-row">
          <Input
            placeholder="Buscar producto para agregar al grupo"
            value={groupSearchText}
            onChange={(e) => setGroupSearchText(e.target.value)}
          />
          <Button
            type="primary"
            onClick={addProductToCurrentGroup}
            loading={isAddingToGroup}
          >
            Agregar
          </Button>
        </div>
      </Modal>
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
      <Container
        className="product-detail-info-section"
        height="auto"
        flexDirection="column"
      >
        <Grid className="product-detail-info-wrapper" gridTemplateRows="1fr" gridGap="1rem">
          <Grid
            className="product-detail-form-grid"
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
              style={{ gridColumn: 'span 2' }}
            />
            <CustomButton
              type="primary"
              style={{ whiteSpace: 'nowrap', height: '2rem' }}
              onClick={loadGroupProducts}
            >
              Prod.Relacionados - Grupo
            </CustomButton>
          </Grid>
        </Grid>
        {user !== null && !isLogistic && (
          <Grid
            className="product-detail-pricing-grid"
            style={{ margin: "1rem 0" }}
            gridTemplateColumns="repeat(3, 1fr)"
            gridTemplateRows="repeat(1, 2rem)"
            gridGap="1rem"
          >
            {!isSeller && (
              <>
                <Input
                  addonBefore="Costo"
                  value={cost}
                  {...costInputProps}
                  // onChange={(e) => {
                  //   setTradename(e.target.value);
                  // }}
                />
                <Input
                  addonBefore="Margen %"
                  value={margin}
                  {...marginInputProps}
                  // onChange={(e) => {
                  //   setTradename(e.target.value);
                  // }}
                />
              </>
            )}
            <Input
              addonBefore="Precio sugerido S/."
              value={suggestedPrice}
              // onChange={(e) => {
              //   setSuggestedPrice(e.target.value);
              // }}
              {...priceInputProps}
              onBlur={(e) => {
                setSuggestedPrice(parseFloat(e.target.value || "0").toFixed(2));
              }}
            />
          </Grid>
        )}
      </Container>
      <div
        className="product-detail-main-actions"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        <Button
          style={{ width: "30%" }}
          type="primary"
          gridColumnStart="4"
          onClick={updateProductFields}
          disabled={disabled}
        >
          Actualizar
        </Button>
        <Button
          style={{ width: "10%" }}
          type="dashed"
          gridColumnStart="4"
          onClick={() => fetchProduct()}
          // disabled={disabled}
        >
          Reset
        </Button>
      </div>

      <Container
        className="product-detail-stock-section"
        height="auto"
        flexDirection="column"
        textAlign="center"
        padding="1rem 0"
      >
        <Grid className="product-detail-stock-wrapper" gridTemplateRows="repeat(2, auto)" gridGap="1rem">
          <div className="product-detail-stock-units">
            <h3>
              Disponibilidad del producto en los almacenes (unidades totales)
            </h3>
            <br />
            <Grid
              className="product-detail-stock-summary-grid"
              gridTemplateColumns="repeat(2, 1fr)"
              gridGap="1rem"
            >
              <Table
                className="product-detail-units-table"
                columns={stockByWarehouseColumns}
                bordered
                scrollToFirstRowOnChange
                pagination={false}
                scroll={{ x: 360 }}
                dataSource={get(product, "stockByWarehouse", [])}
              />
              <Container
                className={`product-detail-image-section ${
                  imagesPreview.length === 0 ? "product-detail-image-section-empty" : ""
                }`}
                justifyContent="center"
                padding="0px"
                flexDirection="row"
              >
                <Container
                  className="product-detail-image-carousel"
                  display="block"
                  width="350px"
                  height="250px"
                  padding="0px"
                >
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
                <Container className="product-detail-image-upload" width="200px">
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
          <div className="product-detail-stock-boxes">
            <h3>Disponibilidad del producto en los almacenes(cajas)</h3>
            <br />
            <Table
              className="product-detail-boxes-table"
              columns={stockByWarehouseAndBoxSizeColumns}
              bordered
              scrollToFirstRowOnChange
              pagination={false}
              scroll={{ x: 680 }}
              dataSource={get(product, "stockByWarehouseAndBoxSize", [])}
            />
          </div>
        </Grid>
      </Container>
      <Container
        className="product-detail-footer-actions"
        height="15%"
        justifyContent="space-around"
      >
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

const ProductDetailResponsiveStyles = createGlobalStyle`
  .product-detail-info-section,
  .product-detail-stock-section,
  .product-detail-footer-actions {
    width: 100%;
  }

  .product-detail-form-grid,
  .product-detail-pricing-grid,
  .product-detail-stock-wrapper,
  .product-detail-stock-summary-grid {
    width: 100%;
  }

  .group-products-modal .ant-modal {
    max-width: calc(100vw - 2rem);
  }

  .group-products-modal .ant-modal-body {
    max-height: calc(100vh - 9rem);
    overflow-y: auto;
  }

  .group-products-table .ant-table {
    min-width: 520px;
  }

  .group-products-table .ant-table-thead > tr > th,
  .group-products-table .ant-table-tbody > tr > td {
    padding: 0.6rem 0.5rem;
    vertical-align: middle;
    white-space: normal;
    word-break: break-word;
  }

  .group-products-add-row {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .group-products-add-row .ant-input {
    min-width: 0;
  }

  .group-products-add-row .ant-btn {
    flex: 0 0 auto;
  }

  .group-products-mobile-list {
    display: none;
  }

  @media (min-width: 1200px) {
    .group-products-modal .ant-modal {
      max-width: 1100px;
    }
  }

  @media (max-width: 768px) {
    .product-detail-info-section {
      padding: 0 0.75rem;
    }

    .product-detail-info-wrapper,
    .product-detail-form-grid,
    .product-detail-pricing-grid,
    .product-detail-stock-wrapper,
    .product-detail-stock-summary-grid {
      grid-template-columns: 1fr !important;
      grid-template-rows: none !important;
      grid-gap: 0.75rem !important;
    }

    .product-detail-form-grid > *,
    .product-detail-pricing-grid > * {
      grid-column: auto !important;
      min-width: 0;
      width: 100%;
    }

    .product-detail-form-grid button,
    .product-detail-pricing-grid button {
      width: 100% !important;
    }

    .product-detail-form-grid .ant-input-wrapper.ant-input-group,
    .product-detail-pricing-grid .ant-input-wrapper.ant-input-group {
      display: grid;
      grid-template-columns: 1fr;
      width: 100%;
    }

    .product-detail-form-grid .ant-input-group-addon,
    .product-detail-pricing-grid .ant-input-group-addon {
      border-bottom: 0;
      border-radius: 4px 4px 0 0;
      border-right: 1px solid #d9d9d9;
      display: block;
      line-height: 1.2rem;
      padding: 0.45rem 0.65rem;
      text-align: left;
      white-space: normal;
      width: 100%;
    }

    .product-detail-form-grid .ant-input,
    .product-detail-pricing-grid .ant-input {
      border-radius: 0 0 4px 4px;
      display: block;
      min-height: 2.15rem;
      width: 100%;
    }

    .product-detail-main-actions {
      display: grid !important;
      gap: 0.65rem !important;
      grid-template-columns: 1fr !important;
      padding: 0.75rem;
    }

    .product-detail-main-actions .ant-btn {
      width: 100% !important;
    }

    .product-detail-stock-section {
      padding: 0.25rem 0.75rem 1rem !important;
    }

    .product-detail-stock-wrapper {
      gap: 1rem !important;
    }

    .product-detail-stock-section h3 {
      font-size: 1rem;
      line-height: 1.25rem;
      margin: 0;
      overflow-wrap: anywhere;
    }

    .product-detail-stock-section br {
      display: none;
    }

    .product-detail-stock-units,
    .product-detail-stock-boxes {
      min-width: 0;
      width: 100%;
    }

    .product-detail-stock-summary-grid {
      margin-top: 0.75rem;
    }

    .product-detail-stock-boxes {
      margin-top: 1rem;
    }

    .product-detail-image-section {
      align-items: center !important;
      display: grid !important;
      gap: 0.75rem;
      grid-template-columns: 1fr;
      justify-items: center;
      margin: 0;
      min-height: 0 !important;
      order: 1;
      padding: 0 !important;
      width: 100%;
    }

    .product-detail-image-section-empty {
      display: none !important;
    }

    .product-detail-units-table {
      order: 2;
      width: 100%;
    }

    .product-detail-boxes-table {
      width: 100%;
    }

    .product-detail-units-table .ant-table,
    .product-detail-boxes-table .ant-table {
      min-width: 360px;
    }

    .product-detail-boxes-table .ant-table {
      min-width: 680px;
    }

    .product-detail-units-table .ant-table-thead > tr > th,
    .product-detail-units-table .ant-table-tbody > tr > td,
    .product-detail-boxes-table .ant-table-thead > tr > th,
    .product-detail-boxes-table .ant-table-tbody > tr > td {
      padding: 0.5rem 0.4rem;
      white-space: normal;
      word-break: break-word;
    }

    .product-detail-image-carousel {
      height: auto !important;
      margin: 0 !important;
      max-width: 100%;
      min-height: 0 !important;
      overflow: hidden !important;
      padding: 0 !important;
      width: 100% !important;
    }

    .product-detail-image-carousel .ant-carousel,
    .product-detail-image-carousel .slick-slider,
    .product-detail-image-carousel .slick-list,
    .product-detail-image-carousel .slick-track,
    .product-detail-image-carousel .slick-slide,
    .product-detail-image-carousel .slick-slide > div,
    .product-detail-image-carousel ${CarouselImageContainer} {
      height: auto !important;
      max-width: 100% !important;
      min-height: 0 !important;
      overflow: hidden !important;
      width: 100% !important;
    }

    .product-detail-image-carousel .slick-track {
      display: flex !important;
      transform: none !important;
    }

    .product-detail-image-carousel .slick-slide {
      flex: 0 0 100% !important;
    }

    .product-detail-image-upload {
      margin: 0 !important;
      min-height: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }

    .product-detail-image-upload .ant-upload,
    .product-detail-image-upload .ant-btn {
      width: 100%;
    }

    .product-detail-footer-actions {
      display: grid !important;
      gap: 0.75rem;
      grid-template-columns: 1fr;
      height: auto !important;
      padding: 0 0.75rem 1rem;
    }

    .product-detail-footer-actions button {
      width: 100% !important;
    }

    ${CarouselImage} {
      max-height: 13rem;
      width: 100%;
      object-fit: contain;
    }

    ${CarouselImagePanel} {
      left: 0;
      width: 100%;
    }

    .group-products-modal {
      padding: 0 !important;
    }

    .group-products-modal .ant-modal {
      margin: 12px !important;
      max-height: calc(100vh - 24px);
      max-width: 100%;
      top: 0;
      width: calc(100vw - 24px) !important;
    }

    .group-products-modal .ant-modal-content {
      border-radius: 6px;
      max-height: calc(100vh - 24px);
      overflow-x: hidden;
      overflow-y: auto;
    }

    .group-products-modal .ant-modal-header {
      padding: 0.85rem 2.75rem 0.85rem 1rem;
    }

    .group-products-modal .ant-modal-title {
      font-size: 1rem;
      line-height: 1.25rem;
    }

    .group-products-modal .ant-modal-close-x {
      height: 3rem;
      line-height: 3rem;
      width: 3rem;
    }

    .group-products-modal .ant-modal-body {
      max-height: none;
      overflow-x: hidden;
      overflow-y: visible;
      padding: 0.75rem;
    }

    .group-products-table {
      display: none;
    }

    .group-products-mobile-list {
      display: grid;
      gap: 0.75rem;
      width: 100%;
    }

    .group-products-mobile-card {
      background: #fff;
      border: 1px solid #e8e8e8;
      border-radius: 6px;
      display: grid;
      gap: 0.65rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      min-width: 0;
      padding: 0.75rem;
      width: 100%;
    }

    .group-products-mobile-field {
      display: grid;
      gap: 0.2rem;
      min-width: 0;
    }

    .group-products-mobile-field span {
      color: #666;
      font-size: 0.74rem;
      font-weight: 700;
      line-height: 1rem;
    }

    .group-products-mobile-field strong {
      color: #222;
      font-size: 0.88rem;
      font-weight: 500;
      line-height: 1.2rem;
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .group-products-mobile-actions {
      display: flex;
      justify-content: flex-end;
      width: 100%;
    }

    .group-products-add-row {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: 1fr;
      margin-top: 0.85rem;
    }

    .group-products-add-row .ant-input {
      width: 100%;
    }

    .group-products-add-row .ant-btn {
      width: 100%;
    }
  }
`;
