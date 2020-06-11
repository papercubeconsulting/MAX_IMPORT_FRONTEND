import React, {useEffect, useMemo, useState} from "react";
import {Button, Container, Grid, Icon, Select} from "../../../components";
import {useRouter} from "next/router";
import {
    getElements,
    getFamilies,
    getModels,
    getProducts,
    getProviders,
    getSubfamilies,
    getSupply,
    getWarehouses,
    postSupply,
    putSupply,
    putSupplyStatus
} from "../../../providers";
import {get, orderBy} from "lodash";
import {Input, notification, Table} from "antd";
import {faPlus, faPrint, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Attend} from "../../../components/supplies/[supplyId]";

export default ({setPageTitle}) => {
    setPageTitle("Abastecimiento");

    const columns = [
        {
            dataIndex: "id",
            width: "fit-content",
            align: "center",
            render: (id, suppliedProduct) => (
                <Button padding="0 0.5rem"
                        onClick={() => {
                            if (disabled) {
                                setAttendedProduct(suppliedProduct);
                                return setVisibleAttendModal(true);
                            }

                            setSuppliedProducts(prevState => prevState
                                .filter((suppliedProduct => suppliedProduct.id !== id))
                                .map((suppliedProduct, index) => ({...suppliedProduct, id: index + 1}))
                            )
                        }}
                        type="primary">
                    <Icon marginRight="0px"
                          fontSize="0.8rem"
                          icon={disabled ? faPrint : faTrash}/>
                </Button>
            )
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
                                    dbId: suppliedProduct.dbId,
                                    productBoxes: suppliedProduct.productBoxes,
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
                                    dbId: suppliedProduct.dbId,
                                    productBoxes: suppliedProduct.productBoxes,
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
                                    dbId: suppliedProduct.dbId,
                                    productBoxes: suppliedProduct.productBoxes,
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
                                    dbId: suppliedProduct.dbId,
                                    productBoxes: suppliedProduct.productBoxes,
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

    const [loadingSupply, setLoadingSupply] = useState(false);

    const [attendedProduct, setAttendedProduct] = useState(null);
    const [visibleAttendModal, setVisibleAttendModal] = useState(false);

    const router = useRouter();
    const {supplyId, operation} = router.query;

    const isNew = supplyId === "new";
    const isAttend = operation === "attend";
    const isEdit = get(supply, "status", null) === "Pendiente" && !isAttend;
    const disabled = !isEdit && !isNew;

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
            if (isNew) return;

            const _supply = await getSupply(supplyId);

            setSupply(_supply);
            setProviderId(get(_supply, "providerId", null));
            setWarehouseId(get(_supply, "warehouseId", null));
            setCode(get(_supply, "code", null));
            setSuppliedProducts(get(_supply, "suppliedProducts", [])
                .map((suppliedProduct, index) => ({
                    id: index + 1,
                    dbId: suppliedProduct.id,
                    productBoxes: suppliedProduct.productBoxes,
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

    const enablePost = useMemo(() => {
        if (!suppliedProducts.length) return false;

        return suppliedProducts.reduce((accumulator, suppliedProduct) => {
            const {familyId, subfamilyId, elementId, modelId, boxSize, quantity} = suppliedProduct;

            return accumulator && !!(familyId && subfamilyId && elementId && modelId && boxSize && quantity) && providerId && warehouseId && code;
        }, true);
    }, [suppliedProducts, providerId, warehouseId, code]);

    const selectOptions = collection => collection
        .map(document => ({
                value: document.id,
                label: document.name
            })
        );

    const onSubmit = async () => {
        try {
            setLoadingSupply(true);
            const mappedSuppliedProducts = await mapSuppliedProducts(suppliedProducts);

            const body = {
                suppliedProducts: mappedSuppliedProducts,
                providerId,
                warehouseId,
                code
            };

            if (isEdit)
                await putSupply(supplyId, body);
            else
                await postSupply(body);

            await router.push("/supplies");
            setLoadingSupply(false);
        } catch (error) {
            notification.error({
                message: "No se pudo crear abastecimiento",
                description: error.message
            })
            setLoadingSupply(false);
        }
    };

    const mapSuppliedProducts = async (products, index = 0, mappedSuppliedProducts = []) => {
        if (products.length === index) return mappedSuppliedProducts;

        const currentProduct = products[index];
        const {familyId, subfamilyId, elementId, modelId, boxSize, quantity} = currentProduct;

        const productsResult = await getProducts({
            familyId,
            subfamilyId,
            elementId,
            modelId
        });

        return mapSuppliedProducts(products, index + 1, [...mappedSuppliedProducts, {
            productId: productsResult.rows[0].id,
            boxSize,
            quantity
        }])
    }

    const finishAttend = async () => {
        try {
            setLoadingSupply(true);

            await putSupplyStatus(supplyId, "Atendido");
            await router.push("/supplies");

            setLoadingSupply(false);
        } catch (error) {
            setLoadingSupply(false);
            notification.error({
                message: "No se pudo finalizar atención",
                description: error.message
            })
        }
    }

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
        {
            !disabled &&
            <Container height="5rem">
                <Button padding="0 0.5rem"
                        onClick={() => setSuppliedProducts(prevState => [...prevState, {id: suppliedProducts.length + 1}])}
                        type="primary">
                    <Icon fontSize="1rem"
                          icon={faPlus}/>
                    Agregar columna
                </Button>
            </Container>
        }
        <Container height="20%"
                   alignItems="center"
                   flexDirection="column">
            {
                (isEdit || isNew) &&
                <Button size="large"
                        disabled={!enablePost}
                        loading={loadingSupply}
                        onClick={onSubmit}
                        margin="0 0 1rem 0"
                        width="80%"
                        type="primary">
                    {isEdit ? "Actualizar" : "Crear"} abastecimiento
                </Button>
            }
            {
                operation === "attend" &&
                <Button size="large"
                        width="80%"
                        onClick={finishAttend}
                        loading={loadingSupply}
                        type="primary">
                    Finalizar atención
                </Button>
            }
        </Container>
        {
            visibleAttendModal &&
            <Attend visible={visibleAttendModal}
                    supplyId={supplyId}
                    trigger={setVisibleAttendModal}
                    product={attendedProduct}/>
        }
    </>
};
