import React, { useEffect, useState } from "react";
import { Container } from "../Container";
import { Grid } from "../Grid";
import { getProduct } from "../../providers";
import { Table } from "antd";

export const ModalBoxesDetail = ({ productId }) => {
  const stockByWarehouseAndBoxSizeColumns = [
    {
      title: "Código de caja",
      dataIndex: "warehouseName",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Stock",
      dataIndex: "warehouseName",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Box size",
      dataIndex: "warehouseName",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Supply",
      dataIndex: "quantityBoxes",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Ubicación",
      dataIndex: "warehouseName",
      width: "fit-content",
      align: "center",
    },
  ];

  const [product, setProduct] = useState(null);

  useEffect(() => {
    /* const fetchProduct = async () => {
      try {
        const _product = await getProduct(props.id);
        setProduct(_product);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProduct(); */
  }, []);

  return (
    <>
      <Container height="80%" flexDirection="column" textAlign="center">
        <Grid gridTemplateRows="repeat(2, auto)" gridGap="1rem">
          <div>
            <h3>Detalle de las cajas registradas en el ítem</h3>
            <br />
            <Table
              columns={stockByWarehouseAndBoxSizeColumns}
              bordered
              scrollToFirstRowOnChange
              pagination={false}
              dataSource={[]}
            />
          </div>
        </Grid>
      </Container>
    </>
  );
};
