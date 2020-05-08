import React, {useMemo, useState} from "react";
import {Container, Grid} from "../../../components";
import {useRouter} from "next/router";
import {getProduct} from "../../../providers";
import {get} from "lodash";
import {Input, Modal, Table} from "antd";
import styled from "styled-components";

export default ({setPageTitle}) => {
    setPageTitle("Producto");

    const stockByWarehouseColumns = [
        {
            title: "Almacén",
            dataIndex: "warehouseName",
            align: "center"
        },
        {
            title: "Stock",
            dataIndex: "stock",
            align: "center"
        }
    ];

    const stockByWarehouseAndBoxSizeColumns = [
        {
            title: "Ubicación",
            dataIndex: "warehouseName",
            width: "fit-content",
            align: "center"
        },
        {
            title: "Cajas",
            dataIndex: "quantityBoxes",
            width: "fit-content",
            align: "center"
        },
        {
            title: "Uni/Caja",
            dataIndex: "boxSize",
            width: "fit-content",
            align: "center"
        },
        {
            title: "Unidades",
            dataIndex: "stock",
            width: "fit-content",
            align: "center"
        },
        {
            title: "Cajas completas",
            dataIndex: "completeBoxes",
            width: "fit-content",
            align: "center"
        }
    ];

    const [product, setProduct] = useState(null);
    const [showImagePreview, setShowImagePreview] = useState(false);

    const router = useRouter();
    const {productId} = router.query;

    useMemo(() => {
        const fetchProduct = async () => {
            try {

                const _product = await getProduct(productId);

                setProduct(_product);
            } catch (error) {
                router.back();
            }
        };

        productId && fetchProduct();
    }, [router]);

    const stockByType = type => {
        const stockByWarehouseTypeArray = get(product, "stockByWarehouseType", []);

        const stockByWarehouseType = stockByWarehouseTypeArray.find(_stockByWarehouseType =>
            _stockByWarehouseType.warehouseType === type
        );

        return get(stockByWarehouseType, "stock", 0);
    };

    return <>
        <Modal visible={showImagePreview}
               width="90%"
               footer={null}
               onCancel={() => setShowImagePreview(false)}>
            <ImagePreviewContainer justifyContent="center">
                <img src={get(product, "imageBase64", null)}
                     alt="image"/>
            </ImagePreviewContainer>
        </Modal>
        <Container height="20%"
                   flexDirection="column">
            <Grid gridTemplateRows="2fr 1fr"
                  gridGap="1rem">
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
                           value={get(product, "element", "-")}/>
                    <Input disabled
                           addonBefore="Modelo"
                           value={get(product, "model", "-")}/>
                    <Input disabled
                           addonBefore="Código Inventario"
                           value={get(product, "id", "-")}/>
                    <Input disabled
                           addonBefore="Disponibles"
                           value={stockByType("Almacén")}/>
                    <Input disabled
                           addonBefore="Averiados"
                           value={stockByType("Averiado")}/>
                </Grid>
                <Input disabled
                       addonBefore="Compatibilidad"
                       value={get(product, "compatibility", "-")}/>
            </Grid>
        </Container>
        <Container height="80%"
                   flexDirection="column"
                   textAlign="center"
                   padding="1rem 0">
            <Grid gridTemplateRows="repeat(2, auto)"
                  gridGap="1rem">
                <div>
                    <h3>
                        Disponibilidad del producto en los almacenes(unidades totales)
                    </h3>
                    <br/>
                    <Grid gridTemplateColumns="repeat(2, 1fr)"
                          gridGap="1rem">
                        <Table columns={stockByWarehouseColumns}
                               bordered
                               scrollToFirstRowOnChange
                               pagination={false}
                               dataSource={get(product, "stockByWarehouse", [])}/>
                        <Container justifyContent="center"
                                   alignItems="center"
                                   padding="0px">
                            {
                                get(product, "imageBase64", false)
                                    ? <img src={get(product, "imageBase64", null)}
                                           style={{cursor: "pointer"}}
                                           onClick={() => setShowImagePreview(true)}
                                           width="300px"
                                           alt="product-image"/>
                                    : <img src="/imagePlaceholder.png"
                                           width="300px"
                                           alt="product-image"/>
                            }
                        </Container>
                    </Grid>
                </div>
                <div>
                    <h3>
                        Disponibilidad del producto en los almacenes(cajas)
                    </h3>
                    <br/>
                    <Table columns={stockByWarehouseAndBoxSizeColumns}
                           bordered
                           scrollToFirstRowOnChange
                           pagination={false}
                           dataSource={get(product, "stockByWarehouseAndBoxSize", [])}/>
                </div>
            </Grid>
        </Container>
    </>
};

const ImagePreviewContainer = styled(Container)`
  img {
    height: 70vh;
  }
`;
