import React, { useState, useEffect } from "react";
import { Modal, notification, Table } from "antd";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

import { Button, Container, Grid } from "../../components";

export const ModalProviders = ({ setIsVisibleProvidersModal }) => {
  const [providers, setProviders] = useState([]);
  const [windowHeight, setWindowHeight] = useState(0);

  const columns = [
    {
      title: "Proveedor",
      dataIndex: "provider",
      align: "center",
      render: (provider) => provider.name,
    },
    {
      title: "Código",
      dataIndex: "code",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "warehouse",
      align: "center",
      render: (warehouse) => warehouse.name,
    },
    {
      title: "",
      dataIndex: "status",
      width: "150px",
      align: "center",
      render: (status, supply) => (
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

  return (
    <Container height="fit-content" flexDirection="column" alignItems="center">
      <Table
        columns={columns}
        bordered
        scrollToFirstRowOnChange
        /* pagination={pagination} */
        scroll={{ y: windowHeight * 0.7 - 16 }}
        /* onChange={(pagination) => setPage(pagination.current)} */
        dataSource={providers}
      />
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
