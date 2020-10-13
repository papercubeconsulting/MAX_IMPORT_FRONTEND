import React, { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Button,
  Container,
  Grid,
  ModalProduct,
  DatePicker,
  Icon,
} from "../../../components";
import { userProvider } from "../../../providers";
import { get } from "lodash";
import { Input, Table, Modal } from "antd";
import moment from "moment";
import { clientDateFormat } from "../../../util";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

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
    },
    {
      title: "Sub-Familia",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Elemento",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Modelo",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      width: "fit-content",
      align: "center",
    },
    {
      title: "Disponibilidad",
      dataIndex: "unitPrice",
      width: "fit-content",
      align: "center",
    },
    {
      dataIndex: "id",
      width: "fit-content",
      align: "center",
      render: (id, product) => (
        <Button
          padding="0 0.5rem"
          type="primary"
          onClick={() => {
            setIsVisible(true);
            setIdModal(product.productId);
          }}
        >
          VER
        </Button>
      ),
    },
    {
      title: "",
      dataIndex: "subtotal",
      width: "fit-content",
      align: "center",
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
  /* useMemo(() => {
    const fetchProforma = async () => {
      try {
        const _dispatch = await getDispatch(dispatchId);
        setDispatch(_dispatch);
      } catch (error) {
        console.log(error)
      }
    };
    dispatchId && fetchProforma();
  }, [router]); */

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
          <Input disabled addonBefore="Fecha" />
          <Input disabled addonBefore="Proforma" />

          <Input disabled addonBefore="Estatus" />

          <Input disabled addonBefore="Cliente" />
          <Input disabled />

          <Input disabled addonBefore="DNI / RUC" />
          <Input disabled addonBefore="Dirección" />

          <Input disabled addonBefore="Departamento" />

          <Input disabled addonBefore="Provincia" />

          <Input disabled addonBefore="Distrito" />

          <Input disabled addonBefore="Agencia" />
        </Grid>
      </Container>
      <Container padding="0px" width="100vw" height="35%">
        <Table
          columns={columns}
          scroll={{ y: windowHeight * 0.3 - 48 }}
          bordered
          pagination={false}
          dataSource={dispatch}
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
