import React, { useEffect, useState } from "react";
import { Input, Modal, notification, Tag, Upload } from "antd";
import { AutoComplete, Button, Container, Grid, Icon, Select } from "../index";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import {
  getElements,
  getFamilies,
  getModels,
  getProviders,
  getSubfamilies,
  postProduct,
} from "../../providers";
import { toBase64 } from "../../util";
import styled from "styled-components";

export const AddProduct = (props) => {
  const colors = ["#dc3546", "#28a746", "#17a3b8"];

  // * List of sources from database
  const [families, setFamilies] = useState([]);
  const [subfamilies, setSubfamilies] = useState([]);
  const [elements, setElements] = useState([]);
  const [models, setModels] = useState([]);
  const [providers, setProviders] = useState([]);

  // * Fields to create source
  const [family, setFamily] = useState({});
  const [subfamily, setSubfamily] = useState({});
  const [element, setElement] = useState({});
  const [model, setModel] = useState({});
  const [provider, setProvider] = useState({});
  const [suggestedPrice, setSuggestedPrice] = useState(0);
  const [compatibility, setCompatibility] = useState(null);
  const [tradename, setTradename] = useState("-");
  const [imageBase64, setImageBase64] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const _families = await getFamilies();
        setFamilies(_families);

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

  const selectOptions = (collection) =>
    collection.map((document) => ({
      label: document.name,
      value: document.id,
    }));

  const autoCompleteColor = (id, name) => {
    if (id) return colors[1];
    if (name) return colors[2];
    return colors[0];
  };

  const confirmAddProduct = () => {
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
          {imageBase64 && (
            <Container padding="0px" alignItems="center" flexDirection="column">
              <h3>
                <b>Vista previa imagen:</b>
              </h3>
              <img src={imageBase64} height="120px" alt="uploaded-image" />
            </Container>
          )}
        </ModalConfirmContainer>
      ),
    });
  };

  const submitProduct = async () => {
    try {
      const body = {
        familyId: family.id,
        subfamilyId: subfamily.id,
        elementId: element.id,
        modelId: model.id,
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
        compatibility: compatibility || undefined,
        imageBase64: imageBase64 || undefined,
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
  return (
    <Modal
      visible={props.visible}
      onOk={() => confirmAddProduct()}
      onCancel={() => props.trigger && props.trigger(false)}
      width="90%"
      title="Nuevo ítem inventario"
    >
      <Grid gridTemplateRows="repeat(2, 1fr)" gridGap="1rem">
        <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="1rem">
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
        <Grid gridTemplateColumns="3fr 2fr 3fr 3fr" gridGap="1rem">
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
            value={suggestedPrice}
            onChange={(event) => setSuggestedPrice(event.target.value)}
            type="number"
            addonBefore="Precio S/"
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
          <Upload
            className="ant-upload-wrapper"
            beforeUpload={async (file) => {
              const encodedImage = await toBase64(file);
              setImageBase64(encodedImage);
            }}
            accept="image/png, image/jpeg"
          >
            <Button>
              <Icon icon={faUpload} />
              Imagen
            </Button>
          </Upload>
        </Grid>
        <div>
          <h3>Leyenda:</h3>
          <LegendsContainer justifyContent="space-around" padding="0px">
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
