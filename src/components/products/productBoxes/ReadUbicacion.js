import * as QuaggaUbicacion from "quagga";
import React, { useState, useEffect } from "react";
import { Input, Modal, Alert, notification, Table, Popover } from "antd";
import styled from "styled-components";
import { get } from "lodash";
import { getWarehouseById } from "../../../providers";
import QRCode from "react-qr-code";
import { Container } from "../../Container";

export const ReadUbicacion = (props) => {
  const { setWarehouseInput, setWarehouseName, setWarehouseId, onClose } =
    props;
  const videoRefUbicacion = React.useRef();
  const [isScanned, setIsScanned] = useState(false);

  React.useEffect(() => {
    scanBarcodeUbicacion();
    return () => {
      // Disconnect camera
      try {
        // Quagga?.stop();
        QuaggaUbicacion?.stop();
      } catch (error) {}
    };
  }, []);

  const scanBarcodeUbicacion = (scanUbicacion) => {
    // stopWebcam();
    videoRefUbicacion.current.style.display = "block";
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
          videoRefUbicacion.current.localStream = stream;
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
    initQuaggaUbicacion();
    // console.log("out", { scanType });
    QuaggaUbicacion.onProcessed((data) => {
      if (get(data, "codeResult", null)) {
        const _code = data.codeResult.code;
        // console.log({ scanType, scanUbicacion });
        // if (scanUbicacion) {
        console.log("ubicacion");
        addCodeUbicacion(_code);
        // videoRef.current.style.display = "none";
        QuaggaUbicacion.stop();
        // setTimeout(() => {
        //   initQuagga();
        // }, 1000);
        // } else {
        //   console.log("no ubicacion");
        //   addCode(_code);
        //   // videoRef.current.style.display = "none";
        //   Quagga.stop();
        //   setTimeout(() => {
        //     initQuagga();
        //   }, 1000);
        // }
      }
    });
  };
  const initQuaggaUbicacion = () => {
    if (videoRefUbicacion.current) {
      videoRefUbicacion.current.style.display = "block";
    }
    QuaggaUbicacion.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRefUbicacion.current,
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
        QuaggaUbicacion.start();
      },
    );
  };

  const addCodeUbicacion = async (newCode, showNotification) => {
    try {
      setIsScanned(true);
      const _warehouse = await getWarehouseById(newCode);
      console.log("warehouse", { _warehouse }, !_warehouse);

      if (!_warehouse) {
        setWarehouseInput("");
        setIsScanned(false);
        notification.info({
          message: "El código de ubicacion no existe",
        });
      } else {
        setWarehouseId(_warehouse.id);
        setWarehouseInput(_warehouse.id);
        console.log({ warehousename: _warehouse.name });
        setWarehouseName(_warehouse.name);
        QuaggaUbicacion.stop();
        // videoRef.current.localStream = null;
        setIsScanned(false);
        onClose();
        notification.success({
          message: "Ubicacion encontrada!",
        });
      }

      // const _productBox = await getProductBox(newCode);
      // setDataCodes((prev) => {
      //   if (prev.some((code) => code.trackingCode == newCode)) {
      //     showNotification &&
      //       notification.info({
      //         message: 'El código ingresado ya existe en la tabla',
      //       });
      //     return [...prev];
      //   } else {
      //     return [...prev, { key: prev.length + 1, ..._productBox }];
      //   }
      // });
    } catch (error) {
      console.log({error});
      setIsScanned(false);
      setWarehouseInput("");
      notification.error({
        message: "El código ingresado de Ubicacion no fue encontrado",
      });
    }
  };

  return (
    <>
      {/* <Input */}
      {/*   justify="center" */}
      {/*   disabled={warehouseId} */}
      {/*   value={warehouseInput} */}
      {/*   //onChange={(event) => { setProductBoxCode(event.target.value) }} */}
      {/*   onChange={async (event) => { */}
      {/*     setWarehouseInput(event.target.value); */}
      {/*   }} */}
      {/*   addonBefore="Código de Ubicacion" */}
      {/*   // onBlur={(event) => { console.log('OnBlur', event.target.value, isScanned); isScanned && addCode(event.target.value, true) }} */}
      {/* /> */}
      {/* <div>hola</div> */}
      <Modal open={true} onOk={() => onClose()} onCancel={() => onClose()}>
        <QRScanner>
          <div ref={videoRefUbicacion} className="viewport">
            {/* <video autoPlay="true" preload="auto" /> */}
          </div>
          <canvas className="drawingBuffer"></canvas>
        </QRScanner>
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
