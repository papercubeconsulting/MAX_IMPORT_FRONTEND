import React, { useEffect, useRef, useState } from "react";
import { useGlobal } from "reactn";
import { useRouter } from "next/router";
import { Input, notification, Table, Modal } from "antd";
import { get } from "lodash";
import * as FileSaver from "file-saver";
import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import DownloadFilesModal from "../../components/products/DownloadFilesModal.js";

import {
  getElements,
  getFamilies,
  getModels,
  getProducts,
  getSubfamilies,
  getTradenames,
  deleteProduct,
  getFileXlsx,
} from "../../providers";
import { urlQueryParams } from "../../util";

import {
  Button,
  Container,
  Grid,
  Icon,
  Select,
  AutoComplete,
} from "../../components";
import { AddProduct } from "../../components/products";
import { ReadProductCode } from "../../components/products/productBoxes/ReadProductCode";

export default ({ setPageTitle }) => {
  const [globalAuthUser] = useGlobal("authUser");

  //modal eliminar inventario
  const [isVisibleModalDelete, setIsVisibleModalDelete] = useState(false);
  const [productId, setProductId] = useState(null);

  const columns = [
    {
      title: "Cod.",
      dataIndex: "code",
      align: "center",
    },
    {
      title: "Familia",
      dataIndex: "familyName",
      align: "center",
    },
    {
      title: "Sub-Familia",
      dataIndex: "subfamilyName",
      align: "center",
    },
    {
      title: "Elemento",
      dataIndex: "elementName",
      align: "center",
    },
    {
      title: "Modelo",
      dataIndex: "modelName",
      align: "center",
    },
    {
      title: "Nom.",
      dataIndex: "tradename",
      align: "center",
    },
    {
      title: "Stock",
      dataIndex: "totalStock",
      align: "center",
    },
    {
      title: "",
      dataIndex: "id",
      align: "center",
      width: "90px",
      render: (productId) => (
        <>
          <Button
            padding="0 0.25rem"
            onClick={async () => router.push(`/products/${productId}`)}
            type="primary"
          >
            <Icon marginRight="0px" icon={faEye} />
          </Button>
          {globalAuthUser && globalAuthUser.user.role === "superuser" && (
            <Button
              onClick={() => {
                setProductId(productId);
                setIsVisibleModalDelete(true);
              }}
              padding="0 0.25rem"
              margin="0 0 0 0.25rem"
              type="danger"
            >
              <Icon marginRight="0px" fontSize="0.8rem" icon={faTrash} />
            </Button>
          )}
        </>
      ),
    },
    {
      title: "En Tienda",
      dataIndex: "stockByWarehouseType",
      align: "center",
      render: (stockByWarehouseTypeArray) => {
        const _stock = stockByWarehouseTypeArray.find(
          (stockByWarehouseType) =>
            stockByWarehouseType.warehouseType === "Tienda"
        );

        return get(_stock, "stock", 0);
      },
    },
    {
      title: "En Almacén",
      dataIndex: "stockByWarehouseType",
      align: "center",
      render: (stockByWarehouseTypeArray) => {
        const _stock = stockByWarehouseTypeArray.find(
          (stockByWarehouseType) =>
            stockByWarehouseType.warehouseType === "Almacén"
        );

        return get(_stock, "stock", 0);
      },
    },
    {
      title: "En Techo",
      dataIndex: "stockByWarehouseType",
      align: "center",
      render: (stockByWarehouseTypeArray) => {
        const _stock = stockByWarehouseTypeArray.find(
          (stockByWarehouseType) =>
            stockByWarehouseType.warehouseType === "Averiado"
        );

        return get(_stock, "stock", 0);
      },
    },
  ];

  const [windowHeight, setWindowHeight] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [totalItems, setTotalItems] = useState(0);

  const [families, setFamilies] = useState([]);
  const [subfamilies, setSubfamilies] = useState([]);
  const [elements, setElements] = useState([]);
  const [models, setModels] = useState([]);
  const [products, setProducts] = useState([]);
  const [tradenames, setTradenames] = useState([]);

  const [page, setPage] = useState(null);
  const [stock, setStock] = useState(null);
  const [code, setCode] = useState(null);
  const [codes, setCodes] = useState([]);
  const [familyId, setFamilyId] = useState(null);
  const [subfamilyId, setSubfamilyId] = useState(null);
  const [elementId, setElementId] = useState(null);
  const [modelId, setModelId] = useState(null);
  const [model, setModel] = useState(null);
  const [tradename, setTradename] = useState(null);

  // Actualiza nombre de la página
  setPageTitle(`Inventario - ${totalItems} ítem(s)`);

  const [isModalAddProductVisible, setIsModalAddProductVisible] =
    useState(false);
  const [
    isModalReadProductBoxCodeVisible,
    setIsModalReadProductBoxCodeVisible,
  ] = useState(false);

  const [isDownloadFilesVisible, setIsDownloadFilesVisible] = useState(false);
  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);

  const stateUpdateOrigin = useRef("url");

  const router = useRouter();
  const queryParams = router.query;

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const _products = await getProducts(queryParams);
        setTotalItems(_products.length);
        setPagination({
          position: ["bottomCenter"],
          total: _products.pageSize * _products.pages,
          current: _products.page,
          pageSize: _products.pageSize,
          showSizeChanger: false,
          showQuickJumper: true,
        });
        setProducts(_products.rows);
        setCodes(_products.rows.map((r) => {return {code: r.code} }))
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };

    if (stateUpdateOrigin.current === "url") urlToState();
    fetchProducts();
  }, [queryParams, toggleUpdateTable]);

  useEffect(() => {
    if (stateUpdateOrigin.current === "manual") stateToUrl();
  }, [page, stock, code, familyId, subfamilyId, elementId, modelId, tradename]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const _families = await getFamilies();
        const _tradenames = await getTradenames();
        setTradenames(_tradenames.rows);
        setFamilies(_families);
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    const fetchSubfamilies = async () => {
      try {
        if (stateUpdateOrigin.current !== "url") {
          setSubfamilies([]);
          setSubfamilyId(null);
        }
        if (familyId) {
          const _subfamilies = await getSubfamilies(familyId);
          setSubfamilies(_subfamilies);
          setSubfamilyId(
            _subfamilies[0] && _subfamilies[0].name === "-"
              ? _subfamilies[0].id
              : null
          );
        }
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };

    fetchSubfamilies();
  }, [familyId]);

  useEffect(() => {
    const fetchElements = async () => {
      try {
        if (stateUpdateOrigin.current !== "url") {
          setElements([]);
          setElementId(null);
        }

        if (subfamilyId) {
          const _elements = await getElements(subfamilyId);
          setElements(_elements);
          setElementId(
            _elements[0] && _elements[0].name === "-" ? _elements[0].id : null
          );
        }
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };

    fetchElements();
  }, [subfamilyId]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        if (stateUpdateOrigin.current !== "url") {
          setModels([]);
          setModelId(null);
        }

        if (elementId) {
          const _models = await getModels(elementId);
          setModels(_models);
          setModel(null);
        }
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };

    fetchModels();
  }, [elementId]);

  const urlToState = () => {
    setPage(Number.parseInt(queryParams.page) || null);
    setStock(queryParams.stock || null);
    setCode(Number.parseInt(queryParams.code) || null);
    setFamilyId(Number.parseInt(queryParams.familyId) || null);
    setSubfamilyId(Number.parseInt(queryParams.subfamilyId) || null);
    setElementId(Number.parseInt(queryParams.elementId) || null);
    setModelId(Number.parseInt(queryParams.modelId) || null);
    setTradename(queryParams.tradename || null);
  };

  const stateToUrl = async () => {
    const params = {};
    page && (params.page = page);
    stock && (params.stock = stock);
    code && (params.code = code);
    familyId && (params.familyId = familyId);
    familyId && subfamilyId && (params.subfamilyId = subfamilyId);
    subfamilyId && elementId && (params.elementId = elementId);
    elementId && modelId && (params.modelId = modelId);
    tradename && (params.tradename = tradename);
    await router.push(`/products${urlQueryParams(params)}`);
  };

  const selectOptions = (collection) => {
    const options = collection.map((document) => ({
      value: document.id,
      label: document.name,
    }));

    const defaultOption = {
      value: null,
      label: "Todos",
    };

    return [defaultOption, ...options];
  };

  const updateState = (setState, value, isPagination) => {
    stateUpdateOrigin.current = "manual";
    setState(value);
    !isPagination && setPage(undefined);
  };

  const deleteProductById = async () => {
    try {
      const response = await deleteProduct(productId);
      setToggleUpdateTable((prev) => !prev);
      setIsVisibleModalDelete(false);
      notification.success({
        message: "Producto eliminado correctamente",
      });
    } catch (error) {
      setIsVisibleModalDelete(false);
      notification.error({
        message: `No se pudo eliminar el producto. ${error.userMessage}`,
      });
    }
  };

  const downloadXlsx = async () => {
    try {
      const _response = await getFileXlsx();
      _response.blob().then((res) => {
        FileSaver.saveAs(res, "Report.xlsx");
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Modal
        visible={isVisibleModalDelete}
        width="40%"
        onCancel={() => setIsVisibleModalDelete(false)}
        footer={null}
      >
        <Container
          height="fit-content"
          flexDirection="column"
          alignItems="center"
        >
          <p style={{ fontWeight: "bold" }}>
            ¿Está seguro que desea eliminar este producto?
          </p>
          <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="0rem">
            <Button onClick={deleteProductById} margin="auto" type="primary">
              Si, ejecutar
            </Button>
            <Button
              onClick={() => setIsVisibleModalDelete(false)}
              margin="auto"
              type="primary"
            >
              No, regresar
            </Button>
          </Grid>
        </Container>
      </Modal>
      {isModalAddProductVisible && (
        <AddProduct
          visible={isModalAddProductVisible}
          toggleUpdateTable={setToggleUpdateTable}
          trigger={setIsModalAddProductVisible}
        />
      )}
      <DownloadFilesModal
        isModalVisible={isDownloadFilesVisible}
        setIsModalVisible={setIsDownloadFilesVisible}
        downloadInventario={downloadXlsx}
      />
      <ReadProductCode
        visible={isModalReadProductBoxCodeVisible}
        toggleUpdateTable={setToggleUpdateTable}
        trigger={setIsModalReadProductBoxCodeVisible}
      />
      <Container height="auto" flexDirection="column">
        <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="1rem">
          <Select
            value={familyId}
            onChange={(value) => updateState(setFamilyId, value)}
            label="Familia"
            options={selectOptions(families)}
          />
          <Select
            value={subfamilyId}
            onChange={(value) => updateState(setSubfamilyId, value)}
            label="Sub-Familia"
            options={selectOptions(subfamilies)}
          />
          <Select
            value={elementId}
            onChange={(value) => updateState(setElementId, value)}
            label="Elemento"
            options={selectOptions(elements)}
          />
          <AutoComplete
            label="Modelo"
            color={"white"}
            colorFont={"#5F5F7F"}
            value={model ? model.name : ""}
            onSelect={(value) => {
              const _model = models.find((model) => model.id === value);
              updateState(setModelId, _model?.id);
              _model ? setModel(_model) : setModel({ name: "Todos" });
            }}
            onSearch={(value) => {
              setModel((prevValue) => ({
                name: value,
                code: prevValue?.id ? "" : prevValue?.code,
              }));
            }}
            _options={selectOptions(models)}
            filterOption={(input, option) => {
              /* console.log("viendo que pasa", input, option); */
              if (typeof input === "number") {
                return;
              }
              return option.children
                .toLowerCase()
                .includes(input.toLowerCase());
            }}
          />
        </Grid>
        <br />
        <Grid gridTemplateColumns="2fr 1fr 2fr" gridGap="1rem">
          <AutoComplete
            label="Nombre comercial"
            color={"white"}
            colorFont={"#5F5F7F"}
            value={tradename}
            onSelect={(value) => {
              updateState(setTradename, value);
            }}
            onSearch={(value) => {
              updateState(setTradename, value);
            }}
            _options={tradenames.map((trade) => ({
              value: trade.tradename,
              label: trade.tradename,
            }))}
            filterOption={(input, option) => {
              return option.children
                .toLowerCase()
                .includes(input.toLowerCase());
            }}
          />
          <Select
            value={stock}
            onChange={(value) => updateState(setStock, value)}
            label="Stock"
            options={[
              {
                value: null,
                label: "Todos",
              },
              {
                value: "yes",
                label: "Sí",
              },
              {
                value: "no",
                label: "No",
              },
            ]}
          />
          <AutoComplete
            label="Codigo Inventario"
            color={"white"}
            colorFont={"#5F5F7F"}
            value={code}
            onSelect={(value) => {
              updateState(setCode, value);
            }}
            onSearch={(value) => {
              updateState(setCode, value);
            }}
            _options={codes.map((code) => ({
              value: code.code,
              label: code.code,
            }))}
            filterOption={(input, option) => {
              return option.children
                .toLowerCase()
                .includes(input.toLowerCase());
            }}
          />
          {/* <Input */}
          {/*   value={code} */}
          {/*   type="text" */}
          {/*   onChange={(event) => updateState(setCode, event.target.value)} */}
          {/*   addonBefore="Código de inventario" */}
          {/* /> */}
        </Grid>
      </Container>
      <br />
      <Table
        columns={columns}
        bordered
        scrollToFirstRowOnChange
        pagination={pagination}
        scroll={{ y: windowHeight * 0.5 - 32 }}
        onChange={(pagination) =>
          updateState(setPage, pagination.current, true)
        }
        dataSource={products}
      />
      <br />
      <Container height="15%">
        <Grid
          gridTemplateColumns="repeat(3, 1fr)"
          gridGap="2rem"
          justifyItems="center"
        >
          <Button
            onClick={() => {
              setIsDownloadFilesVisible(true);
            }}
            size="large"
            width="240px"
            type="primary"
          >
            Descargar Archivos
          </Button>
          <Button
            onClick={() => setIsModalAddProductVisible(true)}
            size="large"
            width="230px"
            type="primary"
          >
            Nuevo ítem Inventario
          </Button>
          <Button
            onClick={() => setIsModalReadProductBoxCodeVisible(true)}
            size="large"
            width="200px"
            type="primary"
          >
            Mover Caja(s)
          </Button>
        </Grid>
      </Container>
    </>
  );
};
