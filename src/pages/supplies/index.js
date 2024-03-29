import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useGlobal } from "reactn";
import { get } from "lodash";
import moment from "moment";
import { Modal, notification, Table } from "antd";
import {
  faCalendarAlt,
  faCheck,
  faEdit,
  faEye,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import { clientDateFormat, serverDateFormat } from "../../util";
import { getSupplies, putSupplyStatus } from "../../providers";

import { Button, Container, DatePicker, Grid, Icon } from "../../components";
import { ModalProviders } from "../../components/supplies/ModalProviders";
import { ModalCargaMasiva } from "../../components/supplies/[supplyId]/ModalCargaMasiva";
import { buildUrl, getToken } from "../../providers/baseProvider";
import FileSaver from "file-saver";

export default ({ setPageTitle }) => {
  setPageTitle("Abastecimiento");
  const columns = [
    {
      title: "Movimiento",
      dataIndex: "id",
      /* width: "120px", */
      align: "center",
      render: (supplyId, supply) => (
        <Container justifyContent="space-between" padding="0px">
          <Button
            padding="0 0.5rem"
            onClick={async () => router.push(`/supplies/${supplyId}`)}
          >
            <Icon marginRight="0px" fontSize="0.8rem" icon={faEdit} />
          </Button>
          <Button
            padding="0 0.5rem"
            onClick={() => confirmCancelSupply(supplyId)}
            type="primary"
          >
            <Icon marginRight="0px" fontSize="0.8rem" icon={faTrash} />
          </Button>
        </Container>
      ),
    },
    {
      title: "Proveedor",
      dataIndex: "provider",
      align: "center",
      render: (provider) => provider.name,
    },
    {
      title: "Cod. Carga",
      dataIndex: "code",
      align: "center",
    },
    {
      title: "Almacén",
      dataIndex: "warehouse",
      align: "center",
      render: (warehouse) => warehouse.name,
    },
    {
      title: "Fecha LLeg.",
      dataIndex: "arrivalDate",
      align: "center",
      render: (arrivalDate) =>
        moment(arrivalDate, serverDateFormat).format(clientDateFormat),
    },
    {
      title: "Estado",
      dataIndex: "status",
      align: "center",
    },
    {
      title: "Acción",
      dataIndex: "status",
      width: "150px",
      align: "center",
      render: (status, supply) =>
        status === "Atendido" ? (
          <Button
            width="fit-content"
            onClick={async () => router.push(`/supplies/${supply.id}`)}
          >
            <Icon icon={faEye} />
            Ver
          </Button>
        ) : (
          <Button
            width="fit-content"
            type="primary"
            onClick={async () =>
              router.push(`/supplies/${supply.id}?operation=attend`)
            }
          >
            <Icon icon={faCheck} />
            Atender
          </Button>
        ),
    },
    {
      title: "Responsable",
      dataIndex: "id",
      align: "center",
      render: () =>
        `${get(globalAuthUser, "user.name", "")} ${get(
          globalAuthUser,
          "user.lastname",
          ""
        )}`,
    },
    {
      title: "Fecha Aten.",
      dataIndex: "attentionDate",
      align: "center",
      render: (attentionDate, supply) =>
        attentionDate
          ? moment(attentionDate, serverDateFormat).format(clientDateFormat)
          : supply.status,
    },
  ];

  const [windowHeight, setWindowHeight] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [isCargaMasivaVisible, setIsCargaMasivaVisible] = React.useState(false);
  const [supplies, setSupplies] = useState([]);
  const [from, setFrom] = useState(moment().subtract(6, "months"));
  const [to, setTo] = useState(moment().add(6, "M"));
  const [page, setPage] = useState(1);
  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);

  const [globalAuthUser] = useGlobal("authUser");

  const router = useRouter();

  // modal proveedores
  const [isVisibleProvidersModal, setIsVisibleProvidersModal] = useState(false);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  const fetchProducts = async () => {
    try {
      const _supplies = await getSupplies({
        from: from.format(serverDateFormat),
        to: to.format(serverDateFormat),
        page,
      });
      setPagination({
        position: ["bottomCenter"],
        total: _supplies.count,
        current: _supplies.page,
        pageSize: _supplies.pageSize,
        showSizeChanger: false,
        showQuickJumper: true,
      });
      setSupplies(
        _supplies.rows.filter((supply) => supply.status !== "Cancelado")
      );
    } catch (error) {
      notification.error({
        message: "Error en el servidor",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [from, to, page, toggleUpdateTable]);

  const confirmCancelSupply = (supplyId) =>
    Modal.confirm({
      title: "Confirmar",
      content:
        "¿Está seguro de que desea marcar el abastecimiento como cancelado?",
      onOk: async () => cancelSupply(supplyId),
    });

  const cancelSupply = async (supplyId) => {
    try {
      await putSupplyStatus(supplyId, "Cancelado");
      setToggleUpdateTable((prevState) => !prevState);
    } catch (error) {
      notification.error({
        message: "Error al cancelar abastecimiento",
        description: error.message,
      });
    }
  };

  const propsModal1 = {
    name: "csv",
    multiple: false,
    customRequest: async (options) => {
      const { onSuccess, onError, file } = options;
      const formData = new FormData();
      formData.append("csv", file);
      const token = await getToken();
      try {
        const fetched = await fetch(buildUrl("supplies/csvUpload"), {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // console.log("fetched", fetched, fetched.ok);
        if (!fetched.ok) {
          const body = await fetched.json();
          throw new Error(body.userMessage || body.message);
        }
        const response = await fetched.blob();
        FileSaver.saveAs(response, "Inventario.xlsx");
        onSuccess("ok");
      } catch (error) {
        // console.log("error", error);
        notification.error({
          message: "Error procesando el archivo",
          description: error.message,
        });
        onError(error);
      }
    },
    async onChange(info) {
      const { status } = info.file;
      console.log("info");
      if (status !== "uploading") {
        console.log(info.file, info.file.xhr, info.fileList, info.event);
      }
      if (status === "done") {
        console.log("done", info.file.response);
        await Promise.all([fetchProducts()]);
      } else if (status === "error") {
        console.log("There was an error uploading the file");
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  return (
    <>
      <ModalCargaMasiva
        propsModal1={propsModal1}
        isVisible={isCargaMasivaVisible}
        closeModal={() => setIsCargaMasivaVisible(false)}
      />
      <Modal
        visible={isVisibleProvidersModal}
        title="Gestión de proveedores"
        centered
        width="800px"
        onCancel={() => setIsVisibleProvidersModal(false)}
        footer={null}
      >
        <ModalProviders
          setIsVisibleProvidersModal={setIsVisibleProvidersModal}
        />
      </Modal>
      <Container
        flexDirection="column"
        height="auto"
        padding=" 1rem 1rem 0rem 1rem"
      >
        <Grid
          gridTemplateColumns="repeat(3, 1fr)"
          gridGap="2rem"
          marginBottom="1rem"
        >
          <DatePicker
            value={from}
            onChange={(value) => setFrom(value)}
            format={clientDateFormat}
            disabledDate={(value) => value >= to}
            label={
              <>
                <Icon icon={faCalendarAlt} />
                Fecha Inicio
              </>
            }
          />
          <DatePicker
            value={to}
            onChange={(value) => setTo(value)}
            format={clientDateFormat}
            disabledDate={(value) => value <= from}
            label={
              <>
                <Icon icon={faCalendarAlt} />
                Fecha Fin
              </>
            }
          />
          <Button
            type="primary"
            onClick={async () => router.push(`/supplies/new`)}
          >
            Nuevo abastecimiento
          </Button>
        </Grid>
        {globalAuthUser && globalAuthUser.user.role === "superuser" && (
          <Grid
            gridTemplateColumns="repeat(3, 1fr)"
            gridGap="2rem"
            marginBottom="1rem"
          >
            <p></p>
            <p></p>
            <Button
              type="primary"
              onClick={() => setIsVisibleProvidersModal(true)}
            >
              Proveedores
            </Button>
          </Grid>
        )}
      </Container>
      <Table
        columns={columns}
        bordered
        scrollToFirstRowOnChange
        pagination={pagination}
        scroll={{ y: windowHeight * 0.7 - 16 }}
        onChange={(pagination) => setPage(pagination.current)}
        dataSource={supplies}
      />
      <Container height="15%">
        <Grid
          gridTemplateColumns="repeat(4, 1fr)"
          gridGap="2rem"
          justifyItems="center"
        >
          <Button
            onClick={() => setIsCargaMasivaVisible(true)}
            size="large"
            width="200px"
            type="primary"
          >
            Carga Masiva
          </Button>
        </Grid>
      </Container>
    </>
  );
};
