import React, { useEffect, useState, useRef } from "react";
import moment from "moment";
import { useRouter } from "next/router";
import { Button, Container, Grid, Icon, Select } from "../../components";
import { CreateOrEditUser } from "../../components/users";
import { getUsers, userProvider, putUser } from "../../providers";
import { urlQueryParams, clientDateFormat } from "../../util";
import { Input, notification, Table, Modal, Space } from "antd";
import { faEye, faUser, faUserSlash } from "@fortawesome/free-solid-svg-icons";

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
              setDataUser(record);
              setIsVisibleModalEdit(true);
            }}
          >
            <Icon marginRight="0px" fontSize="0.8rem" icon={faEye} />
          </Button>
          <Icon
            onClick={() => {
              setId(id);
              setActive(record.active);
              setTextModal(record.active ? "Inactivo" : "Activo");
              setIsVisibleModalDelete(true);
            }}
            marginRight="0px"
            fontSize="1.3rem"
            icon={record.active ? faUser : faUserSlash}
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

  //extraccion de params de url
  const stateUpdateOrigin = useRef("url");
  const router = useRouter();
  const queryParams = router.query;

  //para el filtro por nro doc
  const [documentNumber, setDocumentNumber] = useState(null);
  //para el filtro con datos del usuario
  const [userName, setUserName] = useState(null);
  const [userLastName, setUserLastName] = useState(null);
  //para el filtro por status del usuario
  const [status, setStatus] = useState(null);
  //para el filtro por perfil del usuario
  const [profile, setProfile] = useState(null);

  //Datos de los usuarios
  const [users, setUsers] = useState([]);
  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);
  const [me, setMe] = useState({ name: null });
  const [id, setId] = useState("");
  const [edit, setEdit] = useState(false);

  // Modales
  const [dataUser, setDataUser] = useState();
  const [isVisibleModalEdit, setIsVisibleModalEdit] = useState(false);
  const [active, setActive] = useState("");
  const [textModal, setTextModal] = useState("");
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
        const _users = await getUsers(queryParams);
        setUsers(_users.rows);
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
    if (stateUpdateOrigin.current === "url") {
      urlToState();
    }
  }, [queryParams, toggleUpdateTable]);

  const stateToUrl = async () => {
    const params = {};
    documentNumber && (params.idNumber = documentNumber);
    userName && (params.name = userName);
    userLastName && (params.lastname = userLastName);
    status && (params.active = status);
    profile && (params.role = profile);
    await router.push(`/users${urlQueryParams(params)}`);
  };

  const searchWithState = () => {
    stateToUrl();
  };

  const urlToState = () => {
    setDocumentNumber(queryParams.idNumber || null);
    setUserName(queryParams.name || null);
    setUserLastName(queryParams.lastname || null);
    setStatus(queryParams.active || null);
    setProfile(queryParams.role || null);
  };

  const statusOptions = [
    {
      value: null,
      label: "Todos",
    },
    {
      value: "true",
      label: "Activo",
    },
    {
      value: "false",
      label: "Inactivo",
    },
  ];

  const profilesOptions = [
    {
      value: null,
      label: "Todos",
    },
    {
      value: "manager",
      label: "Administrador",
    },
    {
      value: "logistic",
      label: "Logístico",
    },
    {
      value: "superuser",
      label: "Super usuario",
    },
    {
      value: "seller",
      label: "Vendedor",
    },
  ];

  // actualiza usuario
  const updateUser = async (body) => {
    try {
      const response = await putUser(id, body);
      console.log(response);
      setIsVisibleModalDelete(false);
      setToggleUpdateTable((prev) => !prev);
      notification.success({
        message: "Usuario actualizado exitosamente ",
      });
    } catch (error) {
      notification.error({
        message: "Error al actualizar datos del usuario",
        description: error.userMessage,
      });
    }
  };

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
            ¿Está seguro que desea pasar a {textModal} al cliente?
          </p>
          <Grid gridTemplateColumns="repeat(2, 1fr)" gridGap="0rem">
            <Button
              onClick={() => {
                updateUser({ active: !active });
              }}
              margin="auto"
              type="primary"
            >
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
        <CreateOrEditUser
          edit={edit}
          dataUser={dataUser}
          setIsVisibleModalEdit={setIsVisibleModalEdit}
          setIsModalResetPasswordVisible={setIsModalResetPasswordVisible}
        />
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
        <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap="1rem">
          <Input value={me.name} disabled addonBefore="Usuario" />
          <Input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Nombres"
            addonBefore="Usuario"
          />
          <Input
            value={userLastName}
            onChange={(e) => setUserLastName(e.target.value)}
            placeholder="Apellidos"
          />
          <Input
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            placeholder="DNI"
          />
          <Select
            value={status}
            onChange={(value) => setStatus(value)}
            label="Estado"
            options={statusOptions}
          />
          <Select
            value={profile}
            onChange={(value) => setProfile(value)}
            label="Perfil"
            options={profilesOptions}
          />
          <Button onClick={searchWithState} type="primary">
            Buscar
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setEdit(false);
              setIsVisibleModalEdit(true);
            }}
          >
            Nuevo Usuario
          </Button>
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
