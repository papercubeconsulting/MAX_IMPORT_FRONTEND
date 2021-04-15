import React, { useState, useEffect } from "react";
import { Modal, notification, Table } from "antd";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

import { getProviders } from "../../providers";

import { Button, Container, Grid, Icon } from "../../components";

export const ModalProviders = ({ setIsVisibleProvidersModal }) => {
  const [providers, setProviders] = useState([]);
  const [windowHeight, setWindowHeight] = useState(0);

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
  }, []);

  return (
    <Container height="fit-content" flexDirection="column" alignItems="center">
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
        <Button margin="auto" type="primary">
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
  );
};
