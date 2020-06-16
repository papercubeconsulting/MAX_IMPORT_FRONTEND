import React, {useMemo, useState, useEffect} from "react";
import {Container, Grid, Select, Button, Icon} from "../../../components";
import {useRouter} from "next/router";
import {getProductBox, putProductBox, getWarehouses} from "../../../providers";
import {get} from "lodash";
import {Input, Modal, Table, Tag, notification} from "antd";
import {faPeopleCarry} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import moment from 'moment-timezone';

export default ({setPageTitle}) => {

    setPageTitle("Caja de productos");
    const productBoxLogColumns = [
        {
            width: '20%',
            title: "Fecha",
            dataIndex: "createdAt",
            key: 'date',
            align: "center",
            render: datetime => moment(datetime).tz('America/Lima').locale('es').format('dddd LL'),
        },
        {
            width: '20%',
            title: "Hora",
            dataIndex: "createdAt",
            key: 'time',
            align: "center",
            render: datetime => moment(datetime).tz('America/Lima').locale('es').format('h:mm a'),
        },
        {
            width: '20%',
            title: "Usuario",
            dataIndex: "user",
            align: "center",
        },
        {
            width: '20%',
            title: "Ubicación",
            dataIndex: "warehouse",
            align: "center",
            render: warehouse => warehouse.name,
        },
        {
            width: '20%',
            title: "Acción",
            dataIndex: "log",
            align: "center",
        }
    ];

    const [productBox, setProductBox] = useState(null);
    const [product, setProduct] = useState(null);
    const [newWarehouse, setNewWarehouse] = useState({});
    const [warehouses, setWarehouses] = useState([]);
    // const [productBoxLogs, setProductBoxLogs] = useState(null);

    const router = useRouter();
    const {productBoxCode} = router.query;

    useMemo(() => {
        const fetchProductBox = async () => {
            try {
                const _productBox = await getProductBox(productBoxCode);
                setProductBox(_productBox);
                setProduct(get(_productBox, 'product', {}));
                // setProductBoxLogs(get(_productBox, 'productBoxLogs', []));                

            } catch (error) {
                Modal.error({

                    title: "Código no encontrado",
                    content: error.message,
                    onOk: () => router.back()
                });   
            }
        };

        productBoxCode && fetchProductBox();
    }, [router]);

    useEffect(() => {
        const fetchWarehouses = async () => {
            const _warehouses = await getWarehouses();
            setWarehouses(_warehouses);
        };
        fetchWarehouses();
    }, []);

    const selectOptions = collection => collection.map(document => ({
        label: document.name,
        value: document.id
    }));
    const confirmMoveProductBox = () => {
        if (!newWarehouse.id || newWarehouse.id === productBox.warehouseId) {
            return notification.error({
                message: "Error al intentar mover la caja",
                description: "Debe seleccionar una ubicación distinta a la actual"
            });
        }

        Modal.confirm({
            width: "50%",
            title: "¿Está seguro de que desea cambiar la ubicación de la caja?",
            onOk: async () => moveProductBox(),
            content: (
                <Container padding="0px"
                           flexDirection="column">
                    <Grid gridTemplateColumns="repeat(3, 1fr)"
                        gridTemplateRows="repeat(1, 1fr)"
                        justifyContent="center"
                        gridGap="1rem">

                            <Input  disabled
                                addonBefore="Código de caja"
                                value={productBoxCode}/>
                            <Input  disabled
                                addonBefore="Ubicación actual"
                                value={productBox.warehouse.name}/>
                            <Input  disabled
                                addonBefore="Nueva ubicación"
                                value={newWarehouse.name}/>
                    </Grid>
                </Container>
            )
        })

    };

    const moveProductBox = async () => {
        try {
            const body = {
                message: 'Movimiento de caja',
                warehouseId: newWarehouse.id
            };

            // props.trigger(false);

            const response = await putProductBox(productBox.id, body);

            Modal.success({
                title: "Se ha movida la caja correctamente",
                content: `Caja: ${productBoxCode} | Nueva ubicación: ${newWarehouse.name}`,
                onOk: () => router.reload()
            });
        } catch (error) {
            Modal.error({
                title: "Error al intentar subir producto",
                content: error.message,
                // onOk: () => props.toggleUpdateTable(prevState => !prevState)
            });
        }

    };
    return <>
        <Container height="20%"
                   flexDirection="column">
            <Grid gridTemplateRows="1fr 2fr"
                  gridGap="1rem">
                      
                <Grid gridTemplateColumns="repeat(4, 1fr)"
                      gridTemplateRows="repeat(1, 2rem)"
                      gridGap="1rem">                    
                    <Input disabled
                        addonBefore="Código Inventario"
                        value={get(product, "code", "-")}/>
                    <Input disabled
                        addonBefore="Código de caja"
                        value={get(productBox, "trackingCode", "-")}/>
                    <Input disabled
                        addonBefore="Código de abastecimiento"
                        value={get(productBox, "supplyId", "-")}/>
                    <Input disabled
                        addonBefore="Correlativo en abastecimiento"
                        value={get(productBox, "indexFromSupliedProduct", "-")}/>
                </Grid>
                <Grid gridTemplateColumns="repeat(4, 1fr)"
                      gridTemplateRows="repeat(2, 2rem)"
                      gridGap="1rem">
                    <Input disabled
                           addonBefore="Familia"
                           value={get(product, "familyName", "-")}/>
                    <Input disabled
                           addonBefore="Sub-Familia"
                           value={get(product, "subfamilyName", "-")}/>
                    <Input disabled
                           addonBefore="Elemento"
                           value={get(product, "elementName", "-")}/>
                    <Input disabled
                           addonBefore="Modelo"
                           value={get(product, "modelName", "-")}/>
                    <Input disabled
                            addonBefore="Proveedor"
                            value={get(product, "provider.name", "-")}/>
                    <Input disabled
                            addonBefore="Ubicación"
                            value={`${get(productBox, "warehouse.name", "-")} (${get(productBox, "warehouse.type", "-")})`}/>
                    <Input disabled
                            addonBefore="Unidades/caja"
                            value={get(productBox, "boxSize", "-")}/>
                    <Input disabled
                            addonBefore="Unidades disponibles"
                            value={get(productBox, "stock", "-")}/>
                </Grid>
            </Grid>
        </Container>
        <Container height="20%"
                //    width="50%"
                   flexDirection="column"
                   textAlign="center"
                   justifyContent="center"
                   alignItems="center"
                   padding="1rem">
                      
                <h3>
                    Movimiento de caja
                </h3> 
                <Grid gridTemplateColumns="2fr 1fr"
                    gridTemplateRows="repeat(1, 1fr)"
                    justifyContent="center"
                    gridGap="1rem">
                    <Select value={newWarehouse.name}
                            label="Ubicación destino"                            
                            onChange={value => {
                                const _warehouse = warehouses.find(warehouse => warehouse.id === value);
                                setNewWarehouse(_warehouse);
                            }}
                            options={selectOptions(warehouses)}/>
                    <Button onClick={() => confirmMoveProductBox()}
                        type="primary">
                        <Icon icon={faPeopleCarry}/>
                        Mover
                    </Button>
                </Grid>
        </Container>
        <Container height="60%"
                   flexDirection="column"
                   textAlign="center"
                   padding="1rem 0">
            <Grid gridTemplateRows="repeat(1, auto)"
                  gridGap="1rem">
                <div>
                    <h3>
                        Bitácora de movimientos de caja
                    </h3>
                    <br/>
                    <Table columns={productBoxLogColumns}
                           bordered
                           scrollToFirstRowOnChange
                           pagination={false}
                           rowKey='id'
                           dataSource={get(productBox, "productBoxLogs", [])}/>
                </div>
            </Grid>
        </Container>
    </>
};
