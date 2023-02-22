import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Input, Modal, notification, Table } from 'antd';
import styled from 'styled-components';
import Quagga from 'quagga';
import { get } from 'lodash';
import { faTrash, faPeopleCarry } from '@fortawesome/free-solid-svg-icons';

import {
  getProductBox,
  getWarehouses,
  putProductBoxes,
} from '../../../providers';
import { selectOptions } from '../../../util';

import { Container } from '../../Container';
import { Grid } from '../../Grid';
import { Select } from '../../Select';
import { Button } from '../../Button';
import { Icon } from '../../Icon';

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
  const videoooRef = React.useRef();
  const [dataCodes, setDataCodes] = useState([]);
  const [productBoxCode, setProductBoxCode] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [newWarehouse, setNewWarehouse] = useState({});
  const [modalConfirm, setModalConfirm] = useState(false);
  const [isScanned, setIsScanned] = useState(false)
  const [isLoading,setLoading] = useState(false)

  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    window.localStream = null;
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
      title: 'N°',
      dataIndex: 'key',
      align: 'center',
      width: '38px',
    },
    {
      title: 'Código',
      dataIndex: 'trackingCode',
      align: 'center',
    },
    {
      title: 'Almacén',
      dataIndex: 'warehouse',
      align: 'center',
      render: (warehouse) => warehouse.name,
    },
    {
      dataIndex: 'trackingCode',
      align: 'center',
      width: '42px',
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
      setIsScanned(true)
      const _productBox = await getProductBox(newCode);
      setDataCodes((prev) => {
        if (prev.some((code) => code.trackingCode == newCode)) {
          showNotification &&
            notification.info({
              message: 'El código ingresado ya existe en la tabla',
            });
          return [...prev];
        } else {
          return [...prev, { key: prev.length + 1, ..._productBox }];
        }
      });
      setIsScanned(false)
    } catch (error) {
      setIsScanned(false)
      notification.error({
        message: 'El código ingresado no fue encontrado',
      });
    }
  };

  const initQuagga = () => {
    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: videoRef.current,
        },
        decoder: {
          readers: ['code_128_reader'],
        },
      },
      (error) => {
        console.log('Error de quoga', error);
        if (error) {
          console.log(error);
          notification.error({
            message: 'Ocurrió un error',
            description: error.message,
          });
          return;
        }
        console.log('Initialization finished. Ready to start');
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
    console.log('navigator.mediaDevices...');
    console.log(navigator.mediaDevices);
    if (navigator.mediaDevices.getUserMedia) {
      console.log('Into getUserMedia');
      (async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log('Devices', devices);
      })();
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: {
              exact: 'environment',
            },
          },
          audio: false,
        })
        .then((stream) => {
          videoRef.current.localStream = stream;
          console.log('success!');
        })
        .catch((e) => {
          console.log('Error de scanBarcode getUserMedia');

          console.log('e: ', e);
          notification.error({
            message: 'Ocurrió un error',
            description: e.message,
          });
        });
    } else {
      console.log('Not into getUserMedia');
      console.log('Error de scanBarcode Not into getUserMedia');

      navigator
        .getWebcam({ video: true })
        .then((stream) => {
          console.log('success!');
        })
        .catch((e) => {
          console.log('e: ', e);
          notification.error({
            message: 'Ocurrió un error',
            description: e.message,
          });
        });
    }
    initQuagga();
    Quagga.onProcessed((data) => {
      if (get(data, 'codeResult', null)) {
        const _code = data.codeResult.code;
        addCode(_code);
        Quagga.stop();
        setTimeout(() => {
          initQuagga();
        }, 1000);
      }
    });
  };

  const stopWebcam = () => {
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
    const data = dataCodes.map((elem) => ({
      id: elem.id,
      warehouseId: newWarehouse.id,
      previousWarehouseId: elem.warehouseId,
    }));
    try {
      setLoading(true) 
      const response = await putProductBoxes({ boxes: data });
      notification.success({
        message: 'Las cajas han sido movidas correctamente',
      });
      setModalConfirm(false);
      setDataCodes([]);
      props.trigger(false);
      stopWebcam();
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log('error', error);
      notification.error({
        message: 'Ocurrió un error. Vuelva a intentarlo por favor',
      });
    }
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
          {isLoading && <div style={{marginTop:'12px'}}>Procesando movimiento...</div>}
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
        onCancel={() => {
          props.trigger && props.trigger(false);
          stopWebcam();
        }}
        width="90%"
        title="Escanear o ingresar código de caja"
      >
        <Form gridGap="2rem" marginBottom="1rem">
          <Container padding="0rem">
            <Input
              justify="center"
              value={productBoxCode}
              //onChange={(event) => { setProductBoxCode(event.target.value) }}
              onChange={async (event) => { if (event.target.value.length === 16) { await addCode(event.target.value, true); setProductBoxCode('') } else {setProductBoxCode(event.target.value)} }}
              addonBefore="Código de caja"
            // onBlur={(event) => { console.log('OnBlur', event.target.value, isScanned); isScanned && addCode(event.target.value, true) }}
            />
            <Button
              type="primary"
              disabled={!productBoxCode}
              onClick={() => {
                addCode(productBoxCode, true);
                setProductBoxCode('');
              }}
            >
              Agregar
            </Button>
          </Container>
          <Button onClick={scanBarcode}>Leer Código de barras</Button>
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
              <video autoPlay="true" preload="auto" />
            </div>
            <canvas className="drawingBuffer"></canvas>
          </QRScanner>
          <QRScanner>
            <div ref={videoooRef} id="videooo"></div>
            <canvas className="drawingBuffer"></canvas>
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
