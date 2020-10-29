import React, { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Container, Grid, ModalProduct } from "../../../components";
import {
  getDispatch,
  userProvider,
  getProductBox,
  postDispatchProduct,
  postFinishDispatch,
} from "../../../providers";
import { get } from "lodash";
import { Input, Table, Modal, Checkbox, notification } from "antd";
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
      width: "70px",
      align: "center",
      render: (id, record, index) => index + 1,
    },
    {
      title: "Familia",
      dataIndex: "product",
      align: "center",
      render: (product) => get(product, "familyName", null),
    },
    {
      title: "Sub-Familia",
      dataIndex: "product",
      align: "center",
      render: (product) => get(product, "subfamilyName", null),
    },
    {
      title: "Elemento",
      dataIndex: "product",
      align: "center",
      render: (product) => get(product, "elementName", null),
    },
    {
      title: "Modelo",
      dataIndex: "product",
      align: "center",
      render: (product) => get(product, "modelName", null),
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      align: "center",
    },
    {
      title: "Cantidad despachada",
      dataIndex: "dispatched",
      align: "center",
    },
    {
      title: "Disponibilidad",
      dataIndex: "product",
      align: "center",
      render: (product) => get(product, "availableStock", null),
    },
    {
      dataIndex: "product",
      align: "center",
      width: "70px",
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
      align: "center",
      render: (id, data) => (
        <Button
          disabled={data.quantity === data.dispatched}
          padding="0 0.5rem"
          type="primary"
          onClick={() => {
            setIsVisibleReadProductCode(true);
            setDispatchedProductId(id);
          }}
        >
          {data.quantity === data.dispatched ? "Entregado" : "Despachar"}
        </Button>
      ),
    },
    {
      title: "Fecha de atención",
      dataIndex: "updatedAt",
      align: "center",
      render: (updatedAt) =>
        `${moment(updatedAt).format("DD/MM")} ${moment(updatedAt).format(
          "hh:mm"
        )}`,
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
            setProductBoxId(_productBox.id);
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
  const [check, setCheck] = useState(false);
  const [quantity, setQuantity] = useState();
  const [dispatchedProductId, setDispatchedProductId] = useState();
  const [productBoxId, setProductBoxId] = useState();

  const confirmDispatch = async () => {
    try {
      if (quantity <= 0) {
        notification.error({
          message: "Error al confirmar despacho",
          description: "La cantidad a despachar debe ser un numero mayor a 0",
        });
        return;
      }
      const _resp = await postDispatchProduct(dispatchId, dispatchedProductId, {
        quantity,
        productBoxId,
      });
      /* console.log("respuesta", _resp); */
      notification.success({
        message: "Despacho realizado exitosamente",
      });
      setIsVisibleConfirmDispatch(false);
      setQuantity();
    } catch (error) {
      notification.error({
        message: "Error al confirmar despacho",
        description: error.userMessage,
      });
    }
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
        console.log(_dispatch);
        setDispatch(_dispatch);
      } catch (error) {
        console.log(error);
      }
    };
    dispatchId && fetchProforma();
  }, [router, isVisibleConfirmDispatch]);

  // Finalizar despacho
  const [isVisibleFinishDispatch, setIsVisibleFinishDispatch] = useState(false);

  const finishDispatch = async () => {
    try {
      const _resp = await postFinishDispatch(dispatchId);
      console.log(_resp);
      notification.success({
        message: "Despacho finalizado exitosamente",
      });
      setIsVisibleFinishDispatch(false);
      router.push("/dispatchHistory");
    } catch (error) {
      notification.error({
        message: "Error al finalizar despacho",
        description: error.userMessage,
      });
    }
  };

  return (
    <>
      <Modal
        visible={isVisibleFinishDispatch}
        width="40%"
        onCancel={() => setIsVisibleFinishDispatch(false)}
        footer={null}
      >
        <Container
          height="fit-content"
          flexDirection="column"
          alignItems="center"
        >
          <p style={{ fontWeight: "bold" }}>
            ¿Está seguro que desea finalizar el despacho total?
          </p>
          <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="0rem">
            <Button onClick={finishDispatch} margin="auto" type="primary">
              Si, confirmar
            </Button>
            <Button
              margin="auto"
              type="primary"
              onClick={() => setIsVisibleFinishDispatch(false)}
            >
              No, regresar
            </Button>
          </Grid>
        </Container>
      </Modal>
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
        onCancel={() => {
          setIsVisibleConfirmDispatch(false);
          setQuantity();
        }}
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
                  setQuantity(Number(e.target.value));
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
            value={dispatch.status === "OPEN" ? "Pendiente" : "Completado"}
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
          <Button
            onClick={() => setIsVisibleFinishDispatch(true)}
            width="30%"
            margin="2% 5% 2% 40%"
            type="primary"
            disabled={dispatch.status === "COMPLETED"}
          >
            Finalizar despacho
          </Button>
          <Button
            width="30%"
            margin="2% 5% 2% 40%"
            type="primary"
            onClick={async () => router.back()}
          >
            Regresar
          </Button>
        </Grid>
      </Container>
    </>
  );
};
