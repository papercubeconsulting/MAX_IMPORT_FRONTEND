import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { useRouter } from "next/router";
import { get, orderBy } from "lodash";
import {
  Input,
  Tag,
  Popover,
  notification,
  Badge,
  Table,
  Popconfirm,
  Timeline,
} from "antd";
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
import { FileTextOutlined } from "@ant-design/icons";
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
import { ModalCargaMasiva } from "../../../components/supplies/[supplyId]/ModalCargaMasiva";
import { useLogsSupply } from "../../../util/hooks/useLogsSupply";
import { FloatButton } from "../../../components/FloatButton";
import { ModalLogs, TimeLineItem } from "../../../components/ModalLogs";

export default ({ setPageTitle }) => {
  setPageTitle("Abastecimiento");
  const [providers, setProviders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isVisibleLogs, setVisibleLogs] = useState(false);
  const [supply, setSupply] = useState(null);
  const [providerId, setProviderId] = useState(null);
  const [warehouseId, setWarehouseId] = useState(null);
  const [code, setCode] = useState(null);
  const [arrivalDate, setArrivalDate] = useState(moment());
  const [suppliedProducts, setSuppliedProducts] = useState([]);
  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);
  const [me, setMe] = useState({ name: null });
  const [selectedRow, setSelectedRow] = useState(null);
  const [families, setFamilies] = useState([]);
  const [subfamilies, setSubfamilies] = useState([]);
  const [elements, setElements] = useState([]);
  const [models, setModels] = useState([]);
  const [onUpdateBoxes, setUpdateBoxes] = useState(false);
  const [loadingSupply, setLoadingSupply] = useState(false);
  const [isModalCargaVisible, setIsModalCargaVisible] = useState(false);
  const [attendedProduct, setAttendedProduct] = useState(null);
  const [visibleAttendModal, setVisibleAttendModal] = useState(false);
  const router = useRouter();
  const { supplyId, operation } = router.query;
  const isNew = supplyId === "new";
  const isAttend = operation === "attend";
  const isEdit = get(supply, "status", null) === "Pendiente" && !isAttend;
  const disabled = !isEdit && !isNew;

  const sumQuantity = suppliedProducts?.reduce(
    (prev, curr) => {
      const totalQuantity = prev.totalQuantity + curr.quantity * curr.boxSize;

      let totalInitQuantity;

      /*if the product has bot initQuantity and initBoxSize consider thtat to the total*/

      if (curr.initQuantity >= 0 && curr.initBoxSize >= 0) {
        totalInitQuantity =
          prev.totalInitQuantity + curr.initQuantity * curr.initBoxSize;
      } else {
        totalInitQuantity = totalQuantity;
      }

      return { totalQuantity, totalInitQuantity };
    },
    {
      totalInitQuantity: 0,
      totalQuantity: 0,
    }
  );

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
            background={"red"}
            onClick={() => {
              setSelectedRow(suppliedProduct.dbId);
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
            className="ant_green_color"
            type={
              suppliedProduct.quantity ===
                suppliedProduct.productBoxes?.length && disabled
                ? "ghost"
                : "primary"
            }
          >
            <Icon
              color={
                suppliedProduct.quantity ===
                  suppliedProduct.productBoxes?.length && disabled
                  ? "green"
                  : undefined
              }
              marginRight="0px"
              fontSize="0.8rem"
              icon={disabled ? faPrint : faTrash}
            />
          </Button>
          {!isNew && isAttend && (
            <Popconfirm
              title="¿Esta seguro de desea eliminar este ítem?"
              onConfirm={() => deleteProduct(suppliedProduct.dbId)}
              onCancel={() => {}}
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
    {
      title: "Elemento",
      dataIndex: "elementId",
      align: "center",
      render: (elementId, suppliedProduct) => {
        if (suppliedProduct.subfamilyId && !elementId) {
          const _element = elements.filter(
            (element) => element.subfamilyId === suppliedProduct.subfamilyId
          );
          const _chosenElement = _element.find((elem) => elem.name === "-");
          if (_chosenElement) {
            elementId = _chosenElement.id;
            suppliedProduct.elementId = _chosenElement.id;
          }
        }
        return (
          <Select
            value={elementId}
            disabled={disabled}
            onChange={(value) =>
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
        );
      },
    },
    {
      title: "Modelo",
      dataIndex: "modelId",
      align: "center",
      render: (modelId, suppliedProduct) => {
        return (
          <RenderColumn
            modelId={modelId}
            selectOptions={selectOptions}
            setSuppliedProducts={setSuppliedProducts}
            disabled={disabled}
            suppliedProduct={suppliedProduct}
            models={models}
          />
        );
      },
    },
    {
      title: "Código de producto",
      dataIndex: "product",
      width: "190px",
      align: "center",
      render: (product) => get(product, "code", null),
    },
    {
      title: "Cantidad Cajas",
      dataIndex: "quantity",
      width: "140px",
      align: "center",
      render: (quantity, suppliedProduct) => (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "3px",
            alignItems: "center",
          }}
        >
          {suppliedProduct.initQuantity !== suppliedProduct.quantity && (
            <Popover
              content={() => (
                <div>{`Valor Previo: ${suppliedProduct.initQuantity}`}</div>
              )}
            >
              <Badge color="magenta" />
            </Popover>
          )}
          <Input
            key={suppliedProducts.length}
            value={quantity}
            bordered
            disabled={disabled}
            onKeyPress={(e) => {
              if (e.key === "-" || (e.key === "0" && quantity === 0)) {
                e.preventDefault();
              }
            }}
            onPaste={(e) => {
              const value = parseFloat(e.clipboardData.getData("text"));
              if (value <= 0) {
                e.preventDefault();
              }
            }}
            onChange={(event) => {
              let number = event.nativeEvent.target.value;
              if (number < 0) {
                number = 0;
              }
              setSuppliedProducts((prevState) => {
                const remainingSuppliedProducts = prevState.filter(
                  (_suppliedProduct) =>
                    _suppliedProduct.id !== suppliedProduct.id
                );

                return [
                  ...remainingSuppliedProducts,
                  {
                    ...suppliedProduct,
                    /*  quantity: parseFloat(number || "0"), */
                    quantity: parseFloat(number || ""),
                  },
                ];
              });
              event.persist();
            }}
            type="number"
            min="1"
          />
        </div>
      ),
    },
    {
      title: "Unidades por caja",
      dataIndex: "boxSize",
      width: "150px",
      align: "center",
      render: (boxSize, suppliedProduct) => (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "3px",
            alignItems: "center",
          }}
        >
          {suppliedProduct.boxSize !== suppliedProduct.initBoxSize && (
            <Popover
              content={() => (
                <div>{`Valor Previo: ${suppliedProduct.initBoxSize}`}</div>
              )}
            >
              <Badge color="magenta" />
            </Popover>
          )}

          <Input
            key={suppliedProducts.length}
            defaultValue={boxSize}
            disabled={disabled}
            min="1"
            onKeyPress={(e) => {
              if (e.key === "-" || (e.key === "0" && boxSize === 0)) {
                e.preventDefault();
              }
            }}
            onPaste={(e) => {
              const value = parseFloat(e.clipboardData.getData("text"));
              if (value <= 0) {
                e.preventDefault();
              }
            }}
            onChange={(event) => {
              setSuppliedProducts((prevState) => {
                const remainingSuppliedProducts = prevState.filter(
                  (_suppliedProduct) =>
                    _suppliedProduct.id !== suppliedProduct.id
                );

                return [
                  ...remainingSuppliedProducts,
                  {
                    ...suppliedProduct,
                    boxSize: parseFloat(event.nativeEvent.target.value || "0"),
                  },
                ];
              });
              event.persist();
            }}
            type="number"
          />
        </div>
      ),
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
        initQuantity: get(suppliedProduct, "initQuantity", null),
        initBoxSize: get(suppliedProduct, "initBoxSize", null),
        product: get(suppliedProduct, "product", null),
      }))
    );
  };

  useEffect(() => {
    if (supplyId) fetchSupply(supplyId);
  }, [supplyId, toggleUpdateTable]);

  useEffect(() => {}, [suppliedProducts]);

  useEffect(() => {
    const onUpdate = async () => {
      const _supply = await getSupply(supplyId);
      const suppliedProducts = get(_supply, "suppliedProducts", []).map(
        (suppliedProduct, index) => ({
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
        })
      );
      // setSuppliedProducts({ ...suppliedProducts });
      // fix: 
      setSuppliedProducts(suppliedProducts);
      setAttendedProduct(suppliedProducts.find((e) => e.dbId === selectedRow));
    };

    if (onUpdateBoxes) {
      onUpdate();
      setUpdateBoxes(false);
    }
  }, [onUpdateBoxes, suppliedProducts]);

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
        suppliedProducts,
        0,
        [],
        isEdit
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
      if (error.message.toLowerCase().includes("contains a duplicate value")) {
        notification.error({
          message: "No se pudo crear abastecimiento",
          description:
            "Existen items duplicados del mismo tipo (unidades por caja iguales). Por favor, actualice la cantidad de cajas en uno de los items y elimine el otro",
        });
      } else {
        notification.error({
          message: "No se pudo crear abastecimiento",
          description: error.message,
        });
      }
      setLoadingSupply(false);
    }
  };

  const mapSuppliedProducts = async (
    products,
    index = 0,
    mappedSuppliedProducts = [],
    isEdit = false
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
      initQuantity,
      initBoxSize,
    } = currentProduct;

    const productsResult = await getProducts({
      familyId,
      subfamilyId,
      elementId,
      modelId,
    });

    return mapSuppliedProducts(
      products,
      index + 1,
      [
        ...mappedSuppliedProducts,
        {
          productId: productsResult.rows[0].id,
          boxSize,
          quantity,
          ...(isEdit ? { initQuantity, initBoxSize } : {}),
        },
      ],
      isEdit
    );
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
      <FloatButton onClick={() => setVisibleLogs(!isVisibleLogs)} />
      <ModalLogs
        supplyId={supplyId}
        visible={isVisibleLogs}
        onCancel={() => setVisibleLogs(!isVisibleLogs)}
      />
      <ModalCargaMasiva
        isVisible={isModalCargaVisible}
        closeModal={() => setIsModalCargaVisible(false)}
      />
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
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <Tag color="blue">{`Cant. Inicial Unid.: ${
              isNaN(sumQuantity.totalInitQuantity)
                ? "-"
                : sumQuantity.totalInitQuantity
            }`}</Tag>
            <Tag
              color={
                sumQuantity.totalInitQuantity === sumQuantity.totalQuantity
                  ? "blue"
                  : "magenta"
              }
            >{`Cant. Final Unid.: ${
              isNaN(sumQuantity.totalQuantity) ? "-" : sumQuantity.totalQuantity
            } `}</Tag>
          </div>
        </Grid>
      </Container>
      <Table
        columns={columns}
        bordered
        pagination={false}
        rowKey={(record) => record.id}
        dataSource={orderBy(suppliedProducts, "id", "asc")}
      />
      <div style={{ display: "flex" }}>
        {!disabled && (
          <Container width="auto" height="5rem">
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
        {/* {!disabled && ( */}
        {/*   <Container width='auto' height="5rem"> */}
        {/*     <Button */}
        {/*       padding="0 0.5rem" */}
        {/*       disabled={!providerId} */}
        {/*       onClick={()=>setIsModalCargaVisible(true)} */}
        {/*       // onClick={() => */}
        {/*       //   setSuppliedProducts((prevState) => [ */}
        {/*       //     ...prevState, */}
        {/*       //     { id: suppliedProducts.length + 1 }, */}
        {/*       //   ]) */}
        {/*       // } */}
        {/*       type="primary" */}
        {/*     > */}
        {/*       <Icon fontSize="1rem" icon={faPlus} /> */}
        {/*       Carga Masiva */}
        {/*     </Button> */}
        {/*   </Container> */}
        {/* )} */}
      </div>
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
          setUpdate={() => setUpdateBoxes(true)}
        />
      )}
    </>
  );
};

const RenderColumn = ({
  models,
  disabled,
  modelId,
  suppliedProduct,
  selectOptions,
  setSuppliedProducts,
}) => {
  const [model, setModel] = useState({
    name: suppliedProduct?.product?.modelName,
  });
  const _models = models.filter(
    (model) => model.elementId === suppliedProduct.elementId
  );
  /* console.log("check", suppliedProduct); */
  useEffect(() => {
    if (!modelId) {
      setModel(null);
    }
  }, [suppliedProduct.familyId, suppliedProduct.subfamilyId]);
  return (
    <AutoComplete
      color={"white"}
      colorFont={"#5F5F7F"}
      disabled={disabled}
      /* value={model && modelId ? model.name : ""} */
      value={model && model.name}
      onSelect={async (value) => {
        /* console.log("value en onselect", value); */
        let selectedModel = models.find((model) => model.id === value);
        setModel(selectedModel);
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
      onSearch={(value) => {
        setModel((prevValue) => ({
          name: value,
          code: prevValue?.id ? "" : prevValue?.code,
        }));
      }}
      _options={selectOptions(_models)}
      filterOption={(input, option) => {
        if (typeof input === "number") {
          return;
        }
        return option.children.toLowerCase().includes(input.toLowerCase());
      }}
    />
  );
};
