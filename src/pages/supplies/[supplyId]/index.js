import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { useRouter } from "next/router";
import { get, orderBy } from "lodash";
import { Input, notification, Table, Popconfirm } from "antd";
import {
  faCalendarAlt,
  faPlus,
  faPrint,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import {
  getElements,
  getFamilies,
  getModels,
  getProduct,
  getProducts,
  getProviders,
  getSubfamilies,
  getSupply,
  getWarehouses,
  postSupply,
  putSupply,
  putSupplyStatus,
  deleteSupplyProduct,
  userProvider,
} from "../../../providers";
import { clientDateFormat, serverDateFormat } from "../../../util";

import { Attend } from "../../../components/supplies/[supplyId]";
import {
  Button,
  Container,
  Grid,
  Icon,
  Select,
  AutoComplete,
  DatePicker,
} from "../../../components";

export default ({ setPageTitle }) => {
  const [providers, setProviders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [supply, setSupply] = useState(null);
  const [providerId, setProviderId] = useState(null);
  const [warehouseId, setWarehouseId] = useState(null);
  const [code, setCode] = useState(null);
  const [arrivalDate, setArrivalDate] = useState(moment());
  const [suppliedProducts, setSuppliedProducts] = useState([]);
  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);
  const [me, setMe] = useState({ name: null });

  const [families, setFamilies] = useState([]);
  const [subfamilies, setSubfamilies] = useState([]);
  const [elements, setElements] = useState([]);
  const [models, setModels] = useState([]);

  const [loadingSupply, setLoadingSupply] = useState(false);

  const [attendedProduct, setAttendedProduct] = useState(null);
  const [visibleAttendModal, setVisibleAttendModal] = useState(false);

  const router = useRouter();
  const { supplyId, operation } = router.query;
  const isNew = supplyId === "new";
  const isAttend = operation === "attend";
  const isEdit = get(supply, "status", null) === "Pendiente" && !isAttend;
  const disabled = !isEdit && !isNew;
  setPageTitle("Abastecimiento");
  // console.log("suplied", suppliedProducts)

  const columns = [
    {
      title: "Movimiento",
      dataIndex: "id",
      width: "120px",
      align: "center",
      render: (id, suppliedProduct) => (
        <>
          <Button
            padding="0 0.5rem"
            onClick={() => {
              if (disabled) {
                setAttendedProduct(suppliedProduct);
                return setVisibleAttendModal(true);
              }

              setSuppliedProducts((prevState) =>
                prevState
                  .filter((suppliedProduct) => suppliedProduct.id !== id)
                  .map((suppliedProduct, index) => ({
                    ...suppliedProduct,
                    id: index + 1,
                  }))
              );
            }}
            type="primary"
          >
            <Icon
              marginRight="0px"
              fontSize="0.8rem"
              icon={disabled ? faPrint : faTrash}
            />
          </Button>
          {!isNew && (
            <Popconfirm
              title="¿Esta seguro de desea eliminar este ítem?"
              onConfirm={() => deleteProduct(suppliedProduct.dbId)}
              onCancel={() => { }}
              okText="Si"
              cancelText="No"
            >
              <Button padding="0 0.5rem" margin="0 0 0 0.5rem" type="danger">
                <Icon marginRight="0px" fontSize="0.8rem" icon={faTrash} />
              </Button>
            </Popconfirm>
          )}
        </>
      ),
    },
    {
      dataIndex: "id",
      title: "Ítem",
      width: "40px",
      align: "center",
    },
    {
      title: "Familia",
      dataIndex: "familyId",
      align: "center",
      render: (familyId, suppliedProduct) => (
        <Select
          value={familyId}
          disabled={disabled}
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
      align: "center",
      render: (subfamilyId, suppliedProduct) => {
        if (suppliedProduct.familyId && !subfamilyId) {
          const _subfamily = subfamilies.filter(
            (subFamily) => subFamily.familyId === suppliedProduct.familyId
          );
          const _chosenSubFamily = _subfamily.find((elem) => elem.name === "-");
          if (_chosenSubFamily) {
            subfamilyId = _chosenSubFamily.id;
            suppliedProduct.subfamilyId = _chosenSubFamily.id;
          }
        }
        return (
          <Select
            value={subfamilyId}
            disabled={disabled}
            onChange={(value) => {
              setSuppliedProducts((prevState) => {
                const remainingSuppliedProducts = prevState.filter(
                  (_suppliedProduct) =>
                    _suppliedProduct.id !== suppliedProduct.id
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
              });
            }}
            options={selectOptions(
              subfamilies.filter(
                (subFamily) => subFamily.familyId === suppliedProduct.familyId
              )
            )}
          />
        );
      },
    },
  ];


  useEffect(() => {
    const fetchProviders = async () => {
      const _providers = await getProviders({ active: true });
      setProviders(_providers);
    };
    fetchProviders();
  }, []);

  useEffect(() => {
    const fetchWarehouses = async () => {
      const _warehouses = await getWarehouses("Almacén");
      setWarehouses(_warehouses);
    };
    fetchWarehouses();
  }, []);

  useEffect(() => {
    const fetchFamilies = async () => {
      const _families = await getFamilies(providerId);
      setFamilies(_families);
    };
    if (providerId) fetchFamilies();
  }, [providerId]);

  useEffect(() => {
    const fetchSubfamilies = async () => {
      const _subfamilies = await getSubfamilies(null, providerId);
      setSubfamilies(_subfamilies);
    };
    if (providerId) fetchSubfamilies();
  }, [providerId]);

  useEffect(() => {
    const fetchElements = async () => {
      const _elements = await getElements(null, providerId);
      setElements(_elements);
    };
    if (providerId) fetchElements();
  }, [providerId]);

  useEffect(() => {
    const fetchModels = async () => {
      const _models = await getModels(null, providerId);
      setModels(_models);
    };
    if (providerId) fetchModels();
  }, [providerId]);

  useEffect(() => {
    const fetchSupply = async (supplyId) => {
      if (isNew) {
        const _me = await userProvider.getUser();
        setMe(_me);
        return;
      }

      const _supply = await getSupply(supplyId);

      setArrivalDate(moment(_supply.arrivalDate));
      setSupply(_supply);
      setProviderId(get(_supply, "providerId", null));
      setWarehouseId(get(_supply, "warehouseId", null));
      setCode(get(_supply, "code", null));
      setSuppliedProducts(
        get(_supply, "suppliedProducts", []).map((suppliedProduct, index) => ({
          id: index + 1,
          dbId: suppliedProduct.id,
          productBoxes: suppliedProduct.productBoxes,
          familyId: get(suppliedProduct, "product.familyId", null),
          subfamilyId: get(suppliedProduct, "product.subfamilyId", null),
          elementId: get(suppliedProduct, "product.elementId", null),
          modelId: get(suppliedProduct, "product.modelId", null),
          quantity: get(suppliedProduct, "quantity", null),
          boxSize: get(suppliedProduct, "boxSize", null),
          product: get(suppliedProduct, "product", null),
        }))
      );
    };

    if (supplyId) fetchSupply(supplyId);
  }, [supplyId, toggleUpdateTable]);

  useEffect(() => {
    console.log(suppliedProducts);
  }, [suppliedProducts]);

  const enablePost = useMemo(() => {
    if (!suppliedProducts.length) return false;

    return suppliedProducts.reduce((accumulator, suppliedProduct) => {
      const { familyId, subfamilyId, elementId, modelId, boxSize, quantity } =
        suppliedProduct;

      return (
        accumulator &&
        !!(
          familyId &&
          subfamilyId &&
          elementId &&
          modelId &&
          boxSize &&
          quantity
        ) &&
        providerId &&
        warehouseId &&
        code
      );
    }, true);
  }, [suppliedProducts, providerId, warehouseId, code]);

  const selectOptions = (collection) =>
    collection.map((document) => ({
      value: document.id,
      label: document.name,
    }));

  const onSubmit = async () => {
    try {
      setLoadingSupply(true);
      const mappedSuppliedProducts = await mapSuppliedProducts(
        suppliedProducts
      );

      const body = {
        suppliedProducts: mappedSuppliedProducts,
        providerId,
        warehouseId,
        code,
        arrivalDate,
      };

      if (isEdit) {
        await putSupply(supplyId, body);
      } else {
        await postSupply(body);
      }
      await router.push("/supplies");
      setLoadingSupply(false);
    } catch (error) {
      notification.error({
        message: "No se pudo crear abastecimiento",
        description: error.message,
      });
      setLoadingSupply(false);
    }
  };

  const mapSuppliedProducts = async (
    products,
    index = 0,
    mappedSuppliedProducts = []
  ) => {
    if (products.length === index) return mappedSuppliedProducts;

    const currentProduct = products[index];
    const { familyId, subfamilyId, elementId, modelId, boxSize, quantity } =
      currentProduct;

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

  const finishAttend = async () => {
    try {
      setLoadingSupply(true);

      await putSupplyStatus(supplyId, "Atendido");
      await router.push("/supplies");

      setLoadingSupply(false);
    } catch (error) {
      setLoadingSupply(false);
      notification.error({
        message: "No se pudo finalizar atención",
        description: error.message,
      });
    }
  };

  const deleteProduct = async (id) => {
    try {
      const response = await deleteSupplyProduct(supplyId, id);
      console.log(id, "eliminado", response);
      setToggleUpdateTable((prev) => !prev);
      notification.success({
        message: "Producto eliminado exitosamente ",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Container height="auto">
        <Grid gridTemplateColumns="1fr 1fr 1fr" gridGap="2rem">
          <Select
            value={providerId}
            disabled={disabled || suppliedProducts.length}
            label="Proveedor"
            onChange={(value) => setProviderId(value)}
            options={selectOptions(providers)}
          />
          <Select
            value={warehouseId}
            disabled={disabled}
            label="Almacén"
            onChange={(value) => setWarehouseId(value)}
            options={selectOptions(warehouses)}
          />
          <Input
            value={code}
            disabled={disabled}
            onChange={(event) => setCode(event.target.value)}
            addonBefore="Código de Carga"
          />
        </Grid>
      </Container>

      <Container height="auto">
        <Grid gridTemplateColumns="1fr 1fr 1fr" gridGap="2rem">
          <DatePicker
            value={arrivalDate}
            onChange={(value) => setArrivalDate(value)}
            format={clientDateFormat}
            disabled={disabled}
            label={
              <>
                <Icon icon={faCalendarAlt} />
                Fecha de llegada
              </>
            }
          />
          <Input value={me.name} disabled addonBefore="Usuario" />
        </Grid>
      </Container>
      <Table
        columns={columns}
        bordered
        rowKey={record => record.id}
        dataSource={orderBy(suppliedProducts, "id", "asc")}
      />
      {!disabled && (
        <Container height="5rem">
          <Button
            padding="0 0.5rem"
            disabled={!providerId}
            onClick={() =>
              setSuppliedProducts((prevState) => [
                ...prevState,
                { id: suppliedProducts.length + 1 },
              ])
            }
            type="primary"
          >
            <Icon fontSize="1rem" icon={faPlus} />
            Agregar producto
          </Button>
        </Container>
      )}
      <Container height="20%" alignItems="center" flexDirection="column">
        {(isEdit || isNew) && (
          <Button
            size="large"
            disabled={!enablePost}
            loading={loadingSupply}
            onClick={onSubmit}
            margin="0 0 1rem 0"
            width="80%"
            type="primary"
          >
            {isEdit ? "Actualizar" : "Crear"} abastecimiento
          </Button>
        )}
        {operation === "attend" && (
          <Button
            size="large"
            width="80%"
            onClick={finishAttend}
            loading={loadingSupply}
            type="primary"
          >
            Finalizar atención
          </Button>
        )}
      </Container>
      {visibleAttendModal && (
        <Attend
          visible={visibleAttendModal}
          supplyId={supplyId}
          trigger={setVisibleAttendModal}
          product={attendedProduct}
        />
      )}
    </>
  );
};
