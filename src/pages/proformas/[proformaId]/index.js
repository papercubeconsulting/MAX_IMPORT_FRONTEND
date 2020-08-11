import React, { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Container, Grid, Icon, Select } from "../../../components";
import {
  getElements,
  getFamilies,
  getModels,
  getProduct,
  getProducts,
  getSubfamilies,
  getProforma,
} from "../../../providers";
import { get, orderBy } from "lodash";
import { Input, Table } from "antd";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export default ({ setPageTitle }) => {
  setPageTitle("Proforma");

  //extraccion de params de url
  //const stateUpdateOrigin = useRef("url");
  const router = useRouter();
  const { proformaId } = router.query;

  const columns = [
    {
      dataIndex: "id",
      title: "",
      width: "fit-content",
      align: "center",
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
      dataIndex: "familyId",
      width: "fit-content",
      align: "center",
      render: (familyId, suppliedProduct) => (
        <Select
          value={familyId}
          onChange={(value) =>
            setSuppliedProducts((prevState) => {
              const remainingSuppliedProducts = prevState.filter(
                (_suppliedProduct) => _suppliedProduct.id !== suppliedProduct.id
              );

              return [
                ...remainingSuppliedProducts,
                {
                  id: suppliedProduct.id,
                  dbId: suppliedProduct.dbId,
                  productBoxes: suppliedProduct.productBoxes,
                  quantity: suppliedProduct.quantity,
                  boxSize: suppliedProduct.boxSize,
                  familyId: value,
                },
              ];
            })
          }
          options={selectOptions(families)}
        />
      ),
    },
    {
      title: "Sub-Familia",
      dataIndex: "subfamilyId",
      width: "fit-content",
      align: "center",
      render: (subfamilyId, suppliedProduct) => (
        <Select
          value={subfamilyId}
          onChange={(value) =>
            setSuppliedProducts((prevState) => {
              const remainingSuppliedProducts = prevState.filter(
                (_suppliedProduct) => _suppliedProduct.id !== suppliedProduct.id
              );

              return [
                ...remainingSuppliedProducts,
                {
                  id: suppliedProduct.id,
                  dbId: suppliedProduct.dbId,
                  productBoxes: suppliedProduct.productBoxes,
                  quantity: suppliedProduct.quantity,
                  boxSize: suppliedProduct.boxSize,
                  familyId: suppliedProduct.familyId,
                  subfamilyId: value,
                },
              ];
            })
          }
          options={selectOptions(
            subfamilies.filter(
              (subFamily) => subFamily.familyId === suppliedProduct.familyId
            )
          )}
        />
      ),
    },
    {
      title: "Elemento",
      dataIndex: "elementId",
      width: "fit-content",
      align: "center",
      render: (elementId, suppliedProduct) => (
        <Select
          value={elementId}
          onChange={(value) =>
            setSuppliedProducts((prevState) => {
              const remainingSuppliedProducts = prevState.filter(
                (_suppliedProduct) => _suppliedProduct.id !== suppliedProduct.id
              );

              return [
                ...remainingSuppliedProducts,
                {
                  id: suppliedProduct.id,
                  dbId: suppliedProduct.dbId,
                  productBoxes: suppliedProduct.productBoxes,
                  quantity: suppliedProduct.quantity,
                  boxSize: suppliedProduct.boxSize,
                  familyId: suppliedProduct.familyId,
                  subfamilyId: suppliedProduct.subfamilyId,
                  elementId: value,
                },
              ];
            })
          }
          options={selectOptions(
            elements.filter(
              (element) => element.subfamilyId === suppliedProduct.subfamilyId
            )
          )}
        />
      ),
    },
    {
      title: "Modelo",
      dataIndex: "modelId",
      width: "fit-content",
      align: "center",
      render: (modelId, suppliedProduct) => (
        <Select
          value={modelId}
          onChange={async (value) => {
            const product = await getProduct(value, { noStock: true });

            setSuppliedProducts((prevState) => {
              const remainingSuppliedProducts = prevState.filter(
                (_suppliedProduct) => _suppliedProduct.id !== suppliedProduct.id
              );

              return [
                ...remainingSuppliedProducts,
                {
                  id: suppliedProduct.id,
                  dbId: suppliedProduct.dbId,
                  productBoxes: suppliedProduct.productBoxes,
                  quantity: suppliedProduct.quantity,
                  boxSize: suppliedProduct.boxSize,
                  familyId: suppliedProduct.familyId,
                  subfamilyId: suppliedProduct.subfamilyId,
                  elementId: suppliedProduct.elementId,
                  modelId: value,
                  product,
                },
              ];
            });
          }}
          options={selectOptions(
            models.filter(
              (model) => model.elementId === suppliedProduct.elementId
            )
          )}
        />
      ),
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      width: "fit-content",
      align: "center",
      render: (quantity, suppliedProduct) => (
        <Input
          key={suppliedProducts.length}
          defaultValue={quantity}
          onChange={(event) => {
            setSuppliedProducts((prevState) => {
              const remainingSuppliedProducts = prevState.filter(
                (_suppliedProduct) => _suppliedProduct.id !== suppliedProduct.id
              );

              return [
                ...remainingSuppliedProducts,
                {
                  ...suppliedProduct,
                  quantity: parseFloat(event.nativeEvent.target.value || "0"),
                },
              ];
            });
            event.persist();
          }}
          type="number"
        />
      ),
    },
    {
      title: "Precio",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
      render: (product) => `S/.${get(product, "suggestedPrice", 0).toFixed(2)}`,
    },
    {
      title: "Subtotal",
      dataIndex: "id",
      width: "fit-content",
      align: "center",
      render: (id, row) =>
        `S/.${(
          get(row, "product.suggestedPrice", 0) * get(row, "quantity", 0)
        ).toFixed(2)}`,
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
      render: (id) => (
        <Button padding="0 0.5rem" type="primary">
          VER
        </Button>
      ),
    },
  ];

  //costumizadas por JM
  const [proforma, setProforma] = useState([]);
  //!importadas
  const [suppliedProducts, setSuppliedProducts] = useState([]);

  const [families, setFamilies] = useState([]);
  const [subfamilies, setSubfamilies] = useState([]);
  const [elements, setElements] = useState([]);
  const [models, setModels] = useState([]);

  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

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

  useEffect(() => {
    const fetchFamilies = async () => {
      const _families = await getFamilies();
      setFamilies(_families);
    };
    fetchFamilies();
  }, []);

  useEffect(() => {
    const fetchFamilies = async () => {
      const _families = await getFamilies();
      setFamilies(_families);
    };
    fetchFamilies();
  }, []);

  useEffect(() => {
    const fetchSubfamilies = async () => {
      const _subfamilies = await getSubfamilies(null);
      setSubfamilies(_subfamilies);
    };
    fetchSubfamilies();
  }, []);

  useEffect(() => {
    const fetchElements = async () => {
      const _elements = await getElements(null);
      setElements(_elements);
    };
    fetchElements();
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      const _models = await getModels(null);
      setModels(_models);
    };
    fetchModels();
  }, []);

  const selectOptions = (collection) =>
    collection.map((document) => ({
      value: document.id,
      label: document.name,
    }));

  const mapSuppliedProducts = async (
    products,
    index = 0,
    mappedSuppliedProducts = []
  ) => {
    if (products.length === index) return mappedSuppliedProducts;

    const currentProduct = products[index];
    const {
      familyId,
      subfamilyId,
      elementId,
      modelId,
      boxSize,
      quantity,
    } = currentProduct;

    const productsResult = await getProducts({
      familyId,
      subfamilyId,
      elementId,
      modelId,
    });

    return mapSuppliedProducts(products, index + 1, [
      ...mappedSuppliedProducts,
      {
        productId: productsResult.rows[0].id,
        boxSize,
        quantity,
      },
    ]);
  };

  return (
    <>
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
          dataSource={orderBy(suppliedProducts, "id", "asc")}
        />
      </Container>
      <Container height="fit-content" padding="2rem 1rem 1rem"></Container>
      <Container height="fit-content">
        <Grid gridTemplateColumns="45% 45%" gridGap="10%">
          <Grid gridTemplateColumns="1fr 1fr 1fr" gridGap="2rem">
            <Input value="S/.0.00" addonBefore="A Cuenta" />
            <Input value="S/.0.00" addonBefore="Deuda" />
            <br />
            <Button
              type="primary"
              onClick={async () => router.push(`/proformas`)}
            >
              Retroceder
            </Button>
          </Grid>
          <Grid gridTemplateColumns="5fr 2fr" gridGap="2rem">
            <Input value="S/.0.00" addonBefore="Total" />
            <br />
            <Input value="S/.0.00" addonBefore="Descuento" />
            <Input value="0%" />
            <Input value="S/.0.00" addonBefore="Total Final" />
            <br />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
