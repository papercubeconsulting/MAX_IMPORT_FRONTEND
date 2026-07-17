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
  Modal,
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
  getStoreReturnAvailability,
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
  const [supplyType, setSupplyType] = useState("NORMAL");
  const [providers, setProviders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stores, setStores] = useState([]);
  const [storeReturnProducts, setStoreReturnProducts] = useState([]);
  const [isVisibleLogs, setVisibleLogs] = useState(false);
  const [supply, setSupply] = useState(null);
  const [providerId, setProviderId] = useState(null);
  const [sourceWarehouseId, setSourceWarehouseId] = useState(null);
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
  const isStoreReturn = supplyType === "STORE_RETURN";

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
  const storeReturnProgress = suppliedProducts.reduce(
    (result, item) => ({
      requested: result.requested + Number(item.quantity || 0),
      attended:
        result.attended +
        Number(item.suppliedQuantity ?? item.productBoxes?.length ?? 0),
    }),
    { requested: 0, attended: 0 }
  );
  const hasPendingStoreReturn =
    isStoreReturn &&
    storeReturnProgress.attended < storeReturnProgress.requested;

  const baseColumns = [
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
          {!isNew &&
            isAttend &&
            !(isStoreReturn && suppliedProduct.productBoxes?.length > 0) && (
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
      render: (familyId, suppliedProduct) =>
        isStoreReturn ? (
          get(suppliedProduct, "product.familyName", "-")
        ) : (
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
        if (isStoreReturn)
          return get(suppliedProduct, "product.subfamilyName", "-");
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
        if (isStoreReturn)
          return get(suppliedProduct, "product.elementName", "-");
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
        if (isStoreReturn) {
          return (
            <Select
              value={suppliedProduct.productId}
              disabled={disabled}
              placeholder="Seleccione producto"
              onChange={(productId) => {
                const availableProduct = storeReturnProducts.find(
                  (item) => item.productId === productId
                );
                if (!availableProduct) return;
                setSuppliedProducts((current) =>
                  current.map((item) =>
                    item.id === suppliedProduct.id
                      ? {
                          ...item,
                          productId,
                          product: availableProduct.product,
                          familyId: availableProduct.product.familyId,
                          subfamilyId: availableProduct.product.subfamilyId,
                          elementId: availableProduct.product.elementId,
                          modelId: availableProduct.product.modelId,
                          availableStock: availableProduct.stock,
                        }
                      : item
                  )
                );
              }}
              options={storeReturnProducts.map((item) => ({
                value: item.productId,
                label: `${item.product.code} - ${
                  item.product.modelName || item.product.tradename || "Producto"
                } (${item.stock} unid.)`,
              }))}
            />
          );
        }
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

  const columns = isStoreReturn
    ? baseColumns.filter(
        (column) =>
          !["familyId", "subfamilyId", "elementId"].includes(column.dataIndex)
      )
    : baseColumns;

  if (isStoreReturn) {
    columns.splice(
      4,
      0,
      {
        title: "Stock unitario en tienda",
        dataIndex: "availableStock",
        width: "150px",
        align: "center",
        render: (stock, suppliedProduct) =>
          stock ??
          storeReturnProducts.find(
            (item) => item.productId === suppliedProduct.productId
          )?.stock ??
          0,
      },
      {
        title: "Unidades solicitadas",
        width: "140px",
        align: "center",
        render: (_, item) => Number(item.quantity || 0) * Number(item.boxSize || 0),
      },
      {
        title: "Saldo proyectado",
        width: "140px",
        align: "center",
        render: (_, item) => {
          if (!item.productId) return "-";
          const stock =
            storeReturnProducts.find(
              (product) => product.productId === item.productId
            )?.stock || 0;
          const requested = suppliedProducts
            .filter((product) => product.productId === item.productId)
            .reduce(
              (sum, product) =>
                sum +
                Number(product.quantity || 0) * Number(product.boxSize || 0),
              0
            );
          const projected = stock - requested;
          return <Tag color={projected < 0 ? "red" : "blue"}>{projected}</Tag>;
        },
      }
    );
  }

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
      const _stores = await getWarehouses("Tienda");
      setStores(_stores);
    };
    fetchWarehouses();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await getStoreReturnAvailability(sourceWarehouseId);
        setStoreReturnProducts(response.products || []);
      } catch (error) {
        setStoreReturnProducts([]);
        notification.error({
          message: "No se pudo consultar el stock de la tienda",
          description: error.userMessage || error.message,
        });
      }
    };

    if (isStoreReturn && sourceWarehouseId) fetchAvailability();
    else setStoreReturnProducts([]);
  }, [isStoreReturn, sourceWarehouseId, toggleUpdateTable]);

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
    setSupplyType(get(_supply, "type", "NORMAL"));
    setProviderId(get(_supply, "providerId", null));
    setSourceWarehouseId(get(_supply, "sourceWarehouseId", null));
    setWarehouseId(get(_supply, "warehouseId", null));
    setCode(get(_supply, "code", null));
    setSuppliedProducts(
      get(_supply, "suppliedProducts", []).map((suppliedProduct, index) => ({
        id: index + 1,
        dbId: suppliedProduct.id,
        productId: suppliedProduct.productId,
        productBoxes: suppliedProduct.productBoxes,
        familyId: get(suppliedProduct, "product.familyId", null),
        subfamilyId: get(suppliedProduct, "product.subfamilyId", null),
        elementId: get(suppliedProduct, "product.elementId", null),
        modelId: get(suppliedProduct, "product.modelId", null),
        quantity: get(suppliedProduct, "quantity", null),
        boxSize: get(suppliedProduct, "boxSize", null),
        initQuantity: get(suppliedProduct, "initQuantity", null),
        initBoxSize: get(suppliedProduct, "initBoxSize", null),
        suppliedQuantity: get(suppliedProduct, "suppliedQuantity", 0),
        cancelledQuantity: get(suppliedProduct, "cancelledQuantity", 0),
        status: get(suppliedProduct, "status", null),
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
          productId: suppliedProduct.productId,
          productBoxes: suppliedProduct.productBoxes,
          familyId: get(suppliedProduct, "product.familyId", null),
          subfamilyId: get(suppliedProduct, "product.subfamilyId", null),
          elementId: get(suppliedProduct, "product.elementId", null),
          modelId: get(suppliedProduct, "product.modelId", null),
          quantity: get(suppliedProduct, "quantity", null),
          boxSize: get(suppliedProduct, "boxSize", null),
          suppliedQuantity: get(suppliedProduct, "suppliedQuantity", 0),
          cancelledQuantity: get(suppliedProduct, "cancelledQuantity", 0),
          status: get(suppliedProduct, "status", null),
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

    if (isStoreReturn) {
      if (!sourceWarehouseId || !warehouseId || !code) return false;
      const requestedByProduct = suppliedProducts.reduce((result, item) => {
        if (result === null || !item.productId || !item.quantity || !item.boxSize)
          return null;
        result[item.productId] =
          (result[item.productId] || 0) + item.quantity * item.boxSize;
        return result;
      }, {});
      if (!requestedByProduct) return false;
      return Object.entries(requestedByProduct).every(
        ([productId, requested]) =>
          requested <=
          (storeReturnProducts.find(
            (item) => item.productId === Number(productId)
          )?.stock || 0)
      );
    }

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
  }, [
    suppliedProducts,
    providerId,
    sourceWarehouseId,
    warehouseId,
    code,
    isStoreReturn,
    storeReturnProducts,
  ]);

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
        type: supplyType,
        providerId: isStoreReturn ? null : providerId,
        sourceWarehouseId: isStoreReturn ? sourceWarehouseId : null,
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
    if (isStoreReturn) {
      return mapSuppliedProducts(
        products,
        index + 1,
        [
          ...mappedSuppliedProducts,
          {
            productId: currentProduct.productId,
            boxSize: currentProduct.boxSize,
            quantity: currentProduct.quantity,
            ...(isEdit
              ? {
                  initQuantity: currentProduct.initQuantity,
                  initBoxSize: currentProduct.initBoxSize,
                }
              : {}),
          },
        ],
        isEdit
      );
    }
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

  const closePartialStoreReturn = () =>
    Modal.confirm({
      title: "Cancelar saldo pendiente",
      content:
        "Las cajas ya atendidas permanecerán en el almacén. Los índices pendientes serán cancelados y la devolución no podrá seguir atendiéndose.",
      okText: "Cerrar devolución",
      cancelText: "Volver",
      onOk: async () => {
        try {
          setLoadingSupply(true);
          await putSupplyStatus(supplyId, "Cerrado parcial");
          await router.push("/supplies");
        } catch (error) {
          notification.error({
            message: "No se pudo cerrar la devolución",
            description: error.userMessage || error.message,
          });
        } finally {
          setLoadingSupply(false);
        }
      },
    });

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
        <Grid gridTemplateColumns="1fr 1fr 1fr 1fr" gridGap="2rem">
          <Select
            value={supplyType}
            disabled={disabled || suppliedProducts.length > 0}
            label="Tipo"
            onChange={(value) => {
              setSupplyType(value);
              setProviderId(null);
              setSourceWarehouseId(null);
              setSuppliedProducts([]);
            }}
            options={[
              { value: "NORMAL", label: "Abastecimiento de proveedor" },
              { value: "STORE_RETURN", label: "Devolución desde tienda" },
            ]}
          />
          {isStoreReturn ? (
            <Select
              value={sourceWarehouseId}
              disabled={disabled || suppliedProducts.length > 0}
              label="Tienda origen"
              onChange={(value) => {
                setSourceWarehouseId(value);
                setSuppliedProducts([]);
              }}
              options={selectOptions(stores)}
            />
          ) : (
            <Select
              value={providerId}
              disabled={disabled || suppliedProducts.length > 0}
              label="Proveedor"
              onChange={(value) => setProviderId(value)}
              options={selectOptions(providers)}
            />
          )}
          <Select
            value={warehouseId}
            disabled={disabled}
            label={isStoreReturn ? "Almacén destino" : "Almacén"}
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
              disabled={isStoreReturn ? !sourceWarehouseId : !providerId}
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
          <>
            <Button
              size="large"
              width="80%"
              disabled={hasPendingStoreReturn}
              onClick={finishAttend}
              loading={loadingSupply}
              type="primary"
            >
              Finalizar atención
            </Button>
            {isStoreReturn &&
              storeReturnProgress.attended > 0 &&
              hasPendingStoreReturn && (
                <Button
                  size="large"
                  width="80%"
                  margin="1rem 0 0 0"
                  onClick={closePartialStoreReturn}
                  loading={loadingSupply}
                  type="danger"
                >
                  Cancelar saldo pendiente
                </Button>
              )}
          </>
        )}
      </Container>
      {visibleAttendModal && (
        <Attend
          visible={visibleAttendModal}
          supplyId={supplyId}
          trigger={setVisibleAttendModal}
          product={attendedProduct}
          isStoreReturn={isStoreReturn}
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
