import React, { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Container, Grid, ModalProduct, Select } from "../../../components";
import {
  getDispatch,
  userProvider,
  resolveInventoryCode,
  getWarehouses,
  postDispatchProduct,
  postFinishDispatch,
} from "../../../providers";
import { get } from "lodash";
import { Input, Table, Modal, Checkbox, notification } from "antd";
import moment from "moment";
import Quagga from "quagga";
import { clientDateFormat } from "../../../util";
import {
  DesktopDispatchTable,
  DispatchCard,
  DispatchCardActions,
  DispatchCardBadge,
  DispatchCardHeader,
  DispatchCardMeta,
  DispatchCardMetaText,
  DispatchCardTitle,
  DispatchCodeGrid,
  DispatchConfirmButton,
  DispatchConfirmContent,
  DispatchConfirmGrid,
  DispatchConfirmMobileList,
  DispatchConfirmQuantity,
  DispatchConfirmRow,
  DispatchDetailFooter,
  DispatchDetailFooterGrid,
  DispatchDetailHeader,
  DispatchDetailHeaderGrid,
  DispatchDetailProducts,
  DispatchDetailSummary,
  DispatchDetailTitle,
  DispatchFinishActions,
  DispatchFinishContent,
  DispatchMetaRow,
  DispatchModalResponsiveStyles,
  DispatchPage,
  DispatchScanner,
  MobileDispatchList,
} from "../../../components/dispatch/DispatchStyles";

/* const QRScanner = styled.div`
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
`; */

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
      title: "Ctd. a Despachar",
      dataIndex: "quantity",
      align: "center",
      render: (id,record) => record.quantity - record.dispatched
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
  const [productBoxCode, setProductBoxCode] = useState(null);
  const [dispatchMode, setDispatchMode] = useState("BOX");
  const [productBarcode, setProductBarcode] = useState(null);
  const [stores, setStores] = useState([]);
  const [warehouseId, setWarehouseId] = useState(null);

  //
  const fetchProductBox = async (scannedCode = productBoxCode) => {
    try {
      if (String(scannedCode || "").startsWith("2") && !warehouseId) {
        notification.warning({ message: "Seleccione la tienda de despacho" });
        return;
      }
      const resolved = await resolveInventoryCode(scannedCode);
      if (resolved.type === "BOX") {
        const _productBox = resolved.productBox;
        setDispatchMode("BOX");
        setDataProduct(_productBox);
        setProductBoxId(_productBox.id);
        setProductBarcode(null);
      } else {
        const storeStock = (resolved.stockByStore || []).find(
          (item) => item.warehouseId === warehouseId
        );
        setDispatchMode("PRODUCT");
        setDataProduct({
          product: resolved.product,
          warehouse: stores.find((store) => store.id === warehouseId),
          stock: storeStock?.stock || 0,
          boxSize: null,
        });
        setProductBoxId(null);
        setProductBarcode(resolved.productBarcode.barcode);
      }
      /* console.log("_productBox", _productBox); */
      setIsVisibleReadProductCode(false);
      setIsVisibleConfirmDispatch(true);
    } catch (error) {
      /* console.log("error", error); */
      notification.error({
        message: "Error al escanear código",
        description: error.userMessage,
      });
    }
  };

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
        setProductBoxCode(get(data, "codeResult.code", null));
        /* console.log(codeProduct); */
        codeProduct && fetchProductBox(codeProduct);
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
        ...(dispatchMode === "PRODUCT"
          ? { productBarcode, warehouseId }
          : { productBoxId }),
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

  useEffect(() => {
    getWarehouses("Tienda")
      .then((response) => {
        setStores(response);
        if (response.length === 1) setWarehouseId(response[0].id);
      })
      .catch(() => notification.error({ message: "No se pudieron cargar las tiendas" }));
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
        /* console.log(_dispatch); */
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
    <DispatchPage>
      <DispatchModalResponsiveStyles />
      <Modal
        visible={isVisibleFinishDispatch}
        width="40%"
        onCancel={() => setIsVisibleFinishDispatch(false)}
        footer={null}
        wrapClassName="dispatch-finish-modal"
      >
        <DispatchFinishContent
          height="fit-content"
          flexDirection="column"
          alignItems="center"
        >
          <p style={{ fontWeight: "bold" }}>
            ¿Está seguro que desea finalizar el despacho total?
          </p>
          <DispatchFinishActions gridTemplateColumns="repeat(2, 1fr)" gridGap="0rem">
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
          </DispatchFinishActions>
        </DispatchFinishContent>
      </Modal>
      <Modal
        visible={isVisibleReadProductCode}
        onCancel={() => setIsVisibleReadProductCode(false)}
        onOk={() => fetchProductBox()}
        title="Escanear o ingresar código de caja o producto"
        width="90%"
        wrapClassName="dispatch-code-modal"
      >
        <DispatchCodeGrid gridTemplateColumns="2fr 1fr 1fr" gridGap="1rem" marginBottom="1rem">
          <Input
            value={productBoxCode}
            justify="center"
            onChange={(event) => setProductBoxCode(event.target.value)}
            addonBefore="Código"
            placeholder="Caja 1... o producto 2..."
          />
          <Select
            label="Tienda"
            value={warehouseId}
            onChange={setWarehouseId}
            options={stores.map((store) => ({ value: store.id, label: store.name }))}
          />
          <Button onClick={scanBarcode}>Escanear Código de barras</Button>
        </DispatchCodeGrid>
        <DispatchScanner>
          <Grid gridTemplateRows="1fr" gridGap="1rem" justifyItems="center">
            <div id="interactive" className="viewport">
              <video autoPlay="true" preload="auto" />
            </div>
            <canvas className="drawingBuffer"></canvas>
          </Grid>
        </DispatchScanner>
        {/* <Grid gridTemplateRows="1fr" gridGap="1rem" justifyItems="center">
          <Button onClick={scanBarcode}>Escanear Código de barras</Button>
          <QRScanner>
            <div id="interactive" className="viewport"></div>
          </QRScanner>
        </Grid> */}
      </Modal>
      <Modal
        visible={isVisibleConfirmDispatch}
        width="60%"
        title={
          dispatchMode === "PRODUCT"
            ? "Ha escaneado este producto, ¿desea despacharlo desde la tienda seleccionada?"
            : "Ha escaneado esta caja, ¿está seguro que desea despachar este producto?"
        }
        onCancel={() => {
          setIsVisibleConfirmDispatch(false);
          setQuantity();
        }}
        footer={null}
        wrapClassName="dispatch-confirm-modal"
      >
        <DispatchConfirmContent>
          <DispatchConfirmGrid gridTemplateColumns="2fr 3fr" gridGap="1rem">
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
                value={dispatchMode === "PRODUCT" ? "Unitario" : dataProduct?.boxSize}
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
                {dispatchMode === "PRODUCT" ? "Todo disponible" : "Toda la caja"}
              </Checkbox>
            </Grid>
          </DispatchConfirmGrid>
          <DispatchConfirmMobileList>
            <DispatchConfirmRow>
              <span>Modelo</span>
              <strong>{dataProduct?.product.modelName || "-"}</strong>
            </DispatchConfirmRow>
            <DispatchConfirmRow>
              <span>Familia</span>
              <strong>{dataProduct?.product.familyName || "-"}</strong>
            </DispatchConfirmRow>
            <DispatchConfirmRow>
              <span>Sub-Familia</span>
              <strong>{dataProduct?.product.subfamilyName || "-"}</strong>
            </DispatchConfirmRow>
            <DispatchConfirmRow>
              <span>Elemento</span>
              <strong>{dataProduct?.product.elementName || "-"}</strong>
            </DispatchConfirmRow>
            <DispatchConfirmRow>
              <span>Ubicación</span>
              <strong>{dataProduct?.warehouse.name || "-"}</strong>
            </DispatchConfirmRow>
            <DispatchConfirmRow>
              <span>Tipo de caja</span>
              <strong>
                {dispatchMode === "PRODUCT"
                  ? "Producto unitario"
                  : `${dataProduct?.boxSize || "-"} Unid./Caja`}
              </strong>
            </DispatchConfirmRow>
            <DispatchConfirmRow>
              <span>Disponibles</span>
              <strong>{dataProduct?.stock || 0} Unidades</strong>
            </DispatchConfirmRow>
            <DispatchConfirmQuantity>
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
                  setCheck(e.target.checked);
                  e.target.checked ? setQuantity(dataProduct?.stock) : "";
                }}
              >
                {dispatchMode === "PRODUCT" ? "Todo disponible" : "Toda la caja"}
              </Checkbox>
            </DispatchConfirmQuantity>
          </DispatchConfirmMobileList>
        </DispatchConfirmContent>
        <DispatchConfirmButton
          onClick={confirmDispatch}
          width="30%"
          margin="2% 5% 2% 40%"
          type="primary"
        >
          Confirmar Despacho
        </DispatchConfirmButton>
      </Modal>
      <Modal
        visible={isVisible}
        width="90%"
        title="Información del producto"
        onCancel={() => setIsVisible(false)}
        footer={null}
        wrapClassName="product-info-modal"
      >
        <ModalProduct id={idModal}></ModalProduct>
      </Modal>
      <DispatchDetailHeader height="fit-content">
        <DispatchDetailSummary>
          <DispatchDetailTitle>
            Proforma N° {dispatch.proformaId || "-"}
          </DispatchDetailTitle>
          <DispatchMetaRow>
            <span>Estatus</span>
            <strong>{dispatch.status === "OPEN" ? "Pendiente" : "Completado"}</strong>
          </DispatchMetaRow>
          <DispatchMetaRow>
            <span>Cliente</span>
            <strong>
              {`${dispatch.proforma?.client.name || ""} ${
                dispatch.proforma?.client.lastname || ""
              }`.trim() || "-"}
            </strong>
          </DispatchMetaRow>
          <DispatchMetaRow>
            <span>Dirección</span>
            <strong>{dispatch.proforma?.client.address || "-"}</strong>
          </DispatchMetaRow>
          <DispatchMetaRow>
            <span>Agencia</span>
            <strong>{dispatch.deliveryAgency?.name || "-"}</strong>
          </DispatchMetaRow>
        </DispatchDetailSummary>
        <DispatchDetailHeaderGrid gridTemplateColumns="repeat(4, 1fr)" gridGap="1rem">
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
        </DispatchDetailHeaderGrid>
      </DispatchDetailHeader>
      <DispatchDetailProducts>
        <DesktopDispatchTable>
          <Table
            columns={columns}
            scroll={{ y: windowHeight * 0.3 - 48 }}
            bordered
            pagination={false}
            dataSource={
              dispatch.dispatchedProducts ? dispatch.dispatchedProducts : []
            }
          />
        </DesktopDispatchTable>
        <MobileDispatchList>
          {(dispatch.dispatchedProducts || []).map((item, index) => {
            const pending = item.quantity - item.dispatched;
            return (
              <DispatchCard key={item.id}>
                <DispatchCardHeader>
                  <div>
                    <DispatchCardTitle>
                      {get(item, "product.modelName", "-")}
                    </DispatchCardTitle>
                    <DispatchCardMetaText>
                      Ítem {index + 1} · {get(item, "product.familyName", "-")}
                    </DispatchCardMetaText>
                  </div>
                  <DispatchCardBadge>{pending} pend.</DispatchCardBadge>
                </DispatchCardHeader>
                <DispatchCardMeta>
                  <DispatchMetaRow>
                    <span>Sub-Familia</span>
                    <strong>{get(item, "product.subfamilyName", "-")}</strong>
                  </DispatchMetaRow>
                  <DispatchMetaRow>
                    <span>Elemento</span>
                    <strong>{get(item, "product.elementName", "-")}</strong>
                  </DispatchMetaRow>
                  <DispatchMetaRow>
                    <span>Despachado</span>
                    <strong>{item.dispatched || 0}</strong>
                  </DispatchMetaRow>
                  <DispatchMetaRow>
                    <span>Disponibilidad</span>
                    <strong>{get(item, "product.availableStock", 0)}</strong>
                  </DispatchMetaRow>
                  <DispatchMetaRow>
                    <span>Fecha atención</span>
                    <strong>
                      {item.updatedAt
                        ? `${moment(item.updatedAt).format("DD/MM")} ${moment(
                            item.updatedAt,
                          ).format("hh:mm")}`
                        : "-"}
                    </strong>
                  </DispatchMetaRow>
                </DispatchCardMeta>
                <DispatchCardActions>
                  <Button
                    onClick={() => {
                      setIsVisible(true);
                      setIdModal(item.product.id);
                    }}
                  >
                    Ver producto
                  </Button>
                  <Button
                    disabled={item.quantity === item.dispatched}
                    type="primary"
                    onClick={() => {
                      setIsVisibleReadProductCode(true);
                      setDispatchedProductId(item.id);
                    }}
                  >
                    {item.quantity === item.dispatched ? "Entregado" : "Despachar"}
                  </Button>
                </DispatchCardActions>
              </DispatchCard>
            );
          })}
        </MobileDispatchList>
      </DispatchDetailProducts>
      <DispatchDetailFooter height="fit-content">
        <DispatchDetailFooterGrid gridTemplateColumns="repeat(2, 1fr)" gridGap="0rem">
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
        </DispatchDetailFooterGrid>
      </DispatchDetailFooter>
    </DispatchPage>
  );
};
