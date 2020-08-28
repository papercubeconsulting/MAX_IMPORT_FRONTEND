import React, { useEffect, useState } from "react";
import { Input, Modal, notification, Tag, Upload, Radio } from "antd";
import { RadioGroup } from "../RadioGroup";
import { useRouter } from "next/router";
import { Button, Container, Grid, Icon, Select } from "../index";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import {
  getBank,
  getBanks,
  getDeliveryAgencies,
  postSale
} from "../../providers";
import { toBase64 } from "../../util";

export const AddProforma = (props) => {
  // * List of sources from database
  const [banks, setBanks] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [deliveryAgencies, setDeliveryAgencies] = useState([]);

  // * Fields to create source
  // Para todas las ventas
  const [payWay, setPayWay] = useState(1);
  const [saleType, setSaleType] = useState(1);
  // Solo para venta no presencial
  const [voucherNum, setVoucherNum] = useState(null);
  const [bank, setBank] = useState({});
  const [bankAccount, setBankAccount] = useState({});
  const [imageBase64, setImageBase64] = useState(null);
  // Sobre el despacho
  const [dispatchWay, setDispatchWay] = useState(1); 
  const [deliveryAgency, setDeliveryAgency] = useState({});
 // Summit Active
 const [summitActive, setSummitActive] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      try {
        const _banks = await getBanks();
        setBanks(_banks);

        const _deliveryAgencies = await getDeliveryAgencies();
        setDeliveryAgencies(_deliveryAgencies);

      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
      if(props.totalDebt===0){
        setSaleType(1);
        setSummitActive(true);
      }
      else{
        setSaleType(2);
        setSummitActive(true);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        setBankAccounts([]);
        setBankAccount((prevState) => ({ ...prevState, id: undefined }));

        if (bank.id) {
          const _bank = await getBank(bank.id);
          setBankAccounts(_bank.bankAccounts);
        }
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };
    fetchBankAccounts();
  }, [bank]);

  // permite crear opciones para los seleccionadores
  const selectOptions = (collection) =>
    collection.map((document) => ({
      label: document.name,
      value: document.id,
    }));

  // funcion para consignar la venta 
  const summitSale = async () => {
    try {
        const body = {
            proformaId: props.proforma.id,
            type: props.saleWay===1?"STORE":"REMOTE",
            paymentType: saleType===1?"CASH":"CREDIT",
            credit: props.totalDebt,
            billingType: payWay===1?"SALE":"CONSIGNMENT",
            dispatchmentType: dispatchWay===1?"PICK_UP":"DELIVERY",
        };

        (dispatchWay===2)&&(body.deliveryAgencyId=deliveryAgency.id);
        (props.saleWay===2)&&(body.voucherCode=voucherNum+"");
        (props.saleWay===2)&&(body.voucherImage=imageBase64);
        (props.saleWay===2)&&(body.paymentMethod="Depósito");
        (props.saleWay===2)&&(body.bankAccountId=bankAccount.id);
      const response = await postSale( body);
      Modal.success({
            title: "Se ha consignado la venta correctamente",
            content: `Venta: ${response.id}`,
            onOk: () => router.push(`/proformas`)
        });
    } catch (error) {
        Modal.error({
            title: "Error al intentar consignar venta",
            content: error.message,
            // onOk: () => props.toggleUpdateTable(prevState => !prevState)
        });
    }
};

  return (
    <Modal
      visible={props.visible}
      onOk={summitActive&&summitSale}
        //() => props.trigger && props.trigger(false)}
      onCancel={() => props.trigger && props.trigger(false)}
      width="60%"
      title="¿Está seguro de realizar la venta?"
    >
      <Grid gridTemplateRows="repeat(1, 1fr)" gridGap="1rem">
        <Grid gridTemplateColumns="repeat(3, 1fr)" gridGap="1rem">
          <h3>Forma de pago:</h3>
          <RadioGroup
            gridColumnStart="2"
            gridColumnEnd="4"
            gridTemplateColumns="repeat(2, 1fr)"
            onChange={event => setPayWay(event.target.value)}
            value={payWay}
          >
            <Radio value={1}>Venta</Radio>
            <Radio value={2}>Consignación</Radio>
          </RadioGroup>
          <h3>Tipo de venta:</h3>
          <RadioGroup
            gridColumnStart="2"
            gridColumnEnd="4"
            gridTemplateColumns="repeat(2, 1fr)"
            value={saleType}
          >
            <Radio value={1} disabled>Contado</Radio>
            <Radio value={2} disabled>Crédito</Radio>
          </RadioGroup>{" "}
        </Grid>

        <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="1rem">
          <Input
            value={(props.totalPaid/100).toFixed(2)}
            disabled
            type="number"
            addonBefore="A cuenta S/."
          />
          <Input
            value={(props.totalDebt/100).toFixed(2)}
            disabled
            type="number"
            addonBefore="Total deuda S/."
          />
        </Grid>

        <Grid
          gridTemplateColumns="repeat(2, 1fr)"
          gridGap="1rem"
          hidden={props.saleWay === 1 ? true : false}
        >
          <h3>Datos del depósito:</h3>
          <div></div>
          <Input 
            value={voucherNum}
            onChange={event => setVoucherNum(event.target.value)}
            type="number"
            placeholder="Nº Operación"
            addonBefore="Voucher"
          />
          <Select
            value={bank.name}
            label="Banco"
            onChange={(value) => {
              const _bank = banks.find((bank) => bank.id === value);
              setBank(_bank);
            }}
            options={selectOptions(banks)}
          />
          <Select
            value={bankAccount.name}
            label="Cuenta"
            onChange={(value) => {
              const _bankAccount = bankAccounts.find(
                (bankAccount) => bankAccount.id === value
              );
              setBankAccount(_bankAccount);
            }}
            options={selectOptions(bankAccounts)}
          />

          <Upload
            className="ant-upload-wrapper"
            beforeUpload={async (file) => {
              const encodedImage = await toBase64(file);
              setImageBase64(encodedImage);
            }}
            accept="image/png, image/jpeg"
          >
            <Button>
              <Icon icon={faUpload} />
              Imagen
            </Button>
          </Upload>
        </Grid>

        <Grid gridTemplateColumns="repeat(3, 1fr)" gridGap="1rem">
          <h3>Forma de despacho:</h3>
          <RadioGroup
            gridColumnStart="2"
            gridColumnEnd="2"
            gridTemplateColumns="repeat(2, 1fr)"
            onChange={event => setDispatchWay(event.target.value)}
            value={dispatchWay}
          >
            <Radio value={1}>Tienda</Radio>
            <Radio value={2}>Envío</Radio>
          </RadioGroup>
          <Select
          disabled={dispatchWay===1?true:false}
            value={deliveryAgency.name}
            label="Agencia"
            onChange={(value) => {
              const _deliveryAgency = deliveryAgencies.find(
                (deliveryAgency) => deliveryAgency.id === value
              );
              setDeliveryAgency(_deliveryAgency);
            }}
            options={selectOptions(deliveryAgencies)}
          />
        </Grid>
      </Grid>
    </Modal>
  );
};
