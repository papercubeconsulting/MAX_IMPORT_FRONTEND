import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Input, Modal, Alert, notification, Table, Popover } from "antd";
import styled from "styled-components";
import Quagga from "quagga";
import * as QuaggaUbicacion from "quagga";
import { get } from "lodash";
import { faTrash, faPeopleCarry } from "@fortawesome/free-solid-svg-icons";
import { InboxOutlined, NumberOutlined } from "@ant-design/icons";
import {
  getProductBox,
  getWarehouseById,
  getWarehouses,
  putProductBoxes,
} from "../../../providers";
import { selectOptions } from "../../../util";

import { Container } from "../../Container";
import { Grid } from "../../Grid";
import { Select } from "../../Select";
import { Button } from "../../Button";
import { Icon } from "../../Icon";
import { useWarehouses } from "../../../util/hooks/useWarehouses";
import { ReadUbicacion } from "./ReadUbicacion";

const Form = styled(Grid)`
  grid-template-columns: 1fr 1fr;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DivInfo = styled(Grid)`
  @media (max-width: 768px) {
    display: inherit;
  }
`;

export const ReadProductCode = (props) => {
  const router = useRouter();
  const videoRef = React.useRef();
  const scanBarcodeRef = React.useRef();
  const videoRefUbicacion = React.useRef();
  const [dataCodes, setDataCodes] = useState([]);
  const [productBoxCode, setProductBoxCode] = useState("");
  const [warehouseInput, setWarehouseInput] = useState(null);
  // const [warehouses, setWarehouses] = useState([]);
  const [newWarehouse, setNewWarehouse] = useState({});
  const [modalConfirm, setModalConfirm] = useState(false);
  const [isScanned, setIsScanned] = useState(false);
  const [scanType, setScanType] = useState(null);
  const [showUbicacionScanModal, setShowUbicacionScanModal] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [indicadores, setIndicadores] = useState({
    cajas: 0,
    unidades: 0,
    items: [],
  });
  const [windowHeight, setWindowHeight] = useState(0);
  const {
    selectOptionsWarehouse,
    onChangeWarehouseName,
    onChangeSubVisionSelect,
    selectOptionsUbicacion,
    listOfSubdivisions,
    warehouseId,
    warehouseName,
    wareHouseSubdivisionMap,
    setWarehouseName,
    warehouses,
    setWarehouses,
    listWarehouses,
    setWarehouseId,
  } = useWarehouses();

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    window.localStream = null;
  }, []);

  // useEffect(() => {
  //   const fetchWarehouses = async () => {
  //     const _warehouses = await getWarehouses();
  //     setWarehouses(_warehouses);
  //   };
  //   fetchWarehouses();
  // }, []);

  /* Setting up indicadores for modal*/
  useEffect(() => {
    if (dataCodes.length >= 0) {
      const indicadores = dataCodes.reduce(
        (prev, curr, index) => {
          const _uniqueCode = [...prev.uniqueCode];

          if (!_uniqueCode.includes(curr.product.code)) {
            _uniqueCode.push(curr.product.code);
          }
          if (curr?.boxSize) {
            return {
              ...prev,
              boxSize: prev.boxSize + curr.boxSize,
              uniqueCode: _uniqueCode,
            };
          }
        },
        { boxSize: 0, uniqueCode: [] },
      );
      setIndicadores({
        cajas: dataCodes.length,
        unidades: indicadores.boxSize,
        items: indicadores.uniqueCode,
      });
    }
  }, [dataCodes.length]);

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
      title: "Subdivision",
      dataIndex: "warehouse",
      align: "center",
      render: (warehouse) => warehouse.subDivision || "-",
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
                  })),
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
      setIsScanned(true);
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
      setIsScanned(false);
    } catch (error) {
      setIsScanned(false);
      notification.error({
        message: "El código ingresado no fue encontrado",
      });
    }
  };

  console.log("are the same?", QuaggaUbicacion === Quagga);

  React.useEffect(() => {
    return () => {
      // Disconnect camera
      try {
        Quagga?.stop();
      } catch (error) {}
    };
  }, []);

  const initQuagga = () => {
    if (videoRef.current) {
      videoRef.current.style.display = "block";
    }
    // if (videoRefUbicacion) {
    //   videoRefUbicacion.current.style.display = "block";
    // }
    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
        },
        decoder: {
          readers: ["code_128_reader"],
        },
      },
      (error) => {
        if (error) {
          console.log("Error Quoga", error);
          notification.error({
            message: "Ocurrió un error",
            description: error.message,
          });
          return;
        }
        console.log("Initialization finished. Ready to start");
        Quagga.start();
      },
    );
  };

  const scanBarcode = (scanUbicacion) => {
    // stopWebcam();
    videoRef.current.style.display = "block";
    navigator.getWebcam =
      navigator.getUserMedia ||
      navigator.webKitGetUserMedia ||
      navigator.moxGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
    console.log("navigator.mediaDevices...");
    console.log(navigator.mediaDevices);
    if (
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      navigator.mediaDevices
    ) {
      console.log("Into getUserMedia");
      (async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log("Devices", devices);
      })();
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: {
              exact: "environment",
            },
          },
          audio: false,
        })
        .then((stream) => {
          videoRef.current.localStream = stream;
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
    console.log("out", { scanType });
    Quagga.onProcessed((data) => {
      console.log("dadta", JSON.stringify(data, null, 2));
      if (get(data, "codeResult", null)) {
        const _code = data.codeResult.code;
        // console.log({ scanType, scanUbicacion });
        // console.log("no ubicacion");
        addCode(_code);
        // videoRef.current.style.display = "none";
        Quagga.stop();
        setTimeout(() => {
          initQuagga();
        }, 1000);
        // }
      }
    });
  };

  const stopWebcam = () => {
    console.log("localStream", localStream);
    if (localStream) {
      window.location.reload();
    }
    //console.log("localStream", localStream);
    //console.log("getTracks", localStream.getTracks());
    /* localStream.getTracks().forEach((track) => {
      console.log(track);
      track.stop();
    }); */
  };

  const moveBoxes = async () => {
    if (!warehouseId) {
      notification.error({
        message: "Por favor, ingrese un Almacen y una Subdivision",
      });
      return;
    }
    const data = dataCodes.map((elem) => ({
      id: elem.id,
      warehouseId,
      // warehouseId: newWarehouse.id,
      previousWarehouseId: elem.warehouseId,
    }));
    try {
      setLoading(true);
      const response = await putProductBoxes({ boxes: data });
      notification.success({
        message: "Las cajas han sido movidas correctamente",
      });
      setModalConfirm(false);
      setDataCodes([]);
      props.trigger(false);
      stopWebcam();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error", error);
      notification.error({
        message: "Ocurrió un error. Vuelva a intentarlo por favor",
      });
    }
  };

  console.log("in body", { scanType });

  const indicadoresTitle = () => {
    return (
      <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <div>Escanear o ingresar código de caja</div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span>
            <InboxOutlined /> {`Cajas ${indicadores.cajas}`}
          </span>
          <span>
            <NumberOutlined /> {`Unidades ${indicadores.unidades}`}{" "}
          </span>
          <span>
            {/* <Popover placement="bottom" content={(indicadores.items.length > 0 && <div>{indicadores.items.map((item) => <div>{item}</div>)}</div>)}> */}
            <Popover
              placement="bottom"
              content={
                <div>
                  {indicadores.items.length > 0
                    ? indicadores.items.map((item) => <p>{item}</p>)
                    : "No items"}
                </div>
              }
            >
              <InboxOutlined /> {`Items ${indicadores.items.length}`}
            </Popover>
          </span>
        </div>
      </div>
    );
  };

  const closeQuagga = () => {
    try {
      Quagga.stop();
    } catch (error) {}
    videoRef.current.style.display = "none";
  };

  return (
    <>
      <Modal
        visible={modalConfirm}
        onOk={() => moveBoxes()}
        confirmLoading={isLoading}
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
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Select
            value={warehouseName}
            label="Almacen"
            // onChange={(value) => setWarehouseName(value)}
            onChange={(value) => {
              setWarehouseInput(warehouseId);
              onChangeWarehouseName(value);
            }}
            // onChange={()}
            // onChange={(value) => {
            //   const _warehouse = warehouses.find(
            //     (warehouse) => warehouse.id === value
            //   );
            //   setNewWarehouse(_warehouse);
            // }}
            options={selectOptionsWarehouse(listWarehouses)}
          />
          <Select
            value={warehouseId}
            label="Ubicacion"
            onChange={onChangeSubVisionSelect}
            // onChange={(value) => {
            //   const _warehouse = warehouses.find(
            //     (warehouse) => warehouse.id === value
            //   );
            //   setNewWarehouse(_warehouse);
            // }}
            options={selectOptionsUbicacion(listOfSubdivisions)}
          />
          {isLoading && (
            <div style={{ marginTop: "12px" }}>
              <Alert
                message="Procesando informacion ....."
                type="info"
                showIcon
              />
            </div>
          )}
        </div>
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
        onCancel={() => {
          props.trigger && props.trigger(false);
          // stopWebcam();
        }}
        width="90%"
        // title="Escanear o ingresar código de caja"
        // title={<div>hola</div>}
        title={indicadoresTitle()}
      >
        <Form gridGap="2rem" marginBottom="1rem">
          <Container padding="0rem">
            {/* <button */}
            {/*   onClick={() => { */}
            {/*     console.log("d", videoRef.current); */}
            {/*     Quagga.stop(); */}
            {/*     videoRef.current.style.display = "none"; */}
            {/*     // videoRefUbicacion.current.style.display = "none"; */}
            {/*   }} */}
            {/* > */}
            {/*   test */}
            {/* </button> */}
            <Input
              justify="center"
              value={productBoxCode}
              //onChange={(event) => { setProductBoxCode(event.target.value) }}
              onChange={async (event) => {
                if (event.target.value.length === 16) {
                  await addCode(event.target.value, true);
                  setProductBoxCode("");
                } else {
                  setProductBoxCode(event.target.value);
                }
              }}
              addonBefore="Código de Caja"
              // onBlur={(event) => { console.log('OnBlur', event.target.value, isScanned); isScanned && addCode(event.target.value, true) }}
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
          <Button
            onClick={() => {
              setScanType("BARRA");
              scanBarcode();
            }}
          >
            Leer Código de barras
          </Button>
        </Form>
        <Form gridGap="2rem" marginBottom="1rem">
          <Container padding="0rem">
            <Input
              justify="center"
              disabled={warehouseId}
              value={warehouseInput}
              //onChange={(event) => { setProductBoxCode(event.target.value) }}
              onChange={async (event) => {
                setWarehouseInput(event.target.value);
              }}
              addonBefore="Código de Ubicacion"
              // onBlur={(event) => { console.log('OnBlur', event.target.value, isScanned); isScanned && addCode(event.target.value, true) }}
            />
            <Button
              type="primary"
              disabled={!warehouseInput}
              onClick={() => {
                console.log({ warehouseInput });
                if (warehouseId) {
                  setWarehouseInput("");
                  setWarehouseId(null);
                  return;
                }

                // if (warehouseInput) {
                addCodeUbicacion(warehouseInput, true);
                // } else {
                //   setWarehouseInput("");
                //   setWarehouseId(null);
                // }

                // setProductBoxCode("");
              }}
            >
              {/* Agregar */}
              {warehouseId ? "Reset" : "Agregar"}
            </Button>
          </Container>
          <Button
            onClick={() => {
              closeQuagga();
              setShowUbicacionScanModal(true);
              // setScanType("UBICACION");
              // scanBarcode(true);
            }}
          >
            Leer Ubicación
          </Button>
        </Form>
        <DivInfo
          gridTemplateColumns="1fr 1fr"
          gridGap="2rem"
          marginBottom="1rem"
        >
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
            <div ref={videoRef} className="viewport">
              {/* <video autoPlay="true" preload="auto" /> */}
            </div>
            <canvas className="drawingBuffer"></canvas>
            {showUbicacionScanModal ? (
              <ReadUbicacion
                onClose={() => {
                  closeQuagga();
                  setShowUbicacionScanModal(false);
                }}
                scanBarcodeRef={scanBarcodeRef}
                setWarehouseInput={setWarehouseInput}
                setWarehouseName={setWarehouseName}
                setWarehouseId={setWarehouseId}
              />
            ) : null}
          </QRScanner>
        </DivInfo>
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
