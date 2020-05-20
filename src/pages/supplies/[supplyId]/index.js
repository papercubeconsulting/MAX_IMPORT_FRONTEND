import React, {useEffect, useState} from "react";
import {Button, Container, Grid, Select} from "../../../components";
import {useRouter} from "next/router";
import {getElements, getFamilies, getProviders, getSubfamilies, getSupply, getWarehouses} from "../../../providers";
import {get, orderBy} from "lodash";
import {Input, Table} from "antd";

export default ({setPageTitle}) => {
    setPageTitle("Abastecimiento");

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            width: "fit-content",
            align: "center",
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
                                    familyId: suppliedProduct.familyId,
                                    subfamilyId: suppliedProduct.subfamilyId,
                                    elementId: value
                                }
                            ]
                        })}
                        options={selectOptions(subfamilies.filter(subFamily => subFamily.familyId === suppliedProduct.familyId))}/>
        },
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
        const fetchSupply = async supplyId => {
            const _supply = await getSupply(supplyId);

            setSupply(_supply);
            setProviderId(get(_supply, "providerId", null));
            setWarehouseId(get(_supply, "warehouseId", null));
            setSuppliedProducts(get(_supply, "suppliedProducts", [])
                .map(suppliedProduct => ({
                    id: suppliedProduct.id,
                    familyId: get(suppliedProduct, "product.id", null)
                }))
            )
        };

        if (supplyId) fetchSupply(supplyId);
    }, [supplyId]);

    const selectOptions = collection => collection
        .map(document => ({
                value: document.id,
                label: document.name
            })
        );

    return <>
        <Container height="20%">
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
               dataSource={orderBy(suppliedProducts, "id", "asc")}/>
        <Container height="15%"
                   justifyContent="space-around">
            <Button size="large"
                    width="80%"
                    type="primary">
                Mover Caja
            </Button>
        </Container>
    </>
};
