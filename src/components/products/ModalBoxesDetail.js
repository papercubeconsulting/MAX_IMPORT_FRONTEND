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
      align: "center",
    },
    {
      title: "Stock",
      dataIndex: "stock",
      width: "75px",
      align: "center",
    },
    {
      title: "Unidades/caja",
      dataIndex: "boxSize",
      width: "100px",
      align: "center",
    },
    {
      title: "Código de abastecimiento",
      dataIndex: "supply",
      align: "center",
      render: (supply) => supply.code,
    },
    {
      title: "Ubicación actual",
      dataIndex: "warehouse",
      align: "center",
      render: (warehouse) => warehouse.name,
    },
    {
      title: "Ubicación anterior",
      dataIndex: "previousWarehouse",
      align: "center",
      render: (previousWarehouse) =>
        previousWarehouse ? previousWarehouse.name : "-",
    },
    {
      title: "",
      dataIndex: "trackingCode",
      width: "110px",
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
      </Container>
    </>
  );
};
