import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { get } from "lodash";
import { Input, Modal, Table, Tag, notification } from "antd";
import { faPeopleCarry } from "@fortawesome/free-solid-svg-icons";
import moment from "moment-timezone";

import {
  getProductBox,
  putProductBox,
  getWarehouses,
} from "../../../providers";

import { Container, Grid, Select, Button, Icon } from "../../../components";
import { ReadProductCode } from "../../../components/products/productBoxes/ReadProductCode";
import { useWarehouses } from "../../../util/hooks/useWarehouses";

export default ({ setPageTitle, setShowButton }) => {
  setPageTitle("Caja de productos");
  setShowButton(true);
  const productBoxLogColumns = [
    {
      width: "20%",
      title: "Fecha",
      dataIndex: "createdAt",
      key: "date",
      align: "center",
      render: (datetime) =>
        moment(datetime).tz("America/Lima").locale("es").format("dddd LL"),
    },
    {
      width: "20%",
      title: "Hora",
      dataIndex: "createdAt",
      key: "time",
      align: "center",
      render: (datetime) =>
        moment(datetime).tz("America/Lima").locale("es").format("h:mm a"),
    },
    {
      width: "20%",
      title: "Usuario",
      dataIndex: "user",
      align: "center",
      render: (user) => `${user.name} ${user.lastname}`,
    },
    {
      width: "20%",
      title: "Acción",
      dataIndex: "log",
      align: "center",
    },
    {
      width: "20%",
      title: "Almacen",
      // title: "Ubicación",
      dataIndex: "warehouse",
      align: "center",
      render: (warehouse) => warehouse.name,
    },
    {
      width: "20%",
      title: "Subdivision",
      dataIndex: "warehouse",
      align: "center",
      render: (warehouse) => warehouse.subDivision || "-",
    },
  ];

  const {
    selectOptionsWarehouse,
    onChangeWarehouseName,
    onChangeSubVisionSelect,
    selectOptionsUbicacion,
    subDivisionName,
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

  const [productBox, setProductBox] = useState(null);
  const [product, setProduct] = useState(null);
  const [newWarehouse, setNewWarehouse] = useState({});
  // const [warehouses, setWarehouses] = useState([]);
  // const [productBoxLogs, setProductBoxLogs] = useState(null);
  const [
    isModalReadProductBoxCodeVisible,
    setIsModalReadProductBoxCodeVisible,
  ] = useState(false);

  const router = useRouter();
  const { productBoxCode } = router.query;

  useMemo(() => {
    const fetchProductBox = async () => {
      try {
        const _productBox = await getProductBox(productBoxCode);
        setProductBox(_productBox);
        setProduct(get(_productBox, "product", {}));
        // setProductBoxLogs(get(_productBox, 'productBoxLogs', []));
      } catch (error) {
        Modal.error({
          title: "Código no encontrado",
          content: error.message,
          onOk: () => router.back(),
        });
      }
    };

    productBoxCode && fetchProductBox();
  }, [router]);

  // useEffect(() => {
  //   const fetchWarehouses = async () => {
  //     const _warehouses = await getWarehouses();
  //     setWarehouses(_warehouses);
  //   };
  //   fetchWarehouses();
  // }, []);

  const selectOptions = (collection) =>
    collection.map((document) => ({
      label: document.name,
      value: document.id,
    }));

  const confirmMoveProductBox = () => {
    if (!warehouseId || warehouseId === productBox.warehouseId) {
      return notification.error({
        message: "Error al intentar mover la caja",
        description: "Debe seleccionar una ubicación distinta a la actual",
      });
    }

    Modal.confirm({
      width: "50%",
      title: "¿Está seguro de que desea cambiar la ubicación de la caja?",
      onOk: async () => moveProductBox(),
      content: (
        <Container padding="20px" flexDirection="column">
          <Grid
            gridTemplateColumns="repeat(1fr)"
            gridTemplateRows="repeat(1, 1fr)"
            justifyContent="center"
            gridGap="1rem"
          >
            <Input
              disabled
              addonBefore="Código de caja"
              value={productBoxCode}
            />
            <Input
              disabled
              addonBefore="Almacen actual"
              // addonBefore="Ubicación actual"
              value={productBox.warehouse.name}
            />
            <Input
              disabled
              addonBefore="Subdivision actual"
              // addonBefore="Ubicación actual"
              value={productBox.warehouse.subDivision || "-"}
            />
            <Input disabled addonBefore="Nuevo Almacen" value={warehouseName} />
            <Input
              disabled
              addonBefore="Nueva Subdivision"
              value={subDivisionName}
            />
          </Grid>
        </Container>
      ),
    });
  };

  const moveProductBox = async () => {
    try {
      const body = {
        message: "MOVEMENT",
        // warehouseId: newWarehouse.id,
        warehouseId,
      };

      // props.trigger(false);

      const response = await putProductBox(productBox.id, body);

      Modal.success({
        width: '60%',
        title: "Se ha movida la caja correctamente",
        // content: `Caja: ${productBoxCode} | Nueva ubicación: ${warehouseName}`,
        content: `Caja: ${productBoxCode} | Nuevo Almacen: ${warehouseName} | Nueva Subvidion: ${subDivisionName}`,
        onOk: () => router.reload(),
      });
    } catch (error) {
      Modal.error({
        title: "Error al intentar subir producto",
        content: error.message,
        // onOk: () => props.toggleUpdateTable(prevState => !prevState)
      });
    }
  };
  return (
    <>
      <ReadProductCode
        visible={isModalReadProductBoxCodeVisible}
        trigger={setIsModalReadProductBoxCodeVisible}
      />
      <Container height="auto" flexDirection="column">
        <Grid gridTemplateRows="1fr" gridGap="1rem">
          <Grid
            gridTemplateColumns="repeat(3, 1fr)"
            gridTemplateRows="repeat(1, 2rem)"
            gridGap="1rem"
          >
            <Input
              disabled
              addonBefore="Código Inventario"
              value={get(product, "code", "-")}
            />
            <Input
              disabled
              addonBefore="Código de caja"
              value={get(productBox, "trackingCode", "-")}
            />
            <Input
              disabled
              addonBefore="Código de abastecimiento"
              value={get(productBox, "supplyId", "-")}
            />
            <Input
              disabled
              addonBefore="Correlativo en abastecimiento"
              value={get(productBox, "indexFromSupliedProduct", "-")}
            />
            <Input
              disabled
              addonBefore="Familia"
              value={get(product, "familyName", "-")}
            />
            <Input
              disabled
              addonBefore="Sub-Familia"
              value={get(product, "subfamilyName", "-")}
            />
            <Input
              disabled
              addonBefore="Elemento"
              value={get(product, "elementName", "-")}
            />
            <Input
              disabled
              addonBefore="Modelo"
              value={get(product, "modelName", "-")}
            />
            <Input
              disabled
              addonBefore="Proveedor"
              value={get(product, "provider.name", "-")}
            />
            <Input
              disabled
              // addonBefore="Ubicación"
              addonBefore="Almacen - Subdivision"
              value={`${get(productBox, "warehouse.name", "-")} (${get(
                productBox,
                "warehouse.subDivision",
                "-",
              )})`}
            />
            <Input
              disabled
              addonBefore="Unidades/caja"
              value={get(productBox, "boxSize", "-")}
            />
            <Input
              disabled
              addonBefore="Unidades disponibles"
              value={get(productBox, "stock", "-")}
            />
          </Grid>
        </Grid>
      </Container>
      <Container
        height="auto"
        //    width="50%"
        flexDirection="column"
        textAlign="center"
        justifyContent="center"
        alignItems="center"
        padding="1rem"
      >
        <h3>Movimiento de caja</h3>
        <Grid
          gridTemplateColumns="2fr  2fr 1fr"
          gridTemplateRows="repeat(1, 1fr)"
          justifyContent="center"
          gridGap="1rem"
        >
          <Select
            value={warehouseName}
            label="Almacen"
            // onChange={(value) => setWarehouseName(value)}
            onChange={onChangeWarehouseName}
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
            label="Subdivision"
            onChange={onChangeSubVisionSelect}
            // onChange={(value) => {
            //   const _warehouse = warehouses.find(
            //     (warehouse) => warehouse.id === value
            //   );
            //   setNewWarehouse(_warehouse);
            // }}
            options={selectOptionsUbicacion(listOfSubdivisions)}
          />
          {/* <Select */}
          {/*   value={newWarehouse.name} */}
          {/*   label="Ubicación destino" */}
          {/*   onChange={(value) => { */}
          {/*     const _warehouse = warehouses.find( */}
          {/*       (warehouse) => warehouse.id === value */}
          {/*     ); */}
          {/*     setNewWarehouse(_warehouse); */}
          {/*   }} */}
          {/*   options={selectOptions(warehouses)} */}
          {/* /> */}
          <Button onClick={() => confirmMoveProductBox()} type="primary">
            <Icon icon={faPeopleCarry} />
            Mover
          </Button>
        </Grid>
      </Container>
      <Container
        height="auto"
        flexDirection="column"
        textAlign="center"
        padding="1rem 0"
      >
        <Grid gridTemplateRows="repeat(1, auto)" gridGap="1rem">
          <div>
            <h3>Bitácora de movimientos de caja</h3>
            <br />
            <Table
              columns={productBoxLogColumns}
              bordered
              scrollToFirstRowOnChange
              pagination={false}
              rowKey="id"
              dataSource={get(productBox, "productBoxLogs", [])}
            />
          </div>
        </Grid>
      </Container>
      <Container height="15%" justifyContent="space-around">
        <Button
          onClick={() => setIsModalReadProductBoxCodeVisible(true)}
          size="large"
          width="30%"
          type="primary"
        >
          Mover Caja(s)
        </Button>
      </Container>
    </>
  );
};
