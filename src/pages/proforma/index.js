import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Button,
  Container,
  Grid,
  Icon,
  Select,
  ModalProduct,
} from "../../components";
import {
  getElements,
  getFamilies,
  getModels,
  getProduct,
  getProducts,
  getSubfamilies,
  getClientPerCode,
  postClient,
  getRegions,
  getProvinces,
  getDistricts,
  getProforma,
  postProforma,
  putProforma,
} from "../../providers";
import { get, orderBy } from "lodash";
import { Input, Table, notification, Modal } from "antd";
import { AddProforma } from "../../components/proforma";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

export default ({ setPageTitle }) => {
  const router = useRouter();
  const queryParams = router.query;
  setPageTitle(
    queryParams.id
      ? `Edición de Proforma N° ${queryParams.id}`
      : "Nueva Proforma"
  );

  const columns = [
    {
      dataIndex: "id",
      title: "",
      width: "40px",
      align: "center",
      render: (id, record, index) => index + 1,
    },
    {
      title: "Cód. Inventario",
      dataIndex: "product",
      /* width: "fit-content", */
      align: "center",
      render: (product) => get(product, "code", null),
    },
    {
      title: "Modelo",
      dataIndex: "product",
      align: "center",
      render: (product) => get(product, "modelName", null),
    },
    {
      title: "Nombre Comercial",
      dataIndex: "product",
      align: "center",
      render: (product) => get(product, "tradename", null),
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      width: "100px",
      align: "center",
      render: (quantity, proformaProduct) => (
        <Input
          style={{ textAlign: "center" }}
          key={proformaProducts.length}
          value={quantity}
          onChange={(event) => {
            setproformaProducts((prevState) => {
              const remainingproformaProducts = prevState.filter(
                (_proformaProduct) => _proformaProduct.id !== proformaProduct.id
              );

              return [
                ...remainingproformaProducts,
                {
                  ...proformaProduct,
                  quantity: parseFloat(event.nativeEvent.target.value || "0"),
                },
              ];
            });
            event.persist();
          }}
        />
      ),
    },
    {
      title: "Precio S/",
      dataIndex: "product",
      align: "center",
      render: (product, proformaProduct) => {
        return (
          <Input
            style={{ textAlign: "center" }}
            value={get(product, "suggestedPrice", 0)}
            min={0}
            onChange={(event) => {
              setproformaProducts((prevState) => {
                const remainingproformaProducts = prevState.filter(
                  (_proformaProduct) =>
                    _proformaProduct.id !== proformaProduct.id
                );
                return [
                  ...remainingproformaProducts,
                  {
                    ...proformaProduct,
                    product: {
                      ...product,
                      suggestedPrice: event.nativeEvent.target.value,
                    },
                  },
                ];
              });
              event.persist();
            }}
            onBlur={(event) => {
              setproformaProducts((prevState) => {
                const remainingproformaProducts = prevState.filter(
                  (_proformaProduct) =>
                    _proformaProduct.id !== proformaProduct.id
                );
                return [
                  ...remainingproformaProducts,
                  {
                    ...proformaProduct,
                    product: {
                      ...product,
                      suggestedPrice: parseFloat(
                        event.nativeEvent.target.value || "0"
                      ).toFixed(2),
                    },
                  },
                ];
              });
              event.persist();
            }}
          />
        );
      },
    },
    {
      title: "Subtotal",
      dataIndex: "id",
      align: "center",
      render: (id, row) =>
        `S/ ${(
          get(row, "product.suggestedPrice", 0) * get(row, "quantity", 0)
        ).toFixed(2)}`,
    },
    {
      title: "Disponibilidad",
      dataIndex: "product",
      align: "center",
      render: (product) => get(product, "availableStock", 0),
    },
    {
      dataIndex: "id",
      align: "center",
      width: "110px",
      render: (id, product) => (
        <>
          <Button
            disabled={product.product ? false : true}
            padding="0 0.25rem"
            margin="0 0.25rem"
            type="primary"
            onClick={() => {
              setIsVisible(true);
              setIdModal(product.product.id);
            }}
          >
            VER
          </Button>
          <Button
            padding="0 0.25rem"
            margin="0 0.25rem"
            type="danger"
            onClick={() =>
              setproformaProducts((prevState) =>
                prevState
                  .filter((proformaProduct) => {
                    return proformaProduct.id !== id;
                  })
                  .map((proformaProduct, index) => ({
                    ...proformaProduct,
                    id: index + 1,
                  }))
              )
            }
          >
            <Icon marginRight="0px" fontSize="0.8rem" icon={faTrash} />
          </Button>
        </>
      ),
    },
  ];

  const [clientId, setClientId] = useState(null);
  const [name, setName] = useState(null);
  const [lastName, setLastName] = useState("");
  const [documentNumber, setDocumentNumber] = useState(null);
  const [email, setEmail] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [regionId, setRegionId] = useState(null);
  const [provinceId, setProvinceId] = useState(null);
  const [districtId, setDistrictId] = useState(null);
  const [address, setAddress] = useState(null);
  const [proformaProducts, setproformaProducts] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [client, setClient] = useState();

  const [families, setFamilies] = useState([]);
  const [subfamilies, setSubfamilies] = useState([]);
  const [elements, setElements] = useState([]);
  const [models, setModels] = useState([]);

  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [windowHeight, setWindowHeight] = useState(0);

  const [loadingSearchClient, setLoadingSearchClient] = useState(false);
  const [loadingSaveProforma, setLoadingSaveProforma] = useState(false);

  //Modal para agregar nuevo producto
  const [addNewProduct, setAddNewProduct] = useState(false);
  const [familyId, setFamilyId] = useState("");
  const [subFamilyId, setSubFamilyId] = useState("");
  const [elementId, setElementId] = useState("");
  const [modelId, setModelId] = useState("");
  const [product, setProduct] = useState("");

  //Modal de informacion del producto
  const [isVisible, setIsVisible] = useState(false);
  const [idModal, setIdModal] = useState("");

  // Credit/Due states 2 way input
  const [paid, setPaid] = useState(0);
  const [due, setDue] = useState(0);
  //Discount states 2 way input
  const [discount, setDiscount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  //final Price
  const [finalPrice, setFinalPrice] = useState(0);

  //Estado para modal Add Proforma
  const [isModalAddProformaVisible, setIsModalAddProformaVisible] = useState(
    false
  );

  // Estados para pasar al pago
  const [salesActivated, setSalesActivated] = useState(false);
  const [proforma, setProforma] = useState([]);
  const [saleWay, setSaleWay] = useState(1); //forma de pago 1: Venta en tienda , forma de pago 2: Venta no presencial
  //
  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  useMemo(() => {
    if (queryParams.id) {
      setLoadingSearchClient(true);
      const fetchProforma = async () => {
        try {
          const _proforma = await getProforma(queryParams.id);
          if (_proforma.status === "OPEN") {
            setProforma(_proforma);
            setDocumentNumber(_proforma.client.idNumber);
            setName(_proforma.client.name);
            setLastName(_proforma.client.lastname);
            setEmail(_proforma.client.email);
            setPhoneNumber(_proforma.client.phoneNumber);
            setAddress(_proforma.client.address);
            setRegionId(_proforma.client.regionId);
            setProvinceId(_proforma.client.provinceId);
            setDistrictId(_proforma.client.districtId);
            setClientId(_proforma.client.id);

            setproformaProducts(
              _proforma.proformaProducts.map((proformaProduct) => {
                return {
                  ...proformaProduct,
                  product: {
                    ...proformaProduct.product,
                    suggestedPrice: proformaProduct.unitPrice / 100,
                  },
                  familyId: proformaProduct.product.familyId,
                  subfamilyId: proformaProduct.product.subfamilyId,
                  modelId: proformaProduct.product.modelId,
                  elementId: proformaProduct.product.elementId,
                };
              })
            );

            setDiscount(_proforma.discount / 100);
            setDiscountPercentage(
              (
                (parseFloat(_proforma.discount || "0") * 100) /
                _proforma.subtotal
              ).toFixed(2)
            );
            setDue(_proforma.total / 100);
          } else {
            //Lo expulsa por que esa proforma esta cerrada
            router.push(`/proformas`);
          }
        } catch (error) {
          //si hay error en query params lo expulsa a proformas
          router.push(`/proformas`);
        }
      };
      fetchProforma();
      setLoadingSearchClient(false);
    }
  }, [queryParams]);

  useEffect(() => {
    setSalesActivated(false);
  }, [
    documentNumber,
    name,
    lastName,
    email,
    phoneNumber,
    regionId,
    provinceId,
    districtId,
    address,
    proformaProducts,
    paid,
    due,
    discountPercentage,
    discount,
  ]);

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

  useEffect(() => {
    const fetchRegions = async () => {
      const _regions = await getRegions();

      setRegions(_regions);
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      const _provinces = await getProvinces(regionId);

      setProvinces(_provinces);
    };
    regionId && fetchProvinces();
  }, [regionId]);

  useEffect(() => {
    const fetchDistricts = async () => {
      const _districts = await getDistricts(regionId, provinceId);

      setDistricts(_districts);
    };
    regionId && provinceId && fetchDistricts();
  }, [regionId, provinceId]);

  const totalPrice = useMemo(() => {
    const _totalPrice = proformaProducts.reduce(
      (accumulator, proformaProduct) =>
        accumulator +
        get(proformaProduct, "quantity", 0) *
          get(proformaProduct, "product.suggestedPrice", 0),
      0
    );

    return _totalPrice;
  }, [proformaProducts]);

  useEffect(() => {
    setFinalPrice((totalPrice * (1 - discountPercentage / 100)).toFixed(2));
  }, [totalPrice, discountPercentage]);

  useEffect(() => {
    setFinalPrice((totalPrice - discount).toFixed(2));
  }, [totalPrice, discount]);

  useEffect(() => {
    setDue((finalPrice - paid).toFixed(2));
  }, [finalPrice]);

  useEffect(() => {
    setDiscount(((totalPrice * discountPercentage) / 100).toFixed(2));
  }, [totalPrice]);

  const selectOptions = (collection) =>
    collection.map((document) => ({
      value: document.id,
      label: document.name,
    }));

  const mapproformaProducts = async (
    products,
    index = 0,
    mappedproformaProducts = []
  ) => {
    if (products.length === index) return mappedproformaProducts;

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

    return mapproformaProducts(products, index + 1, [
      ...mappedproformaProducts,
      {
        productId: productsResult.rows[0].id,
        boxSize,
        quantity,
      },
    ]);
  };

  const onSearchClient = async () => {
    try {
      setLoadingSearchClient(true);
      const client = await getClientPerCode(documentNumber);
      /* console.log(client); */
      const {
        id,
        active,
        name,
        lastname,
        email,
        phoneNumber,
        address,
        regionId,
        provinceId,
        districtId,
      } = client;

      if (!active) throw Error("Usuario inactivo");

      notification.success({
        message: `Cliente con el DNI/RUC ${documentNumber} encontrado.`,
      });
      setDisabled(true);
      setClient(client);

      setName(name);
      setLastName(lastname);
      setEmail(email);
      setPhoneNumber(phoneNumber);
      setAddress(address);
      setRegionId(regionId);
      setProvinceId(provinceId);
      setDistrictId(districtId);
      setClientId(id);

      setLoadingSearchClient(false);
      return true;
    } catch (error) {
      notification.error({
        message: error.message,
      });
      setLoadingSearchClient(false);
      return false;
    }
  };

  const handlePayButton = (_saleWay) => {
    setSaleWay(_saleWay);
    setIsModalAddProformaVisible(true);
  };

  const onSaveProforma = async () => {
    try {
      setLoadingSaveProforma(true);

      if (proforma.id) {
        //Actualiza la proforma
        const _response = await putProforma(proforma.id, {
          clientId,
          discount: Math.round(totalPrice * discountPercentage),
          proformaProducts: proformaProducts.map((proformaProduct) => ({
            productId: get(proformaProduct, "product.id", null),
            unitPrice: Math.round(
              get(proformaProduct, "product.suggestedPrice", 0) * 100
            ),
            quantity: get(proformaProduct, "quantity", null),
          })),
        });
        notification.success({
          message: "Proforma actualizada correctamente",
        });
        setProforma(_response);
      } else {
        //Guarda la proforma
        console.log("a ver que se envia", proformaProducts);
        const _response = await postProforma({
          clientId,
          discount: Math.round(totalPrice * discountPercentage),
          proformaProducts: proformaProducts.map((proformaProduct) => ({
            productId: get(proformaProduct, "product.id", null),
            unitPrice: Math.round(
              get(proformaProduct, "product.suggestedPrice", 0) * 100
            ),
            //unitPrice: price,
            quantity: get(proformaProduct, "quantity", null),
          })),
        });
        console.log("nueva proforma", _response);
        setProforma(_response);
        success(_response.id);
      }
      setLoadingSaveProforma(false);
      setSalesActivated(true);
    } catch (error) {
      notification.error({
        message: error.message,
      });
      setLoadingSaveProforma(false);
    }
  };

  // Modal de confirmación de creación de proforma
  const success = (id) => {
    Modal.success({
      title: `La proforma N°${id} ha sido guardada correctamente`,
    });
  };

  // resetea data del modal addNewProduct
  const resetDataModal = () => {
    setFamilyId("");
    setSubFamilyId("");
    setElementId("");
    setModelId("");
    setProduct("");
  };

  const onCreateClient = async () => {
    try {
      let type;
      if (lastName) {
        type = "PERSON";
      } else {
        type = "COMPANY";
      }
      const response = await postClient({
        type,
        idNumber: documentNumber,
        name,
        lastname: lastName,
        email,
        phoneNumber,
        address,
        regionId,
        provinceId,
        districtId,
        defaultDeliveryAgencyId: 1,
      });
      console.log(response);
      notification.success({
        message: `Cliente con el DNI/RUC ${documentNumber} creado exitosamente.`,
      });
      setDisabled(true);
      setClient(response);
      setClientId(response.id);
    } catch (error) {
      console.log(error);
      notification.error({
        message: error.message,
      });
    }
  };

  const probandoMigo = async () => {
    const verify = await onSearchClient();
    if (!verify) {
      var formData = new FormData();

      formData.append(
        "token",
        "Qw04dLlNDNBKI0vZ6p12fhHJUjce3kDatq3rirg2WmzZQG2N3fnRiNgJ9l54"
      );
      formData.append("ruc", documentNumber);

      var request = new XMLHttpRequest();

      request.open("POST", "https://api.migo.pe/api/v1/ruc");
      request.setRequestHeader("Accept", "application/json");

      request.send(formData);
      request.onload = async function () {
        var data = JSON.parse(this.response);
        if (data.success) {
          setName(data.nombre_o_razon_social);
          setAddress(data.direccion);
          const _region = regions.find(
            (region) => region.name.toUpperCase() === data.departamento
          );
          setRegionId(_region.id);
          const _provinces = await getProvinces(_region.id);
          const _province = _provinces.find(
            (province) => province.name.toUpperCase() === data.provincia
          );
          setProvinceId(_province.id);
          const _districts = await getDistricts(_region.id, _province.id);
          const _district = _districts.find(
            (district) => district.name.toUpperCase() === data.distrito
          );
          setDistrictId(_district.id);
          notification.info({
            message:
              "Por favor llenar los campos faltantes para crear nuevo cliente",
          });
        } else {
          notification.warning({
            message:
              "Por favor verificar el ruc ingresado o llenar los campos para crear nuevo cliente",
          });
        }
      };
    }
  };

  return (
    <>
      <Modal
        visible={addNewProduct}
        width="60%"
        title="Seleccione los datos del producto que desea agregar"
        onCancel={() => {
          setAddNewProduct(false);
          resetDataModal();
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setAddNewProduct(false);
              resetDataModal();
            }}
          >
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              setproformaProducts((prevState) => {
                return [
                  ...prevState,
                  {
                    id: proformaProducts.length + 1,
                    quantity: 1,
                    familyId,
                    subFamilyId,
                    elementId,
                    modelId,
                    product: {
                      ...product,
                      suggestedPrice: (product.suggestedPrice / 100).toFixed(2),
                    },
                  },
                ];
              });
              setAddNewProduct(false);
              resetDataModal();
            }}
          >
            Continuar
          </Button>,
        ]}
      >
        <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="1rem">
          <Select
            value={familyId}
            label="Familia"
            onChange={(value) => setFamilyId(value)}
            options={selectOptions(families)}
          />
          <Select
            value={subFamilyId}
            label="Sub-Familia"
            onChange={(value) => setSubFamilyId(value)}
            options={selectOptions(
              subfamilies.filter((subFamily) => subFamily.familyId === familyId)
            )}
          />
          <Select
            value={elementId}
            label="Elemento"
            onChange={(value) => setElementId(value)}
            options={selectOptions(
              elements.filter((element) => element.subfamilyId === subFamilyId)
            )}
          />
          <Select
            value={modelId}
            label="Modelo"
            onChange={async (value) => {
              setModelId(value);
              const _product = await getProduct(value, { noStock: true });
              setProduct(_product);
              console.log("product", _product);
            }}
            options={selectOptions(
              models.filter((model) => model.elementId === elementId)
            )}
          />
          <Input addonBefore="Cód. Inventario" value={product.code} disabled />
          <Input
            addonBefore="Nombre comercial"
            value={product.tradename}
            disabled
          />
        </Grid>
      </Modal>
      <Modal
        visible={isVisible}
        width="90%"
        title="Información del producto"
        onCancel={() => setIsVisible(false)}
        footer={null}
      >
        <ModalProduct id={idModal}></ModalProduct>
      </Modal>
      {isModalAddProformaVisible && (
        <AddProforma
          visible={isModalAddProformaVisible}
          proforma={proforma}
          totalPaid={paid}
          totalDebt={due}
          saleWay={saleWay}
          trigger={setIsModalAddProformaVisible}
        />
      )}

      <Container height="fit-content">
        <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="1rem">
          <Input value="En cotización" addonBefore="Estatus" disabled />
          <Input
            placeholder="Documento de Identidad"
            value={documentNumber}
            onChange={(event) => {
              setDocumentNumber(event.target.value);
              if (client?.idNumber && client.idNumber !== event.target.value) {
                setDisabled(false);
              }
              if (client?.idNumber && client.idNumber === event.target.value) {
                setDisabled(true);
              }
            }}
            addonBefore="DNI/RUC"
          />
          <Grid
            gridTemplateColumns="repeat(3, 1fr)"
            gridGap="1rem"
            gridColumnStart="3"
            gridColumnEnd="5"
          >
            <Button
              loading={loadingSearchClient}
              type="primary"
              onClick={onSearchClient}
            >
              Buscar
            </Button>
            <Button
              type="primary"
              disabled={queryParams.id}
              onClick={onCreateClient}
            >
              Crear cliente
            </Button>
            <Button onClick={probandoMigo} type="primary">
              Check RUC
            </Button>
          </Grid>
          <Input
            placeholder="Nombres"
            value={name}
            onChange={(event) => setName(event.target.value)}
            addonBefore="Cliente"
            disabled={disabled}
          />
          <Input
            placeholder="Apellidos"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            disabled={disabled}
          />
          <Input
            placeholder="Correo electrónico"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            addonBefore="Correo"
            disabled={disabled}
          />
          <Input
            placeholder="Número de teléfono"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            addonBefore="Teléfono"
            disabled={disabled}
          />
          <Select
            value={regionId}
            autoComplete="new-password"
            label="Departamento"
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onChange={(value) => setRegionId(value)}
            options={regions.map((region) => ({
              value: region.id,
              label: region.name,
            }))}
            disabled={disabled}
          />
          <Select
            value={provinceId}
            autoComplete="new-password"
            label="Provincia"
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onChange={(value) => setProvinceId(value)}
            options={provinces.map((province) => ({
              value: province.id,
              label: province.name,
            }))}
            disabled={disabled}
          />
          <Select
            value={districtId}
            autoComplete="new-password"
            label="Distrito"
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onChange={(value) => setDistrictId(value)}
            options={districts.map((district) => ({
              value: district.id,
              label: district.name,
            }))}
            disabled={disabled}
          />
          <Input
            placeholder="Domicilio"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            addonBefore="Dirección"
            disabled={disabled}
          />
        </Grid>
      </Container>
      <Container padding="0px" width="100vw" height="35%">
        <Table
          columns={columns}
          scroll={{ y: windowHeight * 0.3 - 48 }}
          bordered
          pagination={false}
          dataSource={orderBy(proformaProducts, "id", "asc")}
        />
      </Container>
      <Container height="fit-content" padding="2rem 1rem 1rem">
        <Button
          padding="0 0.5rem"
          type="primary"
          onClick={() => {
            setAddNewProduct(true);
          }}
        >
          <Icon fontSize="1rem" icon={faPlus} />
          Agregar producto
        </Button>
      </Container>
      <Container height="fit-content">
        <Grid gridTemplateColumns="45% 45%" gridGap="10%">
          <Grid>
            <Grid gridTemplateColumns="1fr 1fr" gridGap="2rem">
              <Input
                value={paid}
                type="number"
                min={0}
                onChange={(event) => {
                  setPaid(event.target.value);
                  setDue(
                    (
                      finalPrice -
                      parseFloat(event.target.value || "0").toFixed(2)
                    ).toFixed(2)
                  );
                }}
                onBlur={(event) => {
                  setPaid(parseFloat(event.target.value || "0").toFixed(2));
                  //TODO: Credit no puede ser negativo
                  setDue(
                    (
                      finalPrice -
                      parseFloat(event.target.value || "0").toFixed(2)
                    ).toFixed(2)
                  );
                }}
                addonBefore="Efectivo S/"
              />
              <Input
                value={due}
                type="number"
                min={0}
                max={finalPrice}
                onChange={(event) => {
                  setDue(event.target.value);
                  setPaid(
                    (
                      finalPrice -
                      parseFloat(event.target.value || "0").toFixed(2)
                    ).toFixed(2)
                  );
                }}
                onBlur={(event) => {
                  setDue(parseFloat(event.target.value || "0").toFixed(2));
                  //TODO: Due no puede ser mayor a finalPrice
                  setPaid(
                    (
                      finalPrice -
                      parseFloat(event.target.value || "0").toFixed(2)
                    ).toFixed(2)
                  );
                }}
                addonBefore="Crédito S/"
              />
            </Grid>
            <br />
            <Grid gridTemplateColumns="1fr 1fr 1fr" gridGap="2rem">
              <Button
                onClick={onSaveProforma}
                loading={loadingSaveProforma}
                disabled={!(clientId && proformaProducts.length)}
                type="primary"
              >
                Guardar
              </Button>
              <Button
                type="primary"
                disabled={!salesActivated}
                onClick={() => handlePayButton(1)}
              >
                Venta en Tienda
              </Button>
              <Button
                type="primary"
                disabled={!salesActivated}
                onClick={() => handlePayButton(2)}
              >
                Venta No Presencial
              </Button>
            </Grid>
          </Grid>
          <Grid gridTemplateColumns="5fr 2fr" gridGap="2rem">
            <Input
              disabled
              value={totalPrice.toFixed(2)}
              addonBefore="Total S/"
            />
            <br />
            <Input
              value={discount}
              addonBefore="Descuento S/"
              type="number"
              min={0}
              onChange={(event) => {
                setDiscount(event.target.value);
                setDiscountPercentage(
                  (
                    (parseFloat(event.target.value || "0") * 100) /
                    totalPrice
                  ).toFixed(2)
                );
              }}
              onBlur={(event) => {
                setDiscount(parseFloat(event.target.value || "0").toFixed(2));
                setDiscountPercentage(
                  (
                    (parseFloat(event.target.value || "0") * 100) /
                    totalPrice
                  ).toFixed(2)
                );
              }}
            />
            <Input
              addonBefore="%"
              value={discountPercentage}
              type="number"
              min={0}
              max={100}
              onChange={(event) => {
                setDiscount(
                  (
                    (parseFloat(event.target.value || "0") * totalPrice) /
                    100
                  ).toFixed(2)
                );
                setDiscountPercentage(event.target.value);
              }}
              onBlur={(event) => {
                setDiscount(
                  (
                    (parseFloat(event.target.value || "0") * totalPrice) /
                    100
                  ).toFixed(2)
                );
                setDiscountPercentage(
                  parseFloat(event.target.value || "0").toFixed(2)
                );
              }}
            />
            <Input disabled value={finalPrice} addonBefore="Total Final S/" />
            <br />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
