import React, { useState } from "react";
import { useRouter } from "next/router";
import { Input, Modal, notification, Table } from "antd";
import styled from "styled-components";
import Quagga from "quagga";
import { get } from "lodash";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { Container } from "../../Container";
import { Grid } from "../../Grid";
import { Button } from "../../Button";
import { Icon } from "../../Icon";

export const ReadProductCode = (props) => {
  const [dataCodes, setDataCodes] = useState([]);

  const router = useRouter();

  const columns = [
    {
      title: "N°",
      dataIndex: "id",
      align: "center",
    },
    {
      title: "Código",
      dataIndex: "code",
      align: "center",
    },
    {
      dataIndex: "code",
      align: "center",
      render: (code) => (
        <>
          <Button
            padding="0 0.25rem"
            margin="0 0.25rem"
            type="danger"
            onClick={() => {
              setDataCodes((prevState) =>
                prevState
                  .filter((elem) => elem.code !== code)
                  .map((code, index) => ({
                    ...code,
                    id: index + 1,
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

  const scanBarcode = () => {
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
        const _code = data.codeResult.code;
        setDataCodes((prev) => {
          if (prev.some((code) => code.code == _code)) {
            return [...prev];
          } else {
            return [...prev, { id: prev.length + 1, code: _code }];
          }
        });
        Quagga.stop();
      }
    });
  };

  return (
    <Modal
      visible={props.visible}
      onOk={async () => {
        if (dataCodes.length === 1) {
          router.push(`/products/productBoxes/${dataCodes[0].code}`);
        } else {
          console.log(dataCodes);
        }
      }}
      onCancel={() => props.trigger && props.trigger(false)}
      width="90%"
      title="Escanear o ingresar código de caja"
    >
      <Grid gridTemplateColumns="1fr 1fr" gridGap="2rem" marginBottom="1rem">
        <Input
          justify="center"
          /* onChange={(event) => setProductBoxCode(event.target.value)} */
          addonBefore="Código de caja"
        />
        <Button onClick={scanBarcode}>Leer Código de barras</Button>
      </Grid>
      <Grid gridTemplateColumns="1fr 1fr" gridGap="2rem" marginBottom="1rem">
        <Container padding="1rem 0rem">
          <Table
            columns={columns}
            dataSource={dataCodes}
            pagination={false}
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
