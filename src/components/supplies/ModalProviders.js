import React, { useState, useEffect } from "react";
import { Modal, notification, Table, Input } from "antd";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

import { getProviders, postProvider } from "../../providers";

import { Button, Container, Grid, Icon } from "../../components";

export const ModalProviders = ({ setIsVisibleProvidersModal }) => {
  const [providers, setProviders] = useState([]);
  const [windowHeight, setWindowHeight] = useState(0);
  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);

  // Crear nuevo proveedor
  const [isVisibleNewProviderModal, setIsVisibleNewProviderModal] = useState(
    false
  );
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const columns = [
    {
      title: "Proveedor",
      dataIndex: "name",
      align: "center",
    },
    {
      title: "Código",
      dataIndex: "code",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "active",
      align: "center",
      render: (active) => (active ? "Activo" : "Inactivo"),
    },
    {
      title: "",
      dataIndex: "id",
      width: "150px",
      align: "center",
      render: (id, record) => (
        <Button
          width="fit-content"
          /* onClick={async () => router.push(`/supplies/${supply.id}`)} */
        >
          <Icon icon={faEdit} />
          Editar
        </Button>
      ),
    },
  ];

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    const fetchProviders = async () => {
      const _providers = await getProviders();
      setProviders(_providers);
    };
    fetchProviders();
  }, [toggleUpdateTable]);

  const createNewProvider = async () => {
    try {
      const response = await postProvider({ name, code });
      if (response.id) {
        setToggleUpdateTable((prev) => !prev);
        notification.success({
          message: "El proveedor se ha creado correctamente",
        });
        setIsVisibleNewProviderModal(false);
      }
    } catch (error) {
      notification.error({
        message: "Ocurrió un error. Por favor vuelva a intentarlo",
      });
    }
  };

  return (
    <>
      <Modal
        visible={isVisibleNewProviderModal}
        title="Crear proveedor"
        centered
        /* width="800px" */
        onCancel={() => setIsVisibleNewProviderModal(false)}
        footer={null}
      >
        <Container
          flexDirection="column"
          height="auto"
          padding=" 0rem 1rem 1rem 1rem"
        >
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            addonBefore="Nombre"
          />
          <br />
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            addonBefore="Código"
          />
        </Container>
        <br />
        <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="0rem">
          <Button
            onClick={createNewProvider}
            disabled={!name || !code}
            margin="auto"
            type="primary"
          >
            Guardar
          </Button>
          <Button
            onClick={() => setIsVisibleNewProviderModal(false)}
            margin="auto"
            type="primary"
          >
            Cancelar
          </Button>
        </Grid>
      </Modal>
      <Container
        height="fit-content"
        flexDirection="column"
        alignItems="center"
      >
        <Table
          columns={columns}
          bordered
          scrollToFirstRowOnChange
          pagination={{ position: ["bottomCenter"] }}
          scroll={{ y: windowHeight * 0.5 - 48 }}
          dataSource={providers}
        />
        <br />
        <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="0rem">
          <Button
            onClick={() => setIsVisibleNewProviderModal(true)}
            margin="auto"
            type="primary"
          >
            Crear nuevo proveedor
          </Button>
          <Button
            onClick={() => setIsVisibleProvidersModal(false)}
            margin="auto"
            type="primary"
          >
            Cancelar
          </Button>
        </Grid>
      </Container>
    </>
  );
};
