import React, { useEffect, useState } from "react";
import { Input, Modal, notification, Tag, Upload, Radio } from "antd";
import { RadioGroup } from "../RadioGroup";
import { Button, Container, Grid, Icon, Select } from "../index";
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

export const AddProforma = (props) => {
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
  const [tradename, setTradename] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const _families = await getFamilies();

        setFamilies(_families);

        const _providers = await getProviders();

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
    if (suggestedPrice <= 0) {
      return notification.error({
        message: "Error al intentar subir producto",
        description: "El precio debe ser mayor que 0",
      });
    }

    if (!provider.id) {
      return notification.error({
        message: "Error al intentar subir producto",
        description: "Elija un proveedor de la lista indicada",
      });
    }

    if (
      !provider ||
      !family ||
      !subfamily ||
      !element ||
      !model ||
      !tradename ||
      !suggestedPrice
    ) {
      return notification.error({
        message: "Error al intentar subir producto",
        description: "Verifique que todos los campos se hallan rellenado",
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
        suggestedPrice,
        compatibility: compatibility || undefined,
        imageBase64: imageBase64 || undefined,
      };

      props.trigger(false);

      const response = await postProduct(body);

      Modal.success({
        title: "Producto creado correctamente",
        content: `Código de inventario: ${response.code}`,
      });
    } catch (error) {
      Modal.error({
        title: "Error al intentar mover la caja",
        content: error.message,
      });
    }
  };

  return (
    <Modal
      visible={props.visible}
      onOk={() => confirmAddProduct()}
      onCancel={() => props.trigger && props.trigger(false)}
      width="60%"
      title="¿Está seguro de realizar la venta?"
    >
      <Grid gridTemplateRows="repeat(1, 1fr)" gridGap="1rem">
        <Grid gridTemplateColumns="repeat(3, 1fr)" gridGap="1rem">
          <h3>Forma de pago:</h3>
          <RadioGroup
            gridColumnStart="2"
            gridColumnEnd="4"
            gridTemplateColumns="repeat(2, 1fr)"
            //onChange={this.onChange}
            //value={value}
          >
            <Radio value={1}>Venta</Radio>
            <Radio value={2}>Consignación</Radio>
          </RadioGroup>
          <h3>Tipo de venta:</h3>
          <RadioGroup
            gridColumnStart="2"
            gridColumnEnd="4"
            gridTemplateColumns="repeat(2, 1fr)"
            //onChange={this.onChange}
            //value={value}
          >
            <Radio value={1}>Contado</Radio>
            <Radio value={2}>Crédito</Radio>
          </RadioGroup>{" "}
        </Grid>

        <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="1rem">
          <Input
            value={suggestedPrice}
            //onChange={event => setSuggestedPrice(event.target.value)}
            type="number"
            addonBefore="A cuenta S/."
          />
          <Input
            value={suggestedPrice}
            //onChange={event => setSuggestedPrice(event.target.value)}
            type="number"
            addonBefore="Total deuda S/."
          />
        </Grid>

        <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="1rem">
          <h3>Datos del depósito:</h3>
          <div></div>
          <Input //value={suggestedPrice}
            //onChange={event => setSuggestedPrice(event.target.value)}
            type="text"
            placeholder="Nº Operación"
            addonBefore="Voucher"
          />
          <Select //value={provider.name}
            label="Banco"
            /*onChange={value => {
                                const _provider = providers.find(provider => provider.id === value);
                                setProvider(_provider);
                            }} */
            options={selectOptions(providers)}
          />
          <Select //value={provider.name}
            label="Cuenta"
            /*onChange={value => {
                                const _provider = providers.find(provider => provider.id === value);
                                setProvider(_provider);
                            }} */
            options={selectOptions(providers)}
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

        <Grid gridTemplateColumns="repeat(3, 1fr)" gridGap="1rem">
          <h3>Forma de despacho:</h3>
          <RadioGroup
            gridColumnStart="2"
            gridColumnEnd="2"
            gridTemplateColumns="repeat(2, 1fr)"
            //onChange={this.onChange}
            //value={value}
          >
            <Radio value={1}>Tienda</Radio>
            <Radio value={2}>Envío</Radio>
          </RadioGroup>
          <Select //value={provider.name}
            label="Agencia"
            /*onChange={value => {
                                const _provider = providers.find(provider => provider.id === value);
                                setProvider(_provider);
                            }} */
            options={selectOptions(providers)}
          />
        </Grid>
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
