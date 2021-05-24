import React, { useState, useEffect } from "react";
import { Modal, notification, Table, Input } from "antd";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

import { getProviders, postProvider, putProvider } from "../../providers";

import { Button, Container, Grid, Icon, Select } from "../../components";

export const ModalProviders = ({ setIsVisibleProvidersModal }) => {
  const [providers, setProviders] = useState([]);
  const [windowHeight, setWindowHeight] = useState(0);
  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);

  // Crear/editar nuevo proveedor
  const [isVisibleNewProviderModal, setIsVisibleNewProviderModal] = useState(
    false
  );
  const [titleModal, setTitleModal] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(true);
  const [id, setId] = useState("");

  const statusOptions = [
    {
      value: true,
      label: "Activo",
    },
    {
      value: false,
      label: "Inactivo",
    },
  ];

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
          onClick={() => {
            setActive(record.active);
            setName(record.name);
            setCode(record.code);
            setId(id);
            setTitleModal("Editar");
            setIsVisibleNewProviderModal(true);
          }}
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

  const createOrUpdateProvider = async () => {
    const isCreate = titleModal === "Crear";
    try {
      let response;
      if (isCreate) {
        response = await postProvider({ name, code });
      } else {
        response = await putProvider(id, { name, active });
      }
      if (response.id) {
        setToggleUpdateTable((prev) => !prev);
        notification.success({
          message: `El proveedor se ha ${
            isCreate ? "creado" : "actualizado"
          } correctamente`,
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
        title={`${titleModal} proveedor`}
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
            disabled={titleModal !== "Crear"}
            addonBefore="Código"
          />
          <br />
          <Select
            value={active}
            onChange={(value) => setActive(value)}
            disabled={titleModal === "Crear"}
            options={statusOptions}
            label="Estado"
          />
        </Container>
        <br />
        <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="0rem">
          <Button
            onClick={createOrUpdateProvider}
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
            onClick={() => {
              setTitleModal("Crear");
              setActive(true);
              setName("");
              setCode("");
              setIsVisibleNewProviderModal(true);
            }}
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
