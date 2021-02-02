import React, { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Container, Grid, ModalProduct } from "../../../components";
import { getProforma } from "../../../providers";
import { get } from "lodash";
import { Input, Table, Modal } from "antd";

export default ({ setPageTitle }) => {
  setPageTitle("Información de proforma");
  //extraccion de params de url
  const router = useRouter();
  const { proformaId } = router.query;

  const columns = [
    {
      dataIndex: "id",
      title: "",
      width: "fit-content",
      align: "center",
      render: (id, record, index) => index + 1,
    },
    {
      title: "Cód. Inventario",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
      render: (product) => get(product, "code", null),
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
      title: "Precio",
      dataIndex: "unitPrice",
      width: "fit-content",
      align: "center",
      render: (unitPrice) => `S/.${(unitPrice / 100).toFixed(2)}`,
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      width: "fit-content",
      align: "center",
      render: (subtotal) => `S/.${(subtotal / 100).toFixed(2)}`,
    },
    {
      title: "Disponibilidad",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
      render: (product) => get(product, "availableStock", 0),
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
  ];

  //costumizadas por JM
  const [proforma, setProforma] = useState([]);
  const [windowHeight, setWindowHeight] = useState(0);

  //Modal
  const [isVisible, setIsVisible] = useState(false);
  const [idModal, setIdModal] = useState("");

  //para setear el tamaño de pantalla
  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  //para setear la info de la proforma
  useMemo(() => {
    const fetchProforma = async () => {
      try {
        const _proforma = await getProforma(proformaId);
        setProforma(_proforma);
      } catch (error) {
        router.back();
      }
    };
    proformaId && fetchProforma();
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
          <Input value={proformaId} disabled addonBefore="Proforma" />
          <Input
            value={proforma.statusDescription}
            disabled
            addonBefore="Estatus"
          />
          <Input
            value={proforma.dispatchStatusDescription}
            disabled
            addonBefore="Despacho"
          />

          <Input
            value={proforma.client ? proforma.client.idNumber : ""}
            disabled
            addonBefore="DNI/RUC"
          />

          <Input
            value={proforma.client ? proforma.client.name : ""}
            disabled
            addonBefore="Cliente"
          />
          <Input
            value={proforma.client ? proforma.client.lastname : ""}
            disabled
          />

          <Input
            value={proforma.client ? proforma.client.email : ""}
            disabled
            addonBefore="Correo"
          />
          <Input
            value={proforma.client ? proforma.client.phoneNumber : ""}
            disabled
            addonBefore="Teléfono"
          />

          <Input
            value={proforma.client ? proforma.client.region : ""}
            disabled
            addonBefore="Departamento"
          />

          <Input
            value={proforma.client ? proforma.client.province : ""}
            disabled
            addonBefore="Provincia"
          />

          <Input
            value={proforma.client ? proforma.client.district : ""}
            disabled
            addonBefore="Distrito"
          />

          <Input
            value={proforma.client ? proforma.client.address : ""}
            disabled
            addonBefore="Dirección"
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
            proforma.proformaProducts ? proforma.proformaProducts : []
          }
        />
      </Container>
      <Container height="fit-content" padding="2rem 1rem 1rem"></Container>
      <Container height="fit-content">
        <Grid gridTemplateColumns="45% 45%" gridGap="10%">
          <Grid gridTemplateColumns="2fr 5fr" gridGap="2rem">
            <br />
            <Input
              value={
                proforma.sale?.due
                  ? `S/.${(proforma.sale.due / 100).toFixed(2)}`
                  : `-`
              }
              disabled
              addonBefore="Efectivo"
            />
            <br />

            <Input
              value={
                proforma.sale?.credit
                  ? `S/.${(proforma.sale.credit / 100).toFixed(2)}`
                  : `-`
              }
              disabled
              addonBefore="Crédito"
            />
            <br />
            <Button
              type="primary"
              disabled={proforma.status === "CLOSED"}
              onClick={async () => router.push(`/proforma?id=${proformaId}`)}
            >
              EDITAR
            </Button>
          </Grid>
          <Grid gridTemplateColumns="5fr 2fr" gridGap="2rem">
            <Input
              value={
                proforma.subtotal
                  ? `S/.${(proforma.subtotal / 100).toFixed(2)}`
                  : `S/.0.00`
              }
              disabled
              addonBefore="Total"
            />
            <br />
            <Input
              value={
                proforma.discount
                  ? `S/.${(proforma.discount / 100).toFixed(2)}`
                  : `S/.0.00`
              }
              disabled
              addonBefore="Descuento"
            />
            <Input
              value={
                proforma.discount
                  ? `${((proforma.discount * 100) / proforma.subtotal).toFixed(
                      2
                    )}%`
                  : `0.00%`
              }
              disabled
            />
            <Input
              value={
                proforma.total
                  ? `S/.${(proforma.total / 100).toFixed(2)}`
                  : `S/.0.00`
              }
              disabled
              addonBefore="Total Final"
            />
            <br />
          </Grid>
        </Grid>
      </Container>
      <Button
        width="20%"
        margin="2% 5% 2% 40%"
        type="primary"
        onClick={async () => router.back()}
      >
        Regresar
      </Button>
    </>
  );
};
