import React, { useEffect, useState, useMemo } from "react";
import { Button, Container, Grid, Icon, Select } from "../../components";
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
  getDistricts
} from "../../providers";
import { get, orderBy } from "lodash";
import { Input, Table, notification } from "antd";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export default ({ setPageTitle }) => {
  setPageTitle("Nueva Proforma");

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
  const [suppliedProducts, setSuppliedProducts] = useState([]);

  const [families, setFamilies] = useState([]);
  const [subfamilies, setSubfamilies] = useState([]);
  const [elements, setElements] = useState([]);
  const [models, setModels] = useState([]);

  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [windowHeight, setWindowHeight] = useState(0);

  const [loadingSearchClient, setLoadingSearchClient] = useState(false);

  const [totalPaid, setTotalPaid] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
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

  useEffect(() => {
    const fetchRegions = async () => {
      const _regions = await getRegions();

      setRegions(_regions);
    }
    fetchRegions();
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      const _provinces = await getProvinces(regionId);

      setProvinces(_provinces);
    }
    regionId && fetchProvinces();
  }, [regionId]);

  useEffect(() => {
    const fetchDistricts = async () => {
      const _districts = await getDistricts(regionId, provinceId);

      setDistricts(_districts);
    }
    regionId && provinceId && fetchDistricts();
  }, [regionId, provinceId]);

  const totalPrice = useMemo(() => {

    const _totalPrice = suppliedProducts.reduce((accumulator, suppliedProduct) => accumulator + get(suppliedProduct, "quantity", 0) * get(suppliedProduct, "product.suggestedPrice", 0), 0);

    return _totalPrice;
  }, [suppliedProducts]);

  const finalPrice = useMemo(() => totalPrice * (1 - (discountPercentage / 100))
  , [totalPrice, discountPercentage])


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

  const onSearchClient = async () => {
    try {
      setLoadingSearchClient(true);
      const client = await getClientPerCode(documentNumber);
      
      console.log(client);
      const {id, active, name, lastname, email, phoneNumber, address, regionId, provinceId, districtId} = client;
      
      if(!active) throw Error("Usuario inactivo");

      notification.success({
        message: `Cliente con el DNI/RUC ${documentNumber} encontrado.`
      })
      
      setName(name);
      setLastName(lastname);
      setEmail(email);
      setPhoneNumber(phoneNumber);
      setAddress(address);
      setRegionId(regionId);
      setProvinceId(provinceId);
      setDistrictId(districtId);

      setLoadingSearchClient(false);
    } catch (error) {
      notification.error({
        message: error.message
      })
      setLoadingSearchClient(false);
    }

  }

  return (
    <>
      <Container height="fit-content">
        <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="1rem">
          <Input value="En cotización" addonBefore="Estatus" />
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
            filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            onChange={(value) => setRegionId(value)}
            options={regions.map(region => ({
              value: region.id,
              label: region.name
            }))}
          />
          <Select
            value={provinceId}
            autoComplete="new-password"
            label="Provincia"
            showSearch
            filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            onChange={(value) => setProvinceId(value)}
            options={provinces.map(province => ({
              value: province.id,
              label: province.name
            }))}
          />
          <Select
            value={districtId}
            autoComplete="new-password"
            label="Distrito"
            showSearch
            filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            onChange={(value) => setDistrictId(value)}
            options={districts.map(district => ({
              value: district.id,
              label: district.name
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
          dataSource={orderBy(suppliedProducts, "id", "asc")}
        />
      </Container>
      <Container height="fit-content" padding="2rem 1rem 1rem">
        <Button
          padding="0 0.5rem"
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
      <Container height="fit-content">
        <Grid gridTemplateColumns="45% 45%" gridGap="10%">
          <Grid gridTemplateColumns="1fr 1fr 1fr" gridGap="2rem">
            <Input
              value={totalPaid}
              onChange={(event) => setTotalPaid(event.target.value)}
             addonBefore="A Cuenta S/." 
            />
            <Input
              value={(finalPrice - totalPaid)} 
              disabled 
              addonBefore="Deuda S/." 
            />
            <br />
            <Button type="primary">Guardar</Button>
            <Button type="primary">Venta en Tienda</Button>
            <Button type="primary">Venta No Presencial</Button>
          </Grid>
          <Grid gridTemplateColumns="5fr 2fr" gridGap="2rem">
            <Input disabled value={totalPrice.toFixed(2)} addonBefore="Total S/." />
            <br />
            <Input 
              disabled 
              value={(totalPrice * discountPercentage / 100).toFixed(2)}
              addonBefore="Descuento S/." 
            />
            <Input
              addonBefore="%"
              value={discountPercentage}
              onChange={(event) => setDiscountPercentage(event.target.value)}
            />
            <Input 
              disabled 
              value={finalPrice.toFixed(2)} 
              addonBefore="Total Final S/." 
            />
            <br />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
