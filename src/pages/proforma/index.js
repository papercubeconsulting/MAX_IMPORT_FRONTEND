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
  setPageTitle(queryParams.id ? "Edición de Proforma" : "Nueva Proforma");

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
      dataIndex: "familyId",
      width: "fit-content",
      align: "center",
      render: (familyId, proformaProduct) => (
        <Select
          value={familyId}
          onChange={(value) =>
            setproformaProducts((prevState) => {
              const remainingproformaProducts = prevState.filter(
                (_proformaProduct) => _proformaProduct.id !== proformaProduct.id
              );

              return [
                ...remainingproformaProducts,
                {
                  id: proformaProduct.id,
                  dbId: proformaProduct.dbId,
                  productBoxes: proformaProduct.productBoxes,
                  quantity: proformaProduct.quantity,
                  boxSize: proformaProduct.boxSize,
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
      render: (subfamilyId, proformaProduct) => (
        <Select
          value={subfamilyId}
          onChange={(value) =>
            setproformaProducts((prevState) => {
              const remainingproformaProducts = prevState.filter(
                (_proformaProduct) => _proformaProduct.id !== proformaProduct.id
              );

              return [
                ...remainingproformaProducts,
                {
                  id: proformaProduct.id,
                  dbId: proformaProduct.dbId,
                  productBoxes: proformaProduct.productBoxes,
                  quantity: proformaProduct.quantity,
                  boxSize: proformaProduct.boxSize,
                  familyId: proformaProduct.familyId,
                  subfamilyId: value,
                },
              ];
            })
          }
          options={selectOptions(
            subfamilies.filter(
              (subFamily) => subFamily.familyId === proformaProduct.familyId
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
      render: (elementId, proformaProduct) => (
        <Select
          value={elementId}
          onChange={(value) =>
            setproformaProducts((prevState) => {
              const remainingproformaProducts = prevState.filter(
                (_proformaProduct) => _proformaProduct.id !== proformaProduct.id
              );

              return [
                ...remainingproformaProducts,
                {
                  id: proformaProduct.id,
                  dbId: proformaProduct.dbId,
                  productBoxes: proformaProduct.productBoxes,
                  quantity: proformaProduct.quantity,
                  boxSize: proformaProduct.boxSize,
                  familyId: proformaProduct.familyId,
                  subfamilyId: proformaProduct.subfamilyId,
                  elementId: value,
                },
              ];
            })
          }
          options={selectOptions(
            elements.filter(
              (element) => element.subfamilyId === proformaProduct.subfamilyId
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
      render: (modelId, proformaProduct) => (
        <Select
          value={modelId}
          onChange={async (value) => {
            const product = await getProduct(value, { noStock: true });

            setproformaProducts((prevState) => {
              const remainingproformaProducts = prevState.filter(
                (_proformaProduct) => _proformaProduct.id !== proformaProduct.id
              );

              return [
                ...remainingproformaProducts,
                {
                  id: proformaProduct.id,
                  dbId: proformaProduct.dbId,
                  productBoxes: proformaProduct.productBoxes,
                  quantity: proformaProduct.quantity
                    ? proformaProduct.quantity
                    : 1,
                  boxSize: proformaProduct.boxSize,
                  familyId: proformaProduct.familyId,
                  subfamilyId: proformaProduct.subfamilyId,
                  elementId: proformaProduct.elementId,
                  modelId: value,
                  product: {
                    ...product,
                    suggestedPrice: product.suggestedPrice / 100,
                  },
                },
              ];
            });
          }}
          options={selectOptions(
            models.filter(
              (model) => model.elementId === proformaProduct.elementId
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
      render: (quantity, proformaProduct) => (
        <Input
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
          type="number"
        />
      ),
    },
    {
      title: "Precio",
      dataIndex: "product",
      width: "fit-content",
      align: "center",
      render: (product, proformaProduct) => {
        return (
          <Input
            value={get(product, "suggestedPrice", 0)}
            type="number"
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
            addonBefore="S/."
          />
        );
      },
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
      /*
        render: (id, row) =>
        `S/.${(
          price * get(row, "quantity", 0)
        ).toFixed(2)}`,*/
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
        <>
          <Button
            disabled={product.product ? false : true}
            padding="0 0.25rem"
            margin="0 0.25rem"
            type="primary"
            onClick={() => {
              product.product && setIsVisible(true);
              setIdModal(product.product.id);
              console.log("product", product);
              console.log("productid", product.product && product.product.id);
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
                    /* console.log(proformaProduct.id, id); */
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
  const [lastName, setLastName] = useState(null);
  const [documentNumber, setDocumentNumber] = useState(null);
  const [email, setEmail] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [regionId, setRegionId] = useState(null);
  const [provinceId, setProvinceId] = useState(null);
  const [districtId, setDistrictId] = useState(null);
  const [address, setAddress] = useState(null);
  const [proformaProducts, setproformaProducts] = useState([]);

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

  //Modal
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
    } catch (error) {
      notification.error({
        message: error.message,
      });
      setLoadingSearchClient(false);
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
        //console.log(_response);
        setProforma(_response);
      } else {
        //Guarda la proforma
        /* console.log('proformaProducts', proformaProducts); */
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
        notification.success({
          message: "Proforma guardada correctamente",
        });
        /* console.log('resp', _response); */
        setProforma(_response);
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
            onChange={(event) => setDocumentNumber(event.target.value)}
            addonBefore="DNI/RUC"
          />
          <Button
            loading={loadingSearchClient}
            type="primary"
            onClick={onSearchClient}
          >
            Buscar
          </Button>
          <Button type="primary">Check RUC</Button>
          <Input
            placeholder="Nombres"
            value={name}
            onChange={(event) => setName(event.target.value)}
            addonBefore="Cliente"
          />
          <Input
            placeholder="Apellidos"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
          <Input
            placeholder="Correo electrónico"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            addonBefore="Correo"
          />
          <Input
            placeholder="Número de teléfono"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            addonBefore="Teléfono"
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
          />
          <Input
            placeholder="Domicilio"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
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
          dataSource={orderBy(proformaProducts, "id", "asc")}
        />
      </Container>
      <Container height="fit-content" padding="2rem 1rem 1rem">
        <Button
          padding="0 0.5rem"
          onClick={() =>
            setproformaProducts((prevState) => [
              ...prevState,
              { id: proformaProducts.length + 1 },
            ])
          }
          type="primary"
        >
          <Icon fontSize="1rem" icon={faPlus} />
          Agregar producto
        </Button>
      </Container>
      <Container height="fit-content">
        <Grid gridTemplateColumns="45% 45%" gridGap="10%">
          <Grid gridTemplateColumns="1fr 1fr 1fr" gridGap="2rem">
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
              addonBefore="A Cuenta S/."
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
              addonBefore="Deuda S/."
            />
            <br />
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
          <Grid gridTemplateColumns="5fr 2fr" gridGap="2rem">
            <Input
              disabled
              value={totalPrice.toFixed(2)}
              addonBefore="Total S/."
            />
            <br />
            <Input
              value={discount}
              addonBefore="Descuento S/."
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
            <Input disabled value={finalPrice} addonBefore="Total Final S/." />
            <br />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
