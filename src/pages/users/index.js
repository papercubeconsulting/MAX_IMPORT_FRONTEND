import React, { useEffect, useState } from "react";
import moment from "moment";
import { useRouter } from "next/router";
import { Button, Container, Grid, Icon, Select } from "../../components";
import { getUsers, userProvider } from "../../providers";
import { clientDateFormat } from "../../util";
import { Input, notification, Table, Modal, Space } from "antd";
import {
  faEye,
  faToggleOn,
  faToggleOff,
} from "@fortawesome/free-solid-svg-icons";

export default ({ setPageTitle }) => {
  setPageTitle("Administración de Usuarios");
  const columns = [
    {
      title: "Mto.",
      key: "action",
      align: "center",
      dataIndex: "id",
      width: "100px",
      render: (id, record) => (
        <Space size="middle">
          <Button
            padding="0 0.5rem"
            type="primary"
            onClick={() => {
              setId(id);
              setEdit(true);
              setIsVisibleModalEdit(true);
            }}
          >
            <Icon marginRight="0px" fontSize="0.8rem" icon={faEye} />
          </Button>
          <Icon
            onClick={() => setIsVisibleModalDelete(true)}
            marginRight="0px"
            fontSize="1.3rem"
            icon={faToggleOff}
            style={{ cursor: "pointer", color: "#1890FF" }}
          />
        </Space>
      ),
    },
    {
      dataIndex: "createdAt",
      title: "Fecha Reg.",
      align: "center",
      render: (createdAt) => `${moment(createdAt).format(clientDateFormat)}`,
    },
    {
      dataIndex: "active",
      title: "Estado",
      align: "center",
      render: (active) => (active ? "Activo" : "Inacti."),
    },
    {
      dataIndex: "name",
      title: "Nombres",
      align: "center",
    },
    {
      dataIndex: "lastname",
      title: "Apellidos",
      align: "center",
    },
    {
      dataIndex: "idNumber",
      title: "DNI",
      align: "center",
    },
    {
      dataIndex: "email",
      title: "Correo",
      width: "190px",
      align: "center",
    },
    {
      dataIndex: "phoneNumber",
      title: "Tel. Contacto",
      align: "center",
    },
    {
      dataIndex: "role",
      title: "Perfil",
      align: "center",
    },
  ];

  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  const router = useRouter();

  //Datos de los usuarios
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState({ name: null });
  const [id, setId] = useState("");
  const [edit, setEdit] = useState(false);

  // Modales
  const [isVisibleModalEdit, setIsVisibleModalEdit] = useState(false);
  const [isVisibleModalDelete, setIsVisibleModalDelete] = useState(false);
  const [email, setEmail] = useState(null);
  const [
    isModalResetPasswordVisible,
    setIsModalResetPasswordVisible,
  ] = useState(false);

  //Obtiene a los usuarios y usuario actual
  useEffect(() => {
    const initialize = async () => {
      try {
        const _users = await getUsers();
        setUsers(_users);
        const _me = await userProvider.getUser();
        setMe(_me);
      } catch (error) {
        notification.error({
          message: "Error en el servidor",
          description: error.message,
        });
      }
    };

    initialize();
  }, []);

  return (
    <>
      <Modal
        visible={isVisibleModalDelete}
        width="40%"
        onCancel={() => setIsVisibleModalDelete(false)}
        footer={null}
      >
        <Container
          height="fit-content"
          flexDirection="column"
          alignItems="center"
        >
          <p style={{ fontWeight: "bold" }}>
            ¿Está seguro que desea pasar a Inactivo al usuario?
          </p>
          <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="0rem">
            <Button margin="auto" type="primary">
              Si, ejecutar
            </Button>
            <Button
              onClick={() => setIsVisibleModalDelete(false)}
              margin="auto"
              type="primary"
            >
              No, regresar
            </Button>
          </Grid>
        </Container>
      </Modal>
      <Modal
        visible={isVisibleModalEdit}
        width="60%"
        title={edit ? "Editar Datos del Usuario" : "Crear Usuario"}
        onCancel={() => setIsVisibleModalEdit(false)}
        footer={null}
      >
        <Container flexDirection="column" height="fit-content">
          <Grid
            marginBottom="1rem"
            gridTemplateColumns="repeat(3, 1fr)"
            gridGap="1rem"
          >
            <Input addonBefore="Fecha Reg." />
            <Select label="Estado" />
            <Input addonBefore="DNI" />
          </Grid>
          <Grid
            marginBottom="1rem"
            gridTemplateColumns="repeat(2, 1fr)"
            gridGap="1rem"
          >
            <Input addonBefore="Nombres" />
            <Input addonBefore="Apellidos" />
            <Input addonBefore="Correo" />
            <Input addonBefore="Tel. Contacto" />
          </Grid>
          <Grid
            marginBottom="1rem"
            gridTemplateColumns="repeat(2, 1fr)"
            gridGap="1rem"
          >
            <Select label="Perfil" />
            {edit && (
              <Button
                type="primary"
                onClick={() => setIsModalResetPasswordVisible(true)}
              >
                Reset Password
              </Button>
            )}
          </Grid>
        </Container>
        <Container>
          <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="4rem">
            <Button type="primary" gridColumnStart="2">
              Confirmar
            </Button>
            <Button
              type="primary"
              gridColumnStart="3"
              onClick={() => setIsVisibleModalEdit(false)}
            >
              Cancelar
            </Button>
          </Grid>
        </Container>
      </Modal>
      <Modal
        visible={isModalResetPasswordVisible}
        /* onOk={} */
        onCancel={() => setIsModalResetPasswordVisible(false)}
        width="40%"
        title="Recuperar contraseña"
      >
        Enviaremos un correo con un link para que pueda cambiar su contraseña al
        email que ingresó en la casilla correo: {email}
      </Modal>
      <Container height="fit-content">
        <Grid gridTemplateColumns="repeat(6, 1fr)" gridGap="1rem">
          <Input value={me.name} disabled addonBefore="Usuario" />
          <Button
            type="primary"
            onClick={() => {
              setEdit(false);
              setIsVisibleModalEdit(true);
            }}
          >
            Nuevo Usuario
          </Button>
          <Input placeholder="Nombres" addonBefore="Usuario" />
          <Input placeholder="Apellidos" />
          <Input placeholder="DNI" />
          <Button type="primary">Buscar</Button>
        </Grid>
      </Container>
      <Container height="fit-content">
        <Table
          columns={columns}
          scroll={{ y: windowHeight * 0.4 - 48 }}
          bordered
          dataSource={users}
          pagination={false}
        />
      </Container>
      <Container height="15%">
        <Grid gridTemplateColumns="repeat(3, 1fr)" gridGap="8rem">
          <Button
            onClick={() => router.back()}
            type="primary"
            gridColumnStart="2"
          >
            Regresar
          </Button>
        </Grid>
      </Container>
    </>
  );
};
