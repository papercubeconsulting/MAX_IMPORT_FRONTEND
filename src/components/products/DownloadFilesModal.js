import React from "react";
import { Modal, Button, DatePicker, Alert } from "antd";
import styled from "styled-components";
import {
  getFileXlsxMovimientoCajas,
  getFileXlsxInventarioTotal,
} from "../../providers/products";
import * as FileSaver from "file-saver";
import moment from "moment";
const DownloadFilesModal = ({
  isModalVisible,
  setIsModalVisible,
  downloadInventario,
}) => {
  const downloadExcel = () => {
    downloadInventario();
  };

  // check wheter the entered date is less equal than today
  const [isValid, setIsValid] = React.useState(true);

  const [dateSelected, setDateSelected] = React.useState(moment());

  const onChangePicker = (date, dateString) => {
    if (moment(date).isAfter(moment(), "day")) {
      setIsValid(false);
      return;
    }
    setDateSelected(dateString);
    setIsValid(true);
  };

  const downloadMovimientoCajas = async () => {
    // setIsValid(moment(date).isBefore(moment(now), "day"));

    try {
      // only selected for one day
      const _response = await getFileXlsxMovimientoCajas({
        from: dateSelected,
        to: dateSelected,
      });

      _response.blob().then((res) => {
        FileSaver.saveAs(res, "MovimientoCajas.xlsx");
      });
    } catch (error) {
      console.log(error);
    }
  };

  const downloadInventarioTotal = React.useCallback(async () => {
    // setIsValid(moment(date).isBefore(moment(now), "day"));

    try {
      // only selected for one day
      const _response = await getFileXlsxInventarioTotal();

      _response.blob().then((res) => {
        FileSaver.saveAs(res, "InventarioTotal.xlsx");
      });
    } catch (error) {
      console.log(error);
    }
  }, []);
  return (
    <Modal
      title="Descarga de archivos"
      visible={isModalVisible}
      onOk={() => setIsModalVisible(false)}
      onCancel={() => setIsModalVisible(false)}
      closable={false}
    >
      <MainWrapper>
        <Button type="primary" onClick={downloadInventarioTotal}>
          Inventario Total
        </Button>
        <Button type="primary" onClick={downloadExcel}>
          Inventario Cajas
        </Button>

        <MovimientoCajasWrapper>
          <Button type="primary" onClick={downloadMovimientoCajas}>
            Movimiento de cajas
          </Button>
          {!isValid ? <Alert message="Fecha incorrecta" type="error" /> : ""}
          <DatePicker defaultValue={dateSelected} onChange={onChangePicker} />
        </MovimientoCajasWrapper>
      </MainWrapper>
    </Modal>
  );
};

export default DownloadFilesModal;

const MainWrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: flex-start;
`;

const MovimientoCajasWrapper = styled.div`
  display: flex;
  flex-direction: column;
  alignt-items: center;
  gap: 16px;
`;
