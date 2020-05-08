import React, {useEffect, useState} from "react";
import {Input, Modal, notification, Tag, Upload} from "antd";
import {AutoComplete, Button, Container, Grid, Icon} from "../../components";
import {faUpload} from "@fortawesome/free-solid-svg-icons";
import {getElements, getFamilies, getModels, getSubfamilies, postProduct} from "../../providers";
import {toBase64} from "../../util";
import styled from "styled-components";

export const AddProduct = props => {
    const colors = ["#dc3546", "#28a746", "#17a3b8"];

    const [families, setFamilies] = useState([]);
    const [subfamilies, setSubfamilies] = useState([]);
    const [elements, setElements] = useState([]);
    const [models, setModels] = useState([]);
    const [family, setFamily] = useState({});
    const [subfamily, setSubfamily] = useState({});
    const [element, setElement] = useState({});
    const [model, setModel] = useState({});
    const [suggestedPrice, setSuggestedPrice] = useState(0);
    const [compatibility, setCompatibility] = useState(null);
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

        if (!family || !subfamily || !element || !model || !compatibility || !suggestedPrice) {
            return notification.error({
                message: "Error al intentar subir producto",
                description: "Verifique que todos los campos se hallan rellenado"
            });
        }

        Modal.confirm({
            width: "90%",
            title: "¿Está seguro de que desea crear este ítem en el inventario?",
            content: (
                <ModalConfirmContainer padding="0px"
                                       flexDirection="column">
                    <Container justifyContent="space-around"
                               padding="1rem 0">
                        <Tag>
                            {family.name}
                        </Tag>
                        <Tag>
                            {subfamily.name}
                        </Tag>
                        <Tag>
                            {element.name}
                        </Tag>
                        <Tag>
                            {model.name}
                        </Tag>
                    </Container>
                    <Container padding="0px"
                               flexDirection="column">
                        <h3>
                            <b>Precio:</b>
                            {suggestedPrice}
                        </h3>
                        <h3>
                            <b>Compatibilidad:</b>
                            {compatibility}
                        </h3>
                    </Container>
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
                compatibility,
                suggestedPrice,
                imageBase64
            };

            const response = await postProduct(body);

            console.log(response);
        } catch (error) {
            notification.error({
                message: "Error al intentar subir producto",
                description: error.message
            });
        }

    };

    return (
        <Modal visible
               onOk={() => confirmAddProduct()}
               width="90%"
               title="Nuevo ítem inventario">
            <Grid gridTemplateRows="repeat(2, 1fr)"
                  gridGap="1rem">
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
                                      setFamily({
                                          name: value,
                                      });
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
                                      setSubfamily({
                                          name: value,
                                      });
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
                                      setElement({
                                          name: value,
                                      });
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
                <Grid gridTemplateColumns="1fr 2fr 40%"
                      gridGap="1rem">
                    <Input value={suggestedPrice}
                           onChange={event => setSuggestedPrice(event.target.value)}
                           type="number"
                           addonBefore="Precio S/"/>
                    <Input value={compatibility}
                           onChange={event => setCompatibility(event.target.value)}
                           addonBefore="Compatibilidad"/>
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
                    <Container padding="0px"
                               width="30%"
                               justifyContent="space-between">
                        <Tag color={colors[0]}>
                            No seleccionado
                        </Tag>
                        <Tag color={colors[1]}>
                            Existente
                        </Tag>
                        <Tag color={colors[2]}>
                            Nuevo
                        </Tag>
                    </Container>
                </div>
            </Grid>
        </Modal>
    )
};

const ModalConfirmContainer = styled(Container)`
  .ant-tag {
    font-size: 1rem;
    margin: 0;
    padding: 1rem;
    text-align: center;
    min-width: 20%;
  }
`;
