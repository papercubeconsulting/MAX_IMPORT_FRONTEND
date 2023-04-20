import React from 'react'
import { Modal, Button, DatePicker, Alert, Upload } from "antd";
import styled from 'styled-components'
import { InboxOutlined } from '@ant-design/icons';


const { Dragger } = Upload

export const ModalCargaMasiva = (props) => {


  const { isVisible } = props


  const closeModal = () => {
    props?.closeModal()
  }



  return (
    <Modal
      title="Carga Masiva"
      visible={isVisible}
      // onOk={closeModal}
      onCancel={closeModal}
      footer={null}
      closable
    >
      <div>
        <h3>Subir archivo de CSV</h3>
        <Dragger {...props.propsModal1}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click o arrastre el archivo a esta area para subir</p>
          <p className="ant-upload-hint">Suba el archivo</p>
        </Dragger>
      </div>
      <br/>
      <div >
        <h3>Subir las imagenes</h3>
        <Dragger {...props.propsModal2}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click o arrastre el archivo a esta area para subir</p>
          <p className="ant-upload-hint">Suba el archivo zip de las imagenes</p>
        </Dragger>
      </div>
    </Modal>

  )


}

