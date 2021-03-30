import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Table } from "antd";
import { faEye } from "@fortawesome/free-solid-svg-icons";

import { getProductBoxes } from "../../providers";

import { Button, Container, Grid, Icon } from "../../components";

export const ModalBoxesDetail = ({ productId }) => {
  const router = useRouter();
  const columns = [
    {
      title: "Código de caja",
      dataIndex: "trackingCode",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Stock",
      dataIndex: "stock",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Unidades/caja",
      dataIndex: "boxSize",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Código de abastecimiento",
      dataIndex: "supply",
      width: "fit-content",
      align: "center",
      render: (supply) => supply.code,
    },
    {
      title: "Ubicación",
      dataIndex: "warehouse",
      width: "fit-content",
      align: "center",
      render: (warehouse) => warehouse.name,
    },
    {
      title: "",
      dataIndex: "trackingCode",
      width: "fit-content",
      align: "center",
      render: (trackingCode) => (
        <Button
          onClick={async () =>
            router.push(`/products/productBoxes/${trackingCode}`)
          }
          type="primary"
        >
          <Icon icon={faEye} />
          Ver
        </Button>
      ),
    },
  ];

  const [boxes, setBoxes] = useState([]);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const _boxes = await getProductBoxes({ productId });
        setBoxes(_boxes);
      } catch (error) {
        console.log(error);
      }
    };
    fetchBoxes();
  }, []);

  return (
    <>
      <Container height="80%" flexDirection="column" textAlign="center">
        <Grid gridTemplateRows="repeat(2, auto)" gridGap="1rem">
          <div>
            <h3>
              <strong>Detalle de las cajas registradas en el ítem</strong>
            </h3>
            <br />
            <Table
              columns={columns}
              bordered
              scrollToFirstRowOnChange
              scroll={{ y: windowHeight * 0.5 - 32 }}
              pagination={false}
              dataSource={boxes}
            />
          </div>
        </Grid>
      </Container>
    </>
  );
};
