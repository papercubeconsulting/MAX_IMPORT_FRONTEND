import React, { useState } from "react";
import { useRouter } from "next/router";
import { Input, Modal, notification } from "antd";
import { Container } from "../../Container";
import { Grid } from "../../Grid";
import styled from "styled-components";
import { Button } from "../../Button";
import Quagga from "quagga";
import { get } from "lodash";

export const ReadProductCode = (props) => {
  const [productBoxCode, setProductBoxCode] = useState(null);

  const router = useRouter();

  const scanBarcode = () => {
    /* navigator.permissions
      .query({ name: "camera" })
      .then((permissionObj) => {
        console.log(permissionObj.state);
      })
      .catch((error) => {
        console.log("Got error :", error);
      }); */
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        console.log("success!");
      })
      .catch((e) => {
        console.log("e: ", e);
        notification.error({
          message: "Ocurrió un error (navig)",
          description: e.message,
        });
      });

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
    Quagga.onProcessed((data) => {
      if (get(data, "codeResult", null)) {
        setProductBoxCode(get(data, "codeResult.code", null));
        console.log(get(data, "codeResult.code", null));
        Quagga.stop();
      }
    });
  };

  return (
    <Modal
      visible={props.visible}
      onOk={async () => router.push(`/products/productBoxes/${productBoxCode}`)}
      onCancel={() => props.trigger && props.trigger(false)}
      width="90%"
      title="Escanear o ingresar código de caja"
    >
      {/* <Grid gridTemplateRows="repeat(2, 1fr)"
                  gridGap="1rem"> */}
      <Grid gridTemplateColumns="1fr 1fr" gridGap="1rem" marginBottom="1rem">
        <Input
          value={productBoxCode}
          justify="center"
          onChange={(event) => setProductBoxCode(event.target.value)}
          addonBefore="Código de caja"
        />
        <Button onClick={scanBarcode}>Leer Código de barras</Button>
      </Grid>
      <QRScanner>
        <Grid gridTemplateRows="1fr" gridGap="1rem" justifyItems="center">
          <div id="interactive" className="viewport">
            <video autoPlay="true" preload="auto" />
          </div>

          <canvas className="drawingBuffer"></canvas>
        </Grid>
      </QRScanner>
      {/* </Grid> */}
    </Modal>
  );
};

const QRScanner = styled(Container)`
  .drawingBuffer {
    position: absolute;
    top: 0;
    left: 0;
  }
`;
