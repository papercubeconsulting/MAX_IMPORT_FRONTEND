import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import {Button, Container, Grid, Select} from "../../components";
import {Input, notification, Table} from "antd";
import {getElements, getFamilies, getModels, getProducts, getSubfamilies} from "../../providers";
import {urlQueryParams} from "../../util";
import {get} from "lodash";
import {AddProduct} from "./AddProduct";

export default ({setPageTitle}) => {
    let columns;
    setPageTitle("Inventario");

    columns = [
        {
            title: "Cód. Inv.",
            dataIndex: "id",
            width: "fit-content",
            align: "center"
        },
        {
            title: "Familia",
            dataIndex: "familyName",
            width: "fit-content",
            align: "center"
        },
        {
            title: "Sub-Familia",
            dataIndex: "subfamilyName",
            width: "fit-content",
            align: "center"
        },
        {
            title: "Elemento",
            dataIndex: "elementName",
            width: "fit-content",
            align: "center"
        },
        {
            title: "Modelo",
            dataIndex: "modelName",
            width: "fit-content",
            align: "center"
        },
        {
            title: "Stock",
            dataIndex: "totalStock",
            width: "fit-content",
            align: "center"
        },
        {
            title: "En Tienda",
            dataIndex: "stockByWarehouseType",
            width: "fit-content",
            align: "center",
            render: stockByWarehouseTypeArray => {
                const _stock = stockByWarehouseTypeArray.find(stockByWarehouseType =>
                    stockByWarehouseType.warehouseType === "Tienda"
                );

                return get(_stock, "stock", 0);
            }
        },
        {
            title: "En Almacén",
            dataIndex: "stockByWarehouseType",
            width: "fit-content",
            align: "center",
            render: stockByWarehouseTypeArray => {
                const _stock = stockByWarehouseTypeArray.find(stockByWarehouseType =>
                    stockByWarehouseType.warehouseType === "Almacén"
                );

                return get(_stock, "stock", 0);
            }
        },
        {
            title: "En Techo",
            dataIndex: "stockByWarehouseType",
            width: "fit-content",
            align: "center",
            render: stockByWarehouseTypeArray => {
                const _stock = stockByWarehouseTypeArray.find(stockByWarehouseType =>
                    stockByWarehouseType.warehouseType === "Averiado"
                );

                return get(_stock, "stock", 0);
            }
        }
    ];

    const [windowHeight, setWindowHeight] = useState(0);
    const [pagination, setPagination] = useState(null);

    const [families, setFamilies] = useState([]);
    const [subfamilies, setSubfamilies] = useState([]);
    const [elements, setElements] = useState([]);
    const [models, setModels] = useState([]);
    const [products, setProducts] = useState([]);

    const [page, setPage] = useState(null);
    const [stock, setStock] = useState(null);
    const [code, setCode] = useState(null);
    const [familyId, setFamilyId] = useState(null);
    const [subfamilyId, setSubfamilyId] = useState(null);
    const [elementId, setElementId] = useState(null);
    const [modelId, setModelId] = useState(null);

    const stateUpdateOrigin = useRef("url");

    const router = useRouter();
    const queryParams = router.query;

    useEffect(() => {
        setWindowHeight(window.innerHeight);
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const _products = await getProducts(queryParams);
                setPagination({
                    position: ["bottomCenter"],
                    total: _products.count,
                    current: _products.page,
                    pageSize: _products.pageSize,
                    showSizeChanger: false
                });
                setProducts(_products.rows);
            } catch (error) {
                notification.error({
                    message: "Error en el servidor",
                    description: error.message
                })
            }
        };

        if (stateUpdateOrigin.current === "url") urlToState();
        fetchProducts();
    }, [queryParams]);

    useEffect(() => {
        if (stateUpdateOrigin.current === "manual")
            stateToUrl();
    }, [page, stock, code, familyId, subfamilyId, elementId, modelId]);

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
                if (stateUpdateOrigin.current !== "url") {
                    setSubfamilies([]);
                    setSubfamilyId(null);
                }

                if (familyId) {
                    const _subfamilies = await getSubfamilies(familyId);
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
    }, [familyId]);

    useEffect(() => {
        const fetchElements = async () => {
            try {
                if (stateUpdateOrigin.current !== "url") {
                    setElements([]);
                    setElementId(null);
                }

                if (subfamilyId) {
                    const _elements = await getElements(subfamilyId);
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
    }, [subfamilyId]);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                if (stateUpdateOrigin.current !== "url") {
                    setModels([]);
                    setModelId(null);
                }

                if (elementId) {
                    const _models = await getModels(elementId);
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
    }, [elementId]);

    const urlToState = () => {
        setPage(Number.parseInt(queryParams.page) || null);
        setStock(queryParams.stock || null);
        setCode(Number.parseInt(queryParams.code) || null);
        setFamilyId(Number.parseInt(queryParams.familyId) || null);
        setSubfamilyId(Number.parseInt(queryParams.subfamilyId) || null);
        setElementId(Number.parseInt(queryParams.elementId) || null);
        setModelId(Number.parseInt(queryParams.modelId) || null);
    };

    const stateToUrl = async () => {
        const params = {};

        page && (params.page = page);
        stock && (params.stock = stock);
        code && (params.code = code);
        familyId && (params.familyId = familyId);
        familyId && subfamilyId && (params.subfamilyId = subfamilyId);
        subfamilyId && elementId && (params.elementId = elementId);
        elementId && modelId && (params.modelId = modelId);

        await router.push(`/products${urlQueryParams(params)}`);
    };

    const selectOptions = collection => {
        const options = collection.map(document => ({
                value: document.id,
                label: document.name
            })
        );

        const defaultOption = {
            value: null,
            label: "Todos"
        };

        return [defaultOption, ...options];
    };

    const updateState = (setState, value) => {
        stateUpdateOrigin.current = "manual";
        setState(value);
    };

    return <>
        <AddProduct/>
        <Container height="25%">
            <Grid gridTemplateColumns="repeat(3, 1fr)"
                  gridTemplateRows="repeat(2, 1fr)"
                  gridGap="2rem">
                <Select value={stock}
                        onChange={value => updateState(setStock, value)}
                        label="Stock"
                        options={[
                            {
                                value: null,
                                label: "Todos"
                            },
                            {
                                value: "yes",
                                label: "Sí"
                            }
                        ]}/>
                <Input value={code}
                       type="number"
                       onChange={event => updateState(setCode, event.target.value)}
                       addonBefore="Código de inventario"/>
                <Select value={familyId}
                        onChange={value => updateState(setFamilyId, value)}
                        label="Familia"
                        options={selectOptions(families)}/>
                <Select value={subfamilyId}
                        onChange={value => updateState(setSubfamilyId, value)}
                        label="Sub-Familia"
                        options={selectOptions(subfamilies)}/>
                <Select value={elementId}
                        onChange={value => updateState(setElementId, value)}
                        label="Elemento"
                        options={selectOptions(elements)}/>
                <Select value={modelId}
                        onChange={value => updateState(setModelId, value)}
                        label="Modelo"
                        options={selectOptions(models)}/>
            </Grid>
        </Container>
        <Table columns={columns}
               bordered
               scrollToFirstRowOnChange
               pagination={pagination}
               scroll={{y: windowHeight * 0.3}}
               onChange={pagination => updateState(setPage, pagination.current)}
               dataSource={products}/>
        <Container height="15%"
                   justifyContent="space-around">
            <Button size="large"
                    width="30%"
                    type="primary">
                Nuevo Ìtem Inventario
            </Button>
            <Button size="large"
                    width="30%"
                    type="primary">
                Mover Caja
            </Button>
        </Container>
    </>
};
