import React, {useEffect, useState} from "react";
import {Input, Modal, notification, Tag, Upload} from "antd";
import {AutoComplete, Button, Container, Grid, Icon} from "../index";
import {faUpload} from "@fortawesome/free-solid-svg-icons";
import {getElements, getFamilies, getModels, getSubfamilies, postProduct} from "../../providers";
import {toBase64} from "../../util";
import styled from "styled-components";

export const AddProduct = props => {
    const colors = ["#dc3546", "#28a746", "#17a3b8"];

    // * List of sources from database
    const [families, setFamilies] = useState([]);
    const [subfamilies, setSubfamilies] = useState([]);
    const [elements, setElements] = useState([]);
    const [models, setModels] = useState([]);

    // * Fields to create source
    const [family, setFamily] = useState({});
    const [subfamily, setSubfamily] = useState({});
    const [element, setElement] = useState({});
    const [model, setModel] = useState({});
    const [suggestedPrice, setSuggestedPrice] = useState(0);
    const [compatibility, setCompatibility] = useState(null);
    const [tradename, setTradename] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);

    useEffect(() => {
        const initialize = async () => {
            try {
                const _families = await getFamilies();

                setFamilies(_families);
            } catch (error) {
                notification.error({
                    message: "Error en el servidor",
                    description: error.message
                })
            }
        };

        initialize();
    }, []);

    useEffect(() => {
        const fetchSubfamilies = async () => {
            try {
                setSubfamilies([]);
                setSubfamily(prevState => ({...prevState, id: null}));

                if (family.id) {
                    const _subfamilies = await getSubfamilies(family.id);
                    setSubfamilies(_subfamilies)
                }
            } catch (error) {
                notification.error({
                    message: "Error en el servidor",
                    description: error.message
                })
            }
        };

        fetchSubfamilies();
    }, [family]);

    useEffect(() => {
        const fetchElements = async () => {
            try {
                setElements([]);
                setElement(prevState => ({...prevState, id: null}));

                if (subfamily.id) {
                    const _elements = await getElements(subfamily.id);
                    setElements(_elements)
                }
            } catch (error) {
                notification.error({
                    message: "Error en el servidor",
                    description: error.message
                })
            }
        };

        fetchElements();
    }, [subfamily]);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                setModels([]);
                setModel(prevState => ({...prevState, id: null}));

                if (element.id) {
                    const _models = await getModels(element.id);
                    setModels(_models)
                }
            } catch (error) {
                notification.error({
                    message: "Error en el servidor",
                    description: error.message
                })
            }
        };

        fetchModels();
    }, [element]);

    const selectOptions = collection => collection.map(document => ({
        label: document.name,
        value: document.id
    }));

    const autoCompleteColor = (id, name) => {
        if (id) return colors[1];
        if (name) return colors[2];
        return colors[0]
    };

    const confirmAddProduct = () => {
        if (suggestedPrice <= 0) {
            return notification.error({
                message: "Error al intentar subir producto",
                description: "El precio debe ser mayor que 0"
            });
        }

        if (!family || !subfamily || !element || !model || !compatibility || !tradename || !suggestedPrice) {
            return notification.error({
                message: "Error al intentar subir producto",
                description: "Verifique que todos los campos se hallan rellenado"
            });
        }

        Modal.confirm({
            width: "90%",
            title: "¿Está seguro de que desea crear este ítem en el inventario?",
            onOk: async () => submitProduct(),
            content: (
                <ModalConfirmContainer padding="0px"
                                       flexDirection="column">
                    <Container justifyContent="space-around"
                               padding="1rem 0">
                        <Tag>
                            {`${family.name} (${family.code})`}
                        </Tag>
                        <Tag>
                            {`${subfamily.name} (${subfamily.code})`}
                        </Tag>
                        <Tag>
                            {`${element.name} (${element.code})`}
                        </Tag>
                        <Tag>
                            {`${model.name}`}
                        </Tag>
                    </Container>
                    <Container padding="1rem 0"
                               flexDirection="column">
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
                    {
                        imageBase64 &&
                        <Container padding="0px"
                                   alignItems="center"
                                   flexDirection="column">
                            <h3>
                                <b>Vista previa imagen:</b>
                            </h3>
                            <img src={imageBase64}
                                 height="120px"
                                 alt="uploaded-image"/>
                        </Container>
                    }
                </ModalConfirmContainer>
            )
        })

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
                providerId: 1, // TODO: Update
                tradename,
                compatibility,
                suggestedPrice,
                imageBase64: imageBase64 || undefined
            };

            props.trigger(false);

            const response = await postProduct(body);

            Modal.success({
                title: "Producto creado correctamente",
                content: `Código de inventario: ${response.data.id}`,
                onOk: () => props.toggleUpdateTable(prevState => !prevState)
            });
        } catch (error) {
            Modal.error({
                title: "Error al intentar subir producto",
                content: error.message,
                onOk: () => props.toggleUpdateTable(prevState => !prevState)
            });
        }

    };
    return (
        <Modal visible={props.visible}
               onOk={() => confirmAddProduct()}
               onCancel={() => props.trigger && props.trigger(false)}
               width="90%"
               title="Nuevo ítem inventario">
            <Grid gridTemplateRows="repeat(2, 1fr)"
                  gridGap="1rem">
                <Grid gridTemplateColumns="repeat(4, 1fr)"
                      gridGap="1rem">
                    <Input  value={family.code}
                            disabled={family.id}
                            onChange={event => {
                                const newValue = event.target.value;
                                setFamily(prevValue => ({name: prevValue.name, code: newValue}))
                            }}
                            addonBefore="Código"/>
                    <Input value={subfamily.code}
                            disabled={subfamily.id}
                            onChange={event => {
                                const newValue = event.target.value;
                                setSubfamily(prevValue => ({name: prevValue.name, code: newValue}))
                            }}
                            addonBefore="Código"/>
                    <Input value={element.code}
                            disabled={element.id}
                            onChange={event => {
                                const newValue = event.target.value;
                                setElement(prevValue => ({name: prevValue.name, code: newValue}))
                            }}
                            addonBefore="Código"/>
                </Grid>
                <Grid gridTemplateColumns="repeat(4, 1fr)"
                      gridGap="1rem">
                    <AutoComplete label="Familia"
                                  color={autoCompleteColor(family.id, family.name)}
                                  value={family.name}
                                  onSelect={value => {
                                      const _family = families.find(family => family.id === value);
                                      setFamily(_family);
                                  }}
                                  onSearch={value => {
                                      setFamily(prevValue => ({
                                          name: value,
                                          code: (prevValue.id) ? '' : prevValue.code
                                      }));
                                  }}
                                  _options={selectOptions(families)}
                                  filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())
                                  }/>
                    <AutoComplete label="Sub-Familia"
                                  color={autoCompleteColor(subfamily.id, subfamily.name)}
                                  value={subfamily.name}
                                  onSelect={value => {
                                      const _subfamily = subfamilies.find(subfamily => subfamily.id === value);
                                      setSubfamily(_subfamily);
                                  }}
                                  onSearch={value => {
                                      setSubfamily(prevValue => ({
                                        name: value,
                                        code: (prevValue.id) ? '' : prevValue.code
                                    }));
                                  }}
                                  _options={selectOptions(subfamilies)}
                                  filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())
                                  }/>
                    <AutoComplete label="Elemento"
                                  color={autoCompleteColor(element.id, element.name)}
                                  value={element.name}
                                  onSelect={value => {
                                      const _element = elements.find(element => element.id === value);
                                      setElement(_element);
                                  }}
                                  onSearch={value => {
                                      setElement(prevValue => ({
                                        name: value,
                                        code: (prevValue.id) ? '' : prevValue.code
                                    }));
                                  }}
                                  _options={selectOptions(elements)}
                                  filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())
                                  }/>
                    <AutoComplete label="Modelo"
                                  color={autoCompleteColor(model.id, model.name)}
                                  value={model.name}
                                  onSelect={value => {
                                      const _model = models.find(model => model.id === value);
                                      setModel(_model);
                                  }}
                                  onSearch={value => {
                                      setModel({
                                          name: value,
                                      });
                                  }}
                                  _options={selectOptions(models)}
                                  filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())
                                  }/>
                </Grid>
                <Grid gridTemplateColumns="1fr 2fr 2fr 20%"
                      gridGap="1rem">
                    <Input value={suggestedPrice}
                           onChange={event => setSuggestedPrice(event.target.value)}
                           type="number"
                           addonBefore="Precio S/"/>
                    <Input value={compatibility}
                           onChange={event => setCompatibility(event.target.value)}
                           addonBefore="Compatibilidad"/>                           
                    <Input value={tradename}
                           onChange={event => setTradename(event.target.value)}
                           addonBefore="Nombre comercial"/>
                    <Upload className="ant-upload-wrapper"
                            beforeUpload={async file => {
                                const encodedImage = await toBase64(file);
                                setImageBase64(encodedImage);
                            }}
                            accept="image/png, image/jpeg">
                        <Button>
                            <Icon icon={faUpload}/>
                            Imagen
                        </Button>
                    </Upload>
                </Grid>
                <div>
                    <h3>
                        Leyenda:
                    </h3>
                    <LegendsContainer justifyContent="space-around"
                                      padding="0px">
                        <Tag color={colors[0]}>
                            No seleccionado
                        </Tag>
                        <Tag color={colors[1]}>
                            Existente
                        </Tag>
                        <Tag color={colors[2]}>
                            Nuevo
                        </Tag>
                    </LegendsContainer>
                </div>
            </Grid>
        </Modal>
    )
};

const LegendsContainer = styled(Container)`
  .ant-tag {
    font-size: 1rem;
    margin: 0;
    padding: 1rem;
    text-align: center;
    min-width: 20%;
    border-radius: 1rem;
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
