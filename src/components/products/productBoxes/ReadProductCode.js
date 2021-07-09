import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Input, Modal, notification, Table } from "antd";
import styled from "styled-components";
import Quagga from "quagga";
import { get } from "lodash";
import { faTrash, faPeopleCarry } from "@fortawesome/free-solid-svg-icons";

import {
  getProductBox,
  getWarehouses,
  putProductBoxes,
} from "../../../providers";
import { selectOptions } from "../../../util";

import { Container } from "../../Container";
import { Grid } from "../../Grid";
import { Select } from "../../Select";
import { Button } from "../../Button";
import { Icon } from "../../Icon";

export const ReadProductCode = (props) => {
  const router = useRouter();

  const [dataCodes, setDataCodes] = useState([]);
  const [productBoxCode, setProductBoxCode] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [newWarehouse, setNewWarehouse] = useState({});
  const [modalConfirm, setModalConfirm] = useState(false);

  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    const fetchWarehouses = async () => {
      const _warehouses = await getWarehouses();
      setWarehouses(_warehouses);
    };
    fetchWarehouses();
  }, []);

  const columns = [
    {
      title: "N°",
      dataIndex: "key",
      align: "center",
      width: "38px",
    },
    {
      title: "Código",
      dataIndex: "trackingCode",
      align: "center",
    },
    {
      title: "Almacén",
      dataIndex: "warehouse",
      align: "center",
      render: (warehouse) => warehouse.name,
    },
    {
      dataIndex: "trackingCode",
      align: "center",
      width: "42px",
      render: (trackingCode) => (
        <>
          <Button
            padding="0 0.25rem"
            margin="0 0.25rem"
            type="danger"
            onClick={() => {
              setDataCodes((prevState) =>
                prevState
                  .filter((elem) => elem.trackingCode !== trackingCode)
                  .map((code, index) => ({
                    ...code,
                    key: index + 1,
                  }))
              );
            }}
          >
            <Icon marginRight="0px" fontSize="0.8rem" icon={faTrash} />
          </Button>
        </>
      ),
    },
  ];

  const addCode = async (newCode, showNotification) => {
    try {
      const _productBox = await getProductBox(newCode);
      setDataCodes((prev) => {
        if (prev.some((code) => code.trackingCode == newCode)) {
          showNotification &&
            notification.info({
              message: "El código ingresado ya existe en la tabla",
            });
          return [...prev];
        } else {
          return [...prev, { key: prev.length + 1, ..._productBox }];
        }
      });
    } catch (error) {
      notification.error({
        message: "El código ingresado no fue encontrado",
      });
    }
  };

  const initQuagga = () => {
    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
        },
        decoder: {
          readers: ["code_128_reader"],
        },
      },
      (error) => {
        console.log("Error de quoga");
        if (error) {
          console.log(error);
          notification.error({
            message: "Ocurrió un error",
            description: error.message,
          });
          return;
        }
        console.log("Initialization finished. Ready to start");
        Quagga.start();
      }
    );
  };

  const scanBarcode = () => {
    navigator.getWebcam =
      navigator.getUserMedia ||
      navigator.webKitGetUserMedia ||
      navigator.moxGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
    console.log("navigator.mediaDevices...");
    console.log(navigator.mediaDevices);
    if (navigator.mediaDevices.getUserMedia) {
      console.log("Into getUserMedia");
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          console.log("success!");
        })
        .catch((e) => {
          console.log("Error de scanBarcode getUserMedia");

          console.log("e: ", e);
          notification.error({
            message: "Ocurrió un error",
            description: e.message,
          });
        });
    } else {
      console.log("Not into getUserMedia");
      console.log("Error de scanBarcode Not into getUserMedia");

      navigator
        .getWebcam({ video: true })
        .then((stream) => {
          console.log("success!");
        })
        .catch((e) => {
          console.log("e: ", e);
          notification.error({
            message: "Ocurrió un error",
            description: e.message,
          });
        });
    }
    initQuagga();
    Quagga.onProcessed((data) => {
      if (get(data, "codeResult", null)) {
        const _code = data.codeResult.code;
        addCode(_code);
        Quagga.stop();
        setTimeout(() => {
          initQuagga();
        }, 1000);
      }
    });
  };

  const moveBoxes = async () => {
    const data = dataCodes.map((elem) => ({
      id: elem.id,
      warehouseId: newWarehouse.id,
      previousWarehouseId: elem.warehouseId,
    }));
    try {
      const response = await putProductBoxes({ boxes: data });
      notification.success({
        message: "Las cajas han sido movidas correctamente",
      });
      setModalConfirm(false);
      setDataCodes([]);
      props.trigger(false);
    } catch (error) {
      console.log("error", error);
      notification.error({
        message: "Ocurrió un error. Vuelva a intentarlo por favor",
      });
    }
  };

  return (
    <>
      <Modal
        visible={modalConfirm}
        onOk={() => moveBoxes()}
        okText={
          <>
            <Icon icon={faPeopleCarry} />
            Mover
          </>
        }
        onCancel={() => setModalConfirm(false)}
        width="600px"
        title="Movimiento de cajas"
        centered
      >
        <>
          <Select
            value={newWarehouse.name}
            label="Ubicación destino"
            onChange={(value) => {
              const _warehouse = warehouses.find(
                (warehouse) => warehouse.id === value
              );
              setNewWarehouse(_warehouse);
            }}
            options={selectOptions(warehouses)}
          />
        </>
      </Modal>
      <Modal
        visible={props.visible}
        onOk={async () => {
          if (dataCodes.length === 1) {
            router.push(`/products/productBoxes/${dataCodes[0].trackingCode}`);
          } else {
            setModalConfirm(true);
          }
        }}
        onCancel={() => props.trigger && props.trigger(false)}
        width="90%"
        title="Escanear o ingresar código de caja"
      >
        <Grid gridTemplateColumns="1fr 1fr" gridGap="2rem" marginBottom="1rem">
          <Container padding="0rem">
            <Input
              justify="center"
              value={productBoxCode}
              onChange={(event) => setProductBoxCode(event.target.value)}
              addonBefore="Código de caja"
            />
            <Button
              type="primary"
              disabled={!productBoxCode}
              onClick={() => {
                addCode(productBoxCode, true);
                setProductBoxCode("");
              }}
            >
              Agregar
            </Button>
          </Container>
          <Button onClick={scanBarcode}>Leer Código de barras</Button>
        </Grid>
        <Grid gridTemplateColumns="1fr 1fr" gridGap="2rem" marginBottom="1rem">
          <Container padding="1rem 0rem">
            <Table
              columns={columns}
              dataSource={dataCodes}
              pagination={false}
              scroll={{ y: windowHeight * 0.3 - 48 }}
              bordered
              size="middle"
            />
          </Container>
          <QRScanner>
            <div id="interactive" className="viewport">
              <video autoPlay="true" preload="auto" />
            </div>
            <canvas className="drawingBuffer"></canvas>
          </QRScanner>
        </Grid>
      </Modal>
    </>
  );
};

const QRScanner = styled(Container)`
  padding: 1rem 0rem;
  .drawingBuffer {
    width: 0px !important;
    position: absolute;
    top: 0;
    left: 0;
  }
  video {
    width: 100%;
  }
`;
