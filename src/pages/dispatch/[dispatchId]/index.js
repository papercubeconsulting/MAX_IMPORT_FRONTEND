import React, { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Container, Grid, ModalProduct } from "../../../components";
import { getDispatch, userProvider } from "../../../providers";
import { get } from "lodash";
import { Input, Table, Modal } from "antd";
import moment from "moment";
import { clientDateFormat } from "../../../util";

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
            console.log(product.id);
            setIdModal(product.id);
            console.log(product);
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
      render: (id, product) => (
        <Button padding="0 0.5rem" type="primary">
          Despachar
        </Button>
      ),
    },
  ];

  const [dispatch, setDispatch] = useState([]);
  const [windowHeight, setWindowHeight] = useState(0);

  //Modal
  const [isVisible, setIsVisible] = useState(false);
  const [idModal, setIdModal] = useState("");

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
        console.log(_dispatch);
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
      <Container padding="0px" width="100vw" height="35%">
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
