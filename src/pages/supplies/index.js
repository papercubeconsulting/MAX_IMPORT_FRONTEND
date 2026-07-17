import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useGlobal } from "reactn";
import { get } from "lodash";
import moment from "moment";
import styled from "styled-components";
import { Modal, notification, Space, Table } from "antd";
import {
  faCalendarAlt,
  faCheck,
  faEdit,
  faEye,
  faFilter,
  faPlus,
  faTrash,
  faUpload,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

import { clientDateFormat, serverDateFormat } from "../../util";
import { getSupplies, putSupplyStatus } from "../../providers";

import { Button, Container, DatePicker, Icon, Select } from "../../components";
import { ModalProviders } from "../../components/supplies/ModalProviders";
import { ModalCargaMasiva } from "../../components/supplies/[supplyId]/ModalCargaMasiva";
import { buildUrl, getToken } from "../../providers/baseProvider";
import FileSaver from "file-saver";

const SUPPLY_TYPES = {
  ALL: null,
  NORMAL: "NORMAL",
  STORE_RETURN: "STORE_RETURN",
  INVENTORY_ADJUSTMENT: "INVENTORY_ADJUSTMENT",
};

const supplyTypeOptions = [
  { value: SUPPLY_TYPES.NORMAL, label: "Proveedor" },
  { value: SUPPLY_TYPES.ALL, label: "Todos" },
  { value: SUPPLY_TYPES.STORE_RETURN, label: "Devolución de tienda" },
  { value: SUPPLY_TYPES.INVENTORY_ADJUSTMENT, label: "Ajuste inventario" },
];

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
          {supply.status === "Pendiente" &&
            !(
              supply.type === "STORE_RETURN" &&
              supply.suppliedProducts?.some(
                (item) => Number(item.suppliedQuantity) > 0
              )
            ) && (
            <Button
              padding="0 0.5rem"
              onClick={() => confirmCancelSupply(supplyId)}
              type="primary"
            >
              <Icon marginRight="0px" fontSize="0.8rem" icon={faTrash} />
            </Button>
          )}
        </Container>
      ),
    },
    {
      title: "Tipo",
      dataIndex: "type",
      align: "center",
      render: (type) => {
        if (type === "STORE_RETURN") return "Devolución de tienda";
        if (type === "INVENTORY_ADJUSTMENT") return "Ajuste inventario";
        return "Proveedor";
      },
    },
    {
      title: "Proveedor",
      dataIndex: "provider",
      align: "center",
      render: (provider, supply) =>
        provider?.name || supply.sourceWarehouse?.name || "-",
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
        ["Atendido", "Cerrado parcial"].includes(status) ? (
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
  const [supplyType, setSupplyType] = useState(SUPPLY_TYPES.NORMAL);
  const [toggleUpdateTable, setToggleUpdateTable] = useState(false);

  const [globalAuthUser] = useGlobal("authUser");
  const isSuperuser = get(globalAuthUser, "user.role") === "superuser";

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
        ...(supplyType ? { type: supplyType } : {}),
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
  }, [from, to, page, supplyType, toggleUpdateTable]);

  const updateSupplyType = (value) => {
    setSupplyType(value);
    setPage(1);
  };

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
      <SupplyHeader flexDirection="column" height="auto">
        <SupplyToolbar>
          <DateFilters>
            <DatePicker
              value={from}
              onChange={(value) => {
                setFrom(value);
                setPage(1);
              }}
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
              onChange={(value) => {
                setTo(value);
                setPage(1);
              }}
              format={clientDateFormat}
              disabledDate={(value) => value <= from}
              label={
                <>
                  <Icon icon={faCalendarAlt} />
                  Fecha Fin
                </>
              }
            />
            <Select
              label={
                <>
                  <Icon icon={faFilter} />
                  Tipo
                </>
              }
              value={supplyType}
              onChange={updateSupplyType}
              options={supplyTypeOptions}
            />
          </DateFilters>
          <HeaderActions>
            <Button
              type="primary"
              onClick={async () => router.push(`/supplies/new`)}
            >
              <Icon icon={faPlus} />
              Nuevo abastecimiento
            </Button>
            <Button type="primary" onClick={() => setIsCargaMasivaVisible(true)}>
              <Icon icon={faUpload} />
              Carga Masiva
            </Button>
            {isSuperuser && (
              <Button
                type="primary"
                onClick={() => setIsVisibleProvidersModal(true)}
              >
                <Icon icon={faUsers} />
                Proveedores
              </Button>
            )}
          </HeaderActions>
        </SupplyToolbar>
      </SupplyHeader>
      <Table
        columns={columns}
        bordered
        scrollToFirstRowOnChange
        pagination={pagination}
        scroll={{ y: windowHeight * 0.7 - 16 }}
        onChange={(pagination) => setPage(pagination.current)}
        rowKey={(record) => record.id}
        dataSource={supplies}
      />
    </>
  );
};

const SupplyHeader = styled(Container)`
  border-bottom: 1px solid #f0f0f0;
  padding: 1rem;
`;

const SupplyToolbar = styled.div`
  align-items: center;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1fr) auto;
  width: 100%;

  @media (max-width: 1080px) {
    align-items: stretch;
    grid-template-columns: 1fr;
  }
`;

const DateFilters = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(190px, 1fr));
  min-width: 0;

  @media (max-width: 780px) {
    grid-template-columns: 1fr;
  }
`;

const HeaderActions = styled(Space)`
  justify-content: flex-end;

  @media (max-width: 1080px) {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
`;
