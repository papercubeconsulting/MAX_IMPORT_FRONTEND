import React, { useEffect, useState } from "react";
import { Collapse, Input, Modal, notification, Tag, Upload } from "antd";
import { AutoComplete, Button, Container, Grid, Icon, Select } from "../index";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import {
  getElements,
  getFamilies,
  getModels,
  getProducts,
  getSuggestedProductGroupCode,
  getProductGroupSearchOptions,
  getProductGroups,
  getProviders,
  getSubfamilies,
  postProductGroup,
  postProduct,
} from "../../providers";
import { toBase64 } from "../../util";
import styled from "styled-components";

export const AddProduct = (props) => {
  const colors = ["#dc3546", "#28a746", "#17a3b8"];
  const allowedProductGroupPrefixes = ["ALT"];
  const newProductGroupOptionPrefix = "__new_product_group__:";

  // * List of sources from database
  const [families, setFamilies] = useState([]);
  const [subfamilies, setSubfamilies] = useState([]);
  const [elements, setElements] = useState([]);
  const [models, setModels] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [productGroupSearchOptions, setProductGroupSearchOptions] = useState({
    models: [],
    tradenames: [],
  });
  const [productGroupSuggestions, setProductGroupSuggestions] = useState([]);
  const [isLoadingProductGroupSuggestions, setIsLoadingProductGroupSuggestions] =
    useState(false);
  const [productGroupSearchType, setProductGroupSearchType] =
    useState("modelName");
  const [productGroupSearchText, setProductGroupSearchText] = useState("");
  const [providers, setProviders] = useState([]);

  // * Fields to create source
  const [family, setFamily] = useState({});
  const [subfamily, setSubfamily] = useState({});
  const [element, setElement] = useState({});
  const [model, setModel] = useState({});
  const [productGroup, setProductGroup] = useState({});
  const [suggestedProductGroup, setSuggestedProductGroup] = useState(null);
  const [provider, setProvider] = useState({});
  const [suggestedPrice, setSuggestedPrice] = useState(0);
  const [compatibility, setCompatibility] = useState(null);
  const [tradename, setTradename] = useState("-");
  const [cost, setCost] = useState(suggestedPrice);
  const [margin, setMargin] = useState(0);

  // let margin = ((suggestedPrice / cost) * 100).toFixed(2);

  //images
  const [imagesList, setImageList] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const _families = await getFamilies();
        setFamilies(_families);

        const _productGroups = await getProductGroups({ isActive: true });
        setProductGroups(_productGroups);

        const _productGroupSearchOptions = await getProductGroupSearchOptions();
        setProductGroupSearchOptions(_productGroupSearchOptions);


        const _providers = await getProviders({ active: true });
        setProviders(_providers);
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    const fetchSubfamilies = async () => {
      try {
        setSubfamilies([]);
        setSubfamily((prevState) => ({ ...prevState, id: undefined }));

        if (family.id) {
          const _subfamilies = await getSubfamilies(family.id);
          setSubfamilies(_subfamilies);
          setSubfamily(_subfamilies[0] ? _subfamilies[0] : {});
        }
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };

    fetchSubfamilies();
  }, [family]);

  useEffect(() => {
    const fetchElements = async () => {
      try {
        setElements([]);
        setElement((prevState) => ({ ...prevState, id: undefined }));

        if (subfamily.id) {
          const _elements = await getElements(subfamily.id);
          setElements(_elements);
          setElement(_elements[0] ? _elements[0] : {});
        }
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };

    fetchElements();
  }, [subfamily]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setModels([]);
        setModel((prevState) => ({ ...prevState, id: undefined }));

        if (element.id) {
          const _models = await getModels(element.id);
          setModels(_models);
        }
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };

    fetchModels();
  }, [element]);

  // Upload handlers
  const getPreviews = async (images = imagesList) => {
    const _imagesPreviews = images.map(async (file) => {
      let filePreview = "";
      if (!file.url && !file.preview) {
        filePreview = await toBase64(file.originFileObj);
      }
      return file.url || file.preview || filePreview;
    });
    const _values = await Promise.all(_imagesPreviews);
    setImagesPreview(_values);
  };

  const handleChange = async ({ fileList: newFileList }) => {
    await getPreviews(newFileList);
    setImageList(newFileList);
  };

  const handleRemove = async (file) => {
    const files = (imagesList || []).filter((v) => v.url !== file.url);
    setImageList(files);
    await getPreviews(files);
  };

  const selectOptions = (collection) =>
    collection.map((document) => ({
      label: document.name,
      value: document.id,
    }));

  const productGroupOptions = () =>
    [
      ...(suggestedProductGroup
        ? [
            {
              label: `• ${suggestedProductGroup.label || `Nuevo: ${suggestedProductGroup.code}`}`,
              value: `${newProductGroupOptionPrefix}${suggestedProductGroup.code}`,
            },
          ]
        : []),
      ...selectOptions(
        productGroups.filter((productGroup) =>
          isValidProductGroupPrefix(productGroup.code)
        )
      ),
    ];

  const searchTextOptions = () => {
    if (productGroupSearchType === "modelName") {
      return productGroupSearchOptions.models.map((modelName) => ({
        label: modelName,
        value: modelName,
      }));
    }

    return productGroupSearchOptions.tradenames.map((tradename) => ({
      label: tradename,
      value: tradename,
    }));
  };

  const autoCompleteColor = (id, name) => {
    if (id) return colors[1];
    if (name) return colors[2];
    return colors[0];
  };

  const getProductGroup = (product) =>
    product.productGroup || product.ProductGroup;

  const getProductGroupId = (product) =>
    product.groupId || getProductGroup(product)?.id;

  const isValidProductGroupPrefix = (code) =>
    allowedProductGroupPrefixes.some((prefix) =>
      new RegExp(`^${prefix}-\\d+$`).test((code || "").trim().toUpperCase())
    );

  const applyProductGroupSearch = async (value) => {
    const normalizedValue = value.trim().toUpperCase();
    const matchedPrefix = allowedProductGroupPrefixes.find((prefix) =>
      normalizedValue.startsWith(prefix)
    );

    setSuggestedProductGroup(null);
    setProductGroup((prevValue) => ({
      name: value,
      code: prevValue.id ? value : value,
    }));

    if (matchedPrefix) {
      try {
        const suggestion = await getSuggestedProductGroupCode({
          prefix: matchedPrefix,
        });
        setSuggestedProductGroup(suggestion);
      } catch (error) {
        notification.error({
          message: "No se pudo sugerir el código del grupo",
          description: error.message,
        });
      }
    }
  };

  const searchProductGroupSuggestions = async () => {
    try {
      const searchText = productGroupSearchText.trim();
      setProductGroupSuggestions([]);

      if (!searchText) {
        return notification.error({
          message: "Error al buscar productos",
          description: "Ingrese un texto de búsqueda",
        });
      }

      setIsLoadingProductGroupSuggestions(true);
      const _products = await getProducts({
        [productGroupSearchType]: searchText,
        stock: "all",
        pageSize: 20,
      });

      setProductGroupSuggestions(_products.rows || []);
    } catch (error) {
      notification.error({
        message: "Error en el servidor",
        description: error.message,
      });
    } finally {
      setIsLoadingProductGroupSuggestions(false);
    }
  };

  const confirmAddProduct = () => {
    if (cost === "" || cost < 0) {
      return notification.error({
        message: "Error al intentar subir producto",
        description: "El costo debe ser positvo",
      });
    }

    if (suggestedPrice < 0) {
      return notification.error({
        message: "Error al intentar subir producto",
        description: "El precio debe ser positivo",
      });
    }

    if (!provider.id) {
      return notification.error({
        message: "Error al intentar subir producto",
        description: "Elija un proveedor de la lista indicada",
      });
    }
    if (!family.name) {
      return notification.error({
        message: "Error al intentar subir producto",
        description: "Ingrese una familia",
      });
    }
    if (!family.code) {
      return notification.error({
        message: "Error al intentar subir producto",
        description: "Ingrese el código de la familia",
      });
    }
    if (!subfamily.name) {
      return notification.error({
        message: "Error al intentar subir producto",
        description: "Ingrese una subfamilia",
      });
    }
    if (!subfamily.code) {
      return notification.error({
        message: "Error al intentar subir producto",
        description: "Ingrese el código de la subfamilia",
      });
    }
    if (!element.name) {
      return notification.error({
        message: "Error al intentar subir producto",
        description: "Ingrese un elemento",
      });
    }
    if (!element.code) {
      return notification.error({
        message: "Error al intentar subir producto",
        description: "Ingrese el código del elemento",
      });
    }
    if (!model.name) {
      return notification.error({
        message: "Error al intentar subir producto",
        description: "Ingrese un modelo",
      });
    }
    const hasProductGroup = Boolean(productGroup.name || productGroup.code);

    if (hasProductGroup && !productGroup.name) {
      return notification.error({
        message: "Error al intentar subir producto",
        description: "Ingrese un grupo",
      });
    }
    if (hasProductGroup && !productGroup.code) {
      return notification.error({
        message: "Error al intentar subir producto",
        description: "Ingrese el código del grupo",
      });
    }
    if (
      hasProductGroup &&
      !productGroup.id &&
      !isValidProductGroupPrefix(productGroup.code)
    ) {
      return notification.error({
        message: "Error al intentar subir producto",
        description: `El grupo debe tener formato: ${allowedProductGroupPrefixes.join(", ")}-XX`,
      });
    }
    Modal.confirm({
      width: "90%",
      title: "¿Está seguro de que desea crear este ítem en el inventario?",
      onOk: async () => submitProduct(),
      content: (
        <ModalConfirmContainer padding="0px" flexDirection="column">
          <Container justifyContent="space-around" padding="1rem 0">
            <CategoryContainer>
              <CategoryTitle>FAMILIA</CategoryTitle>
              <Tag>{`${family.name} (${family.code})`}</Tag>
            </CategoryContainer>
            <CategoryContainer>
              <CategoryTitle>SUB-FAMILIA</CategoryTitle>
              <Tag>{`${subfamily.name} (${subfamily.code})`}</Tag>
            </CategoryContainer>
            <CategoryContainer>
              <CategoryTitle>ELEMENTO</CategoryTitle>
              <Tag>{`${element.name} (${element.code})`}</Tag>
            </CategoryContainer>
            <CategoryContainer>
              <CategoryTitle>MODELO</CategoryTitle>
              <Tag>{`${model.name}`}</Tag>
            </CategoryContainer>
            <CategoryContainer>
              <CategoryTitle>GRUPO</CategoryTitle>
              <Tag>
                {hasProductGroup
                  ? `${productGroup.name} (${productGroup.code})`
                  : "Sin grupo"}
              </Tag>
            </CategoryContainer>
          </Container>
          <Container padding="1rem 0" flexDirection="column">
            <h3>
              <b>Proveedor:&nbsp;</b>
              {provider.name} ({provider.code})
            </h3>
            <h3>
              <b>Precio:&nbsp;</b>
              S/ {suggestedPrice}
            </h3>
            <h3>
              <b>Compatibilidad:&nbsp;</b>
              {compatibility}
            </h3>
            <h3>
              <b>Nombre comercial:&nbsp;</b>
              {tradename}
            </h3>
          </Container>
          {imagesPreview && (
            <Container padding="0px" alignItems="center" flexDirection="column">
              <h3>
                <b>Vista previa de imágenes:</b>
              </h3>
              <Container
                padding="0px"
                alignItems="center"
                flexDirection="row"
                justifyContent="space-around"
              >
                {imagesPreview.map((image) => (
                  <img src={image} height="120px" alt="uploaded-image" />
                ))}
              </Container>
            </Container>
          )}
        </ModalConfirmContainer>
      ),
    });
  };

  // Crea producto
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

  const submitProduct = async () => {
    try {
      let imagesBodySection = await getImagesBody();
      const hasProductGroup = Boolean(productGroup.name || productGroup.code);
      const selectedProductGroup = hasProductGroup
        ? productGroup.id
          ? productGroup
          : await postProductGroup({
              name: productGroup.name,
              code: productGroup.code,
            })
        : null;

      const body = {
        familyId: family.id,
        subfamilyId: subfamily.id,
        elementId: element.id,
        modelId: model.id,
        ...(selectedProductGroup ? { groupId: selectedProductGroup.id } : {}),
        familyName: family.name,
        subfamilyName: subfamily.name,
        elementName: element.name,
        modelName: model.name,
        familyCode: family.code,
        subfamilyCode: subfamily.code,
        elementCode: element.code,
        providerId: provider.id,
        tradename,
        suggestedPrice: Math.round(suggestedPrice * 100),
        cost: Math.round(cost * 100),
        compatibility: compatibility || undefined,
        ...imagesBodySection,
      };

      props.trigger(false);

      const response = await postProduct(body);

      props.toggleUpdateTable((prevState) => !prevState);

      Modal.success({
        title: "Producto creado correctamente",
        content: `Código de inventario: ${response.code}`,
      });
    } catch (error) {
      Modal.error({
        title: "Error al crear nuevo ítem de inventario",
        content: error.userMessage,
      });
    }
  };

  function handleDecimalsOnValue(value) {
    const regex = /([0-9]*[\.|\,]{0,1}[0-9]{0,2})/s;
    return value.match(regex)[0];
  }

  return (
    <Modal
      visible={props.visible}
      onOk={() => confirmAddProduct()}
      onCancel={() => props.trigger && props.trigger(false)}
      width="95%"
      title="Nuevo ítem inventario"
    >
      <Grid gridGap="1rem">
        <Grid gridTemplateColumns="repeat(3, 1fr)" gridGap="1rem">
          <Input
            value={family.code}
            disabled={family.id}
            onChange={(event) => {
              const newValue = event.target.value;
              setFamily((prevValue) => ({
                name: prevValue.name,
                code: newValue,
              }));
            }}
            addonBefore="Código"
          />
          <Input
            value={subfamily.code}
            disabled={subfamily.id}
            onChange={(event) => {
              const newValue = event.target.value;
              setSubfamily((prevValue) => ({
                name: prevValue.name,
                code: newValue,
              }));
            }}
            addonBefore="Código"
          />
          <Input
            value={element.code}
            disabled={element.id}
            onChange={(event) => {
              const newValue = event.target.value;
              setElement((prevValue) => ({
                name: prevValue.name,
                code: newValue,
              }));
            }}
            addonBefore="Código"
          />
        </Grid>
        <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="1rem">
          <AutoComplete
            label="Familia"
            color={autoCompleteColor(family.id, family.name)}
            value={family.name}
            onSelect={(value) => {
              const _family = families.find((family) => family.id === value);
              setFamily(_family);
            }}
            onSearch={(value) => {
              setFamily((prevValue) => ({
                name: value,
                code: prevValue.id ? "" : prevValue.code,
              }));
            }}
            _options={selectOptions(families)}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          />
          <AutoComplete
            label="Sub-Familia"
            color={autoCompleteColor(subfamily.id, subfamily.name)}
            value={subfamily.name}
            onSelect={(value) => {
              const _subfamily = subfamilies.find(
                (subfamily) => subfamily.id === value
              );
              setSubfamily(_subfamily);
            }}
            onSearch={(value) => {
              setSubfamily((prevValue) => ({
                name: value,
                code: prevValue.id ? "" : prevValue.code,
              }));
            }}
            _options={selectOptions(subfamilies)}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          />
          <AutoComplete
            label="Elemento"
            color={autoCompleteColor(element.id, element.name)}
            value={element.name}
            onSelect={(value) => {
              const _element = elements.find((element) => element.id === value);
              setElement(_element);
            }}
            onSearch={(value) => {
              setElement((prevValue) => ({
                name: value,
                code: prevValue.id ? "" : prevValue.code,
              }));
            }}
            _options={selectOptions(elements)}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          />
          <AutoComplete
            label="Modelo"
            color={autoCompleteColor(model.id, model.name)}
            value={model.name}
            onSelect={(value) => {
              const _model = models.find((model) => model.id === value);
              setModel(_model);
            }}
            onSearch={(value) => {
              setModel({
                name: value,
              });
            }}
            _options={selectOptions(models)}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          />
        </Grid>
        <ProductGroupSection>
          <Collapse>
            <Collapse.Panel
              key="product-group"
              header={
                productGroup.name
                  ? `Grupo Producto: ${productGroup.code}`
                  : "Grupo Producto"
              }
            >
              <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="1rem">
                <AutoComplete
                  label="Grupo"
                  color={autoCompleteColor(productGroup.id, productGroup.name)}
                value={productGroup.name}
                onSelect={(value) => {
                  if (
                    typeof value === "string" &&
                    value.startsWith(newProductGroupOptionPrefix)
                  ) {
                    const code = value.replace(newProductGroupOptionPrefix, "");
                    setProductGroup({ name: code, code });
                    setSuggestedProductGroup(null);
                    return;
                  }
                  const _productGroup = productGroups.find(
                    (productGroup) => productGroup.id === value
                  );
                  setProductGroup(_productGroup);
                  setSuggestedProductGroup(null);
                }}
                  onSearch={applyProductGroupSearch}
                  _options={productGroupOptions()}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                />
                <Input
                  value={productGroup.code}
                  disabled={productGroup.id}
                  onChange={(event) => {
                    const newValue = event.target.value;
                    setProductGroup((prevValue) => ({
                      name: prevValue.name,
                      code: newValue,
                    }));
                  }}
                  addonBefore="Código Grupo"
                />
              </Grid>
              <ProductSuggestions>
                <SectionSubtitle>Buscar grupo por producto</SectionSubtitle>
                <Grid gridTemplateColumns="1fr 2fr auto" gridGap="1rem">
                  <Select
                    label="Buscar por"
                    value={productGroupSearchType}
                    onChange={(value) => {
                      setProductGroupSearchType(value);
                      setProductGroupSearchText("");
                      setProductGroupSuggestions([]);
                    }}
                    options={[
                      { label: "Modelo", value: "modelName" },
                      { label: "Nombre comercial", value: "tradename" },
                    ]}
                  />
                  <AutoComplete
                    label="Texto"
                    color="#ffffff"
                    colorFont="#404040"
                    value={productGroupSearchText}
                    onSelect={(value) => setProductGroupSearchText(value)}
                    onSearch={(value) => setProductGroupSearchText(value)}
                    onPressEnter={() => searchProductGroupSuggestions()}
                    _options={searchTextOptions()}
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                  <Button
                    type="primary"
                    onClick={() => searchProductGroupSuggestions()}
                  >
                    Buscar
                  </Button>
                </Grid>
                {isLoadingProductGroupSuggestions ? (
                  <EmptyText>Cargando productos...</EmptyText>
                ) : productGroupSuggestions.length ? (
                  <ProductSuggestionList>
                    {productGroupSuggestions.map((product) => {
                      const _productGroup = getProductGroup(product);
                      const hasGroup = Boolean(getProductGroupId(product));
                      return (
                        <ProductSuggestionRow key={product.id}>
                          <ProductSuggestionInfo>
                            <strong>{product.code}</strong>
                            <span>{product.modelName}</span>
                            <span>{product.tradename}</span>
                            {hasGroup ? (
                              <Tag color={colors[1]}>
                                {_productGroup.code}
                              </Tag>
                            ) : (
                              <Tag color="warning">Sin grupo asignado</Tag>
                            )}
                          </ProductSuggestionInfo>
                          {hasGroup && (
                            <Button
                              type="primary"
                              onClick={() => setProductGroup(_productGroup)}
                            >
                              Usar grupo
                            </Button>
                          )}
                        </ProductSuggestionRow>
                      );
                    })}
                  </ProductSuggestionList>
                ) : (
                  <EmptyText>
                    No hay productos con grupo para esta búsqueda.
                  </EmptyText>
                )}
              </ProductSuggestions>
            </Collapse.Panel>
          </Collapse>
        </ProductGroupSection>
        <Grid gridTemplateColumns="3fr 2fr 3fr " gridGap="1rem">
          <Select
            value={provider.name}
            label="Proveedor"
            onChange={(value) => {
              const _provider = providers.find(
                (provider) => provider.id === value
              );
              setProvider(_provider);
            }}
            options={selectOptions(providers)}
          />
          <Input
            value={compatibility}
            onChange={(event) => setCompatibility(event.target.value)}
            addonBefore="Compatibilidad"
          />
          <Input
            value={tradename}
            onChange={(event) => setTradename(event.target.value)}
            addonBefore="Nombre comercial"
          />
          <Input
            value={cost}
            type="number"
            step=".01"
            onChange={(event) => {
              const value = handleDecimalsOnValue(event.target.value);

              if (margin === 100) {
                setCost(value);
                setSuggestedPrice(value);
                return;
              }
              const price = value * (1 + margin / 100);
              if (!isNaN(price)) {
                setSuggestedPrice(price.toFixed(2));
                setCost(value);
              }
            }}
            addonBefore="Costo S/"
          />
          <Input
            type="number"
            step=".01"
            disabled={cost === 0}
            onBlur={(e) => {
              const realMargin = ((suggestedPrice / cost) - 1) * 100;
              setMargin(Number(realMargin).toFixed(2));
            }}
            onChange={(event) => {
              const value = handleDecimalsOnValue(event.target.value);
              const margin = Number(value).toFixed(2);
              const price = (cost * (margin / 100 + 1)).toFixed(2);
              if (!isNaN(price)) {
                setMargin(value);
                setSuggestedPrice(price);
              }
            }}
            value={margin}
            addonBefore="Margen %"
          />
          <Input
            value={suggestedPrice}
            min={0}
            onBlur={(event) => {
              // once on focus the
              if (cost === 0) {
                setCost(event.target.value);
              }
            }}
            onChange={(event) => {
              // in case price is 0 and maargin 0 (initial state)

              const value = handleDecimalsOnValue(event.target.value);

              if (cost === 0) {
                setSuggestedPrice(value);
                return;
              }

              const price = Number(value).toFixed(2);
              const margin = ((price / cost) * 100).toFixed(2);
              if (!isNaN(margin)) {
                setMargin((margin - 100).toFixed(2));
                setSuggestedPrice(value);
              }
            }}
            type="number"
            step=".01"
            addonBefore="Precio S/"
          />
          <Upload
            className="ant-upload-wrapper"
            fileList={imagesList}
            onChange={handleChange}
            onRemove={handleRemove}
            accept="image/png, image/jpeg"
          >
            {imagesList.length >= 3 ? null : (
              <Button>
                <Icon icon={faUpload} />
                Imagen
              </Button>
            )}
          </Upload>
        </Grid>
        <div>
          <h3>Leyenda:</h3>
          <LegendsContainer
            justifyContent="space-around"
            height="auto"
            padding="0px"
          >
            <Tag color={colors[0]}>No seleccionado</Tag>
            <Tag color={colors[1]}>Existente</Tag>
            <Tag color={colors[2]}>Nuevo</Tag>
          </LegendsContainer>
        </div>
      </Grid>
    </Modal>
  );
};

const CategoryContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const CategoryTitle = styled(Tag)`
  font-weight: bold;
  border-width: 2px !important;
  border-color: black !important;
`;

const ProductGroupSection = styled.div`
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 1rem;
`;

const SectionSubtitle = styled.h4`
  margin: 0 0 0.75rem 0;
`;

const ProductSuggestions = styled.div`
  margin-top: 1rem;
`;

const ProductSuggestionList = styled.div`
  display: grid;
  grid-gap: 0.5rem;
`;

const ProductSuggestionRow = styled.div`
  align-items: center;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
`;

const ProductSuggestionInfo = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const EmptyText = styled.div`
  color: #8c8c8c;
`;

const LegendsContainer = styled(Container)`
  .ant-tag {
    font-size: 1rem;
    margin: 0;
    padding: 0.5rem;
    text-align: center;
    min-width: 15%;
  }
`;

const ModalConfirmContainer = styled(LegendsContainer)`
  h3 {
    color: #404040;

    b {
      color: black;
    }
  }
`;
