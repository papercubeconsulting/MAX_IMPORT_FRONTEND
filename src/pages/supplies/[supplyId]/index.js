import React, {useEffect, useState} from "react";
import {Button, Container, Grid, Icon, Select} from "../../../components";
import {useRouter} from "next/router";
import {
    getElements,
    getFamilies,
    getModels,
    getProviders,
    getSubfamilies,
    getSupply,
    getWarehouses
} from "../../../providers";
import {get, orderBy} from "lodash";
import {Input, Table} from "antd";
import {faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";

export default ({setPageTitle}) => {
    setPageTitle("Abastecimiento");

    const columns = [
        {
            dataIndex: "id",
            width: "fit-content",
            align: "center",
            render: id => disabled
                ? null
                : <Button padding="0 0.5rem"
                          onClick={() => setSuppliedProducts(prevState => prevState
                              .filter((suppliedProduct => suppliedProduct.id !== id))
                              .map((suppliedProduct, index) => ({...suppliedProduct, id: index + 1}))
                          )}
                          type="primary">
                    <Icon marginRight="0px"
                          fontSize="0.8rem"
                          icon={faTrash}/>
                </Button>
        },
        {
            dataIndex: "id",
            title: "Ítem",
            width: "fit-content",
            align: "center"
        },
        {
            title: "Familia",
            dataIndex: "familyId",
            width: "fit-content",
            align: "center",
            render: (familyId, suppliedProduct) =>
                <Select value={familyId}
                        disabled={disabled}
                        onChange={value => setSuppliedProducts(prevState => {
                            const remainingSuppliedProducts = prevState
                                .filter(_suppliedProduct => _suppliedProduct.id !== suppliedProduct.id);

                            return [
                                ...remainingSuppliedProducts,
                                {
                                    id: suppliedProduct.id,
                                    quantity: suppliedProduct.quantity,
                                    boxSize: suppliedProduct.boxSize,
                                    familyId: value
                                }
                            ]
                        })}
                        options={selectOptions(families)}/>
        },
        {
            title: "Sub-Familia",
            dataIndex: "subfamilyId",
            width: "fit-content",
            align: "center",
            render: (subfamilyId, suppliedProduct) =>
                <Select value={subfamilyId}
                        disabled={disabled}
                        onChange={value => setSuppliedProducts(prevState => {
                            const remainingSuppliedProducts = prevState
                                .filter(_suppliedProduct => _suppliedProduct.id !== suppliedProduct.id);

                            return [
                                ...remainingSuppliedProducts,
                                {
                                    id: suppliedProduct.id,
                                    quantity: suppliedProduct.quantity,
                                    boxSize: suppliedProduct.boxSize,
                                    familyId: suppliedProduct.familyId,
                                    subfamilyId: value
                                }
                            ]
                        })}
                        options={selectOptions(subfamilies.filter(subFamily => subFamily.familyId === suppliedProduct.familyId))}/>
        },
        {
            title: "Elemento",
            dataIndex: "elementId",
            width: "fit-content",
            align: "center",
            render: (elementId, suppliedProduct) =>
                <Select value={elementId}
                        disabled={disabled}
                        onChange={value => setSuppliedProducts(prevState => {
                            const remainingSuppliedProducts = prevState
                                .filter(_suppliedProduct => _suppliedProduct.id !== suppliedProduct.id);

                            return [
                                ...remainingSuppliedProducts,
                                {
                                    id: suppliedProduct.id,
                                    quantity: suppliedProduct.quantity,
                                    boxSize: suppliedProduct.boxSize,
                                    familyId: suppliedProduct.familyId,
                                    subfamilyId: suppliedProduct.subfamilyId,
                                    elementId: value
                                }
                            ]
                        })}
                        options={selectOptions(elements.filter(element => element.subfamilyId === suppliedProduct.subfamilyId))}/>
        },
        {
            title: "Modelo",
            dataIndex: "modelId",
            width: "fit-content",
            align: "center",
            render: (modelId, suppliedProduct) =>
                <Select value={modelId}
                        disabled={disabled}
                        onChange={value => setSuppliedProducts(prevState => {
                            const remainingSuppliedProducts = prevState
                                .filter(_suppliedProduct => _suppliedProduct.id !== suppliedProduct.id);

                            return [
                                ...remainingSuppliedProducts,
                                {
                                    id: suppliedProduct.id,
                                    quantity: suppliedProduct.quantity,
                                    boxSize: suppliedProduct.boxSize,
                                    familyId: suppliedProduct.familyId,
                                    subfamilyId: suppliedProduct.subfamilyId,
                                    elementId: suppliedProduct.elementId,
                                    modelId: value
                                }
                            ]
                        })}
                        options={selectOptions(models.filter(model => model.elementId === suppliedProduct.elementId))}/>
        },
        {
            title: "Unidades por caja",
            dataIndex: "boxSize",
            width: "fit-content",
            align: "center",
            render: (boxSize, suppliedProduct) =>
                <Input key={suppliedProducts.length}
                       defaultValue={boxSize}
                       disabled={disabled}
                       onChange={event => {
                           setSuppliedProducts(prevState => {
                               const remainingSuppliedProducts = prevState
                                   .filter(_suppliedProduct => _suppliedProduct.id !== suppliedProduct.id);

                               return [
                                   ...remainingSuppliedProducts,
                                   {
                                       ...suppliedProduct,
                                       boxSize: parseFloat(event.nativeEvent.target.value || "0")
                                   }
                               ]
                           });
                           event.persist();
                       }}
                       type="number"/>
        },
        {
            title: "Cantidad Cajas",
            dataIndex: "quantity",
            width: "fit-content",
            align: "center",
            render: (quantity, suppliedProduct) =>
                <Input key={suppliedProducts.length}
                       defaultValue={quantity}
                       disabled={disabled}
                       onChange={event => {
                           setSuppliedProducts(prevState => {
                               const remainingSuppliedProducts = prevState
                                   .filter(_suppliedProduct => _suppliedProduct.id !== suppliedProduct.id);

                               return [
                                   ...remainingSuppliedProducts,
                                   {
                                       ...suppliedProduct,
                                       quantity: parseFloat(event.nativeEvent.target.value || "0")
                                   }
                               ]
                           });
                           event.persist();
                       }}
                       type="number"/>
        }
    ];

    const [providers, setProviders] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    const [supply, setSupply] = useState(null);
    const [providerId, setProviderId] = useState(null);
    const [warehouseId, setWarehouseId] = useState(null);
    const [code, setCode] = useState(null);
    const [suppliedProducts, setSuppliedProducts] = useState([]);

    const [families, setFamilies] = useState([]);
    const [subfamilies, setSubfamilies] = useState([]);
    const [elements, setElements] = useState([]);
    const [models, setModels] = useState([]);

    const router = useRouter();
    const {supplyId} = router.query;

    const disabled = get(supply, "status", null) !== "Pendiente";

    useEffect(() => {
        const fetchProviders = async () => {
            const _providers = await getProviders();
            setProviders(_providers);
        };
        fetchProviders();
    }, []);

    useEffect(() => {
        const fetchWarehouses = async () => {
            const _warehouses = await getWarehouses("Almacén");
            setWarehouses(_warehouses);
        };
        fetchWarehouses();
    }, []);

    useEffect(() => {
        const fetchFamilies = async () => {
            const _families = await getFamilies();
            setFamilies(_families);
        };
        fetchFamilies();
    }, []);

    useEffect(() => {
        const fetchSubfamilies = async () => {
            const _subfamilies = await getSubfamilies();
            setSubfamilies(_subfamilies);
        };
        fetchSubfamilies();
    }, []);

    useEffect(() => {
        const fetchElements = async () => {
            const _elements = await getElements();
            setElements(_elements);
        };
        fetchElements();
    }, []);

    useEffect(() => {
        const fetchModels = async () => {
            const _models = await getModels();
            setModels(_models);
        };
        fetchModels();
    }, []);

    useEffect(() => {
        const fetchSupply = async supplyId => {
            const _supply = await getSupply(supplyId);

            setSupply(_supply);
            setProviderId(get(_supply, "providerId", null));
            setWarehouseId(get(_supply, "warehouseId", null));
            setSuppliedProducts(get(_supply, "suppliedProducts", [])
                .map((suppliedProduct, index) => ({
                    id: index + 1,
                    familyId: get(suppliedProduct, "product.familyId", null),
                    subfamilyId: get(suppliedProduct, "product.subfamilyId", null),
                    elementId: get(suppliedProduct, "product.elementId", null),
                    modelId: get(suppliedProduct, "product.modelId", null),
                    quantity: get(suppliedProduct, "quantity", null),
                    boxSize: get(suppliedProduct, "boxSize", null),
                }))
            )
        };

        if (supplyId) fetchSupply(supplyId);
    }, [supplyId]);

    useEffect(() => {
        console.log(suppliedProducts);
    }, [suppliedProducts]);

    const selectOptions = collection => collection
        .map(document => ({
                value: document.id,
                label: document.name
            })
        );

    return <>
        <Container height="10%">
            <Grid gridTemplateColumns="1fr 1fr 2fr"
                  gridGap="2rem">
                <Select value={providerId}
                        disabled={disabled}
                        label="Proveedor"
                        onChange={value => setProviderId(value)}
                        options={selectOptions(providers)}/>
                <Select value={warehouseId}
                        disabled={disabled}
                        label="Almacén"
                        onChange={value => setWarehouseId(value)}
                        options={selectOptions(warehouses)}/>
                <Input value={code}
                       disabled={disabled}
                       onChange={event => setCode(event.target.value)}
                       addonBefore="Código de Carga"/>
            </Grid>
        </Container>
        <Table columns={columns}
               bordered
               pagination={false}
               dataSource={orderBy(suppliedProducts, "id", "asc")}/>
        <Container height="5rem">
            <Button padding="0 0.5rem"
                    onClick={() => setSuppliedProducts(prevState => [...prevState, {id: suppliedProducts.length + 1}])}
                    type="primary">
                <Icon fontSize="1rem"
                      icon={faPlus}/>
                Agregar columna
            </Button>

        </Container>
        <Container height="20%"
                   justifyContent="space-around">
            <Button size="large"
                    width="80%"
                    type="primary">
                Mover Caja
            </Button>
        </Container>
    </>
};
