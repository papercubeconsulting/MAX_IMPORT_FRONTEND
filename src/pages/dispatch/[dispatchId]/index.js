import React, { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Container, Grid, ModalProduct } from "../../../components";
import {
  getDispatch,
  userProvider,
  getProductBox,
  postDispatchProduct,
} from "../../../providers";
import { get } from "lodash";
import { Input, Table, Modal, Checkbox } from "antd";
import moment from "moment";
import Quagga from "quagga";
import { clientDateFormat } from "../../../util";
import styled from "styled-components";

const QRScanner = styled.div`
  .viewport {
    width: 60%;
    height: 60%;
    margin: auto;
    video {
      width: 100%;
    }
  }
  .drawingBuffer {
    width: 0;
    height: 0;
  }
`;

export default ({ setPageTitle }) => {
  setPageTitle("Despacho de pedido");
  //extraccion de params de url
  const router = useRouter();
  const { dispatchId } = router.query;

  const columns = [
    {
      dataIndex: "id",
      title: "Ítem",
      width: "fit-content",
      align: "center",
      render: (id, record, index) => index + 1,
    },
    {
      title: "Familia",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
      render: (product) => get(product, "familyName", null),
    },
    {
      title: "Sub-Familia",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
      render: (product) => get(product, "subfamilyName", null),
    },
    {
      title: "Elemento",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
      render: (product) => get(product, "elementName", null),
    },
    {
      title: "Modelo",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
      render: (product) => get(product, "modelName", null),
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Cantidad despachada",
      dataIndex: "dispatched",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Disponibilidad",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
      render: (product) => get(product, "availableStock", null),
    },
    {
      dataIndex: "product",
      width: "fit-content",
      align: "center",
      render: (product) => (
        <Button
          padding="0 0.5rem"
          type="primary"
          onClick={() => {
            setIsVisible(true);
            setIdModal(product.id);
          }}
        >
          VER
        </Button>
      ),
    },
    {
      dataIndex: "id",
      width: "fit-content",
      align: "center",
      render: (id, data) => (
        <Button
          disabled={data.quantity === data.dispatched}
          padding="0 0.5rem"
          type="primary"
          onClick={() => {
            setIsVisibleReadProductCode(true);
          }}
        >
          {data.quantity === data.dispatched ? "Entregado" : "Despachar"}
        </Button>
      ),
    },
  ];

  const [dispatch, setDispatch] = useState([]);
  const [windowHeight, setWindowHeight] = useState(0);

  //Modal Producto
  const [isVisible, setIsVisible] = useState(false);
  const [idModal, setIdModal] = useState("");

  //Modal ReadProductCode
  const [isVisibleReadProductCode, setIsVisibleReadProductCode] = useState(
    false
  );
  const scanBarcode = () => {
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
          return;
        }
        console.log("Initialization finished. Ready to start");
        Quagga.start();
      }
    );
    Quagga.onProcessed((data) => {
      if (get(data, "codeResult", null)) {
        const codeProduct = get(data, "codeResult.code", null);
        /* console.log(codeProduct); */
        const fetchProductBox = async () => {
          try {
            const _productBox = await getProductBox(codeProduct);
            setDataProduct(_productBox);
            /* console.log("_productBox", _productBox); */
          } catch (error) {
            console.log(error);
          }
        };
        codeProduct && fetchProductBox();
        setIsVisibleReadProductCode(false);
        setIsVisibleConfirmDispatch(true);
        Quagga.stop();
      }
    });
  };

  //Modal Confirmar despacho
  const [isVisibleConfirmDispatch, setIsVisibleConfirmDispatch] = useState(
    false
  );
  const [dataProduct, setDataProduct] = useState();
  const [quantity, setQuantity] = useState();
  const [check, setCheck] = useState(false);

  const confirmDispatch = () => {
    console.log(dispatchId, {
      quantity,
    });
  };

  //datos del usuario
  const [me, setMe] = useState({ name: null });

  //Obtiene el usuario
  useEffect(() => {
    const initialize = async () => {
      try {
        const _me = await userProvider.getUser();
        setMe(_me);
      } catch (error) {
        console.log(error);
        /* notification.error({
          message: "Error en el servidor",
          description: error.message,
        }); */
      }
    };

    initialize();
  }, []);

  //para setear el tamaño de pantalla
  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  //trae el despacho por Id
  useMemo(() => {
    const fetchProforma = async () => {
      try {
        const _dispatch = await getDispatch(dispatchId);
        /* console.log(_dispatch); */
        setDispatch(_dispatch);
      } catch (error) {
        console.log(error);
      }
    };
    dispatchId && fetchProforma();
  }, [router]);

  return (
    <>
      <Modal
        visible={isVisibleReadProductCode}
        width="50%"
        onCancel={() => setIsVisibleReadProductCode(false)}
        footer={null}
      >
        <Grid gridTemplateRows="1fr" gridGap="1rem" justifyItems="center">
          <Button onClick={scanBarcode}>Escanear Código de barras</Button>
          <QRScanner>
            <div id="interactive" className="viewport"></div>
          </QRScanner>
        </Grid>
      </Modal>
      <Modal
        visible={isVisibleConfirmDispatch}
        width="60%"
        title="Ha escaneado esta caja, ¿está seguro que desea despachar este producto?"
        onCancel={() => setIsVisibleConfirmDispatch(false)}
        footer={null}
      >
        <Container height="fit-content">
          <Grid gridTemplateColumns="2fr 3fr" gridGap="1rem">
            <Input
              value={dataProduct?.product.familyName}
              disabled
              addonBefore="Familia"
            />
            <Input
              value={dataProduct?.warehouse.name}
              disabled
              addonBefore="Ubicación"
            />
            <Input
              value={dataProduct?.product.subfamilyName}
              disabled
              addonBefore="Sub-Familia"
            />
            <Grid gridTemplateColumns="3fr 2fr" gridGap="1rem">
              <Input
                value={dataProduct?.boxSize}
                disabled
                addonBefore="Tipo de caja"
              />
              <Input disabled value="Unid./Caja" />
            </Grid>
            <Input
              value={dataProduct?.product.elementName}
              disabled
              addonBefore="Elemento"
            />
            <Grid gridTemplateColumns="3fr 2fr" gridGap="1rem">
              <Input
                value={dataProduct?.stock}
                disabled
                addonBefore="Disponibles"
              />
              <Input disabled value="Unidades" />
            </Grid>
            <Input
              value={dataProduct?.product.modelName}
              disabled
              addonBefore="Modelo"
            />
            <Grid gridTemplateColumns="3fr 2fr" gridGap="1rem">
              <Input
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  dataProduct?.stock === Number(e.target.value)
                    ? setCheck(true)
                    : setCheck(false);
                }}
                addonBefore="A Despachar"
              />
              <Checkbox
                checked={check}
                onChange={(e) => {
                  /* console.log("checked", e.target.checked); */
                  setCheck(e.target.checked);
                  e.target.checked ? setQuantity(dataProduct?.stock) : "";
                }}
              >
                Toda la caja
              </Checkbox>
            </Grid>
          </Grid>
        </Container>
        <Button
          onClick={confirmDispatch}
          width="30%"
          margin="2% 5% 2% 40%"
          type="primary"
        >
          Confirmar Despacho
        </Button>
      </Modal>
      <Modal
        visible={isVisible}
        width="90%"
        title="Información del producto"
        onCancel={() => setIsVisible(false)}
        footer={null}
      >
        <ModalProduct id={idModal}></ModalProduct>
      </Modal>
      <Container height="fit-content">
        <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="1rem">
          <Input value={me.name} disabled addonBefore="Usuario" />
          <Input
            value={moment().format(clientDateFormat)}
            disabled
            addonBefore="Fecha"
          />
          <Input value={dispatch.proformaId} disabled addonBefore="Proforma" />
          <Input
            value={dispatch.sale?.status === "DUE" ? "Adeuda" : "Pagado"}
            disabled
            addonBefore="Estatus"
          />
          <Input
            value={dispatch.proforma?.client.name}
            disabled
            addonBefore="Cliente"
          />
          <Input value={dispatch.proforma?.client.lastname} disabled />
          <Input
            value={dispatch.proforma?.client.idNumber}
            disabled
            addonBefore="DNI / RUC"
          />
          <Input
            value={dispatch.proforma?.client.address}
            disabled
            addonBefore="Dirección"
          />
          <Input
            value={dispatch.proforma?.client.region}
            disabled
            addonBefore="Departamento"
          />
          <Input
            value={dispatch.proforma?.client.province}
            disabled
            addonBefore="Provincia"
          />
          <Input
            value={dispatch.proforma?.client.district}
            disabled
            addonBefore="Distrito"
          />
          <Input
            value={dispatch.deliveryAgency?.name}
            disabled
            addonBefore="Agencia"
          />
        </Grid>
      </Container>
      <Container height="fit-content">
        <Table
          columns={columns}
          scroll={{ y: windowHeight * 0.3 - 48 }}
          bordered
          pagination={false}
          dataSource={
            dispatch.dispatchedProducts ? dispatch.dispatchedProducts : []
          }
        />
      </Container>
      <Container height="fit-content" padding="2rem 1rem 1rem"></Container>
      <Container height="fit-content">
        <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="0rem">
          <Button width="30%" margin="2% 5% 2% 40%" type="primary">
            Finalizar despacho
          </Button>
          <Button
            width="30%"
            margin="2% 5% 2% 40%"
            type="primary"
            onClick={async () => router.push(`/dispatch`)}
          >
            Regresar
          </Button>
        </Grid>
      </Container>
    </>
  );
};
