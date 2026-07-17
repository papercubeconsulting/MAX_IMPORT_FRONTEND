import React, { useEffect, useMemo, useState } from "react";
import { useGlobal } from "reactn";
import { useRouter } from "next/router";
import moment from "moment";
import styled from "styled-components";
import { get } from "lodash";
import { Alert, Input, Modal, notification, Space, Table, Tag } from "antd";
import {
  faCheck,
  faEye,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Container, Icon, Select } from "../../components";
import {
  approveInventoryReconciliations,
  denyInventoryReconciliations,
  getInventoryReconciliations,
} from "../../providers";
import { clientDateFormat } from "../../util";

const statusOptions = [
  { value: "PENDING", label: "Pendientes" },
  { value: null, label: "Todos" },
  { value: "COMPLETED", label: "Completadas" },
  { value: "DENIED", label: "Denegadas" },
];

const statusMeta = {
  PENDING: { label: "Pendiente", color: "gold" },
  DENIED: { label: "Denegada", color: "red" },
  COMPLETED: { label: "Completada", color: "green" },
};

const renderUser = (user) =>
  user ? [user.name, user.lastname].filter(Boolean).join(" ") || user.email : "-";

export default ({ setPageTitle }) => {
  const [globalAuthUser] = useGlobal("authUser");
  const router = useRouter();
  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [reconciliations, setReconciliations] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [windowHeight, setWindowHeight] = useState(720);

  const isSuperuser = get(globalAuthUser, "user.role") === "superuser";

  useEffect(() => {
    setPageTitle(`Reconciliaciones - ${reconciliations.length} solicitud(es)`);
  }, [reconciliations.length, setPageTitle]);

  useEffect(() => {
    if (typeof window !== "undefined") setWindowHeight(window.innerHeight);
  }, []);

  const fetchReconciliations = async () => {
    if (!isSuperuser) return;
    try {
      setLoading(true);
      const params = {};
      if (status) params.status = status;
      const response = await getInventoryReconciliations(params);
      setReconciliations(response || []);
      setSelectedRowKeys([]);
    } catch (error) {
      notification.error({
        message: "No se pudieron cargar las reconciliaciones",
        description: error.userMessage || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliations();
  }, [status, isSuperuser]);

  const visibleRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return reconciliations;
    return reconciliations.filter((item) => {
      const haystack = [
        item.id,
        get(item, "product.code"),
        get(item, "product.tradename"),
        get(item, "product.modelName"),
        get(item, "warehouse.name"),
        renderUser(item.creator),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [reconciliations, search]);

  const runAction = (type, ids) => {
    const isApprove = type === "approve";
    Modal.confirm({
      title: isApprove ? "Aprobar reconciliación" : "Denegar reconciliación",
      content:
        ids.length === 1
          ? "Esta acción actualizará la solicitud seleccionada."
          : `Esta acción actualizará ${ids.length} solicitudes seleccionadas.`,
      okText: isApprove ? "Aprobar" : "Denegar",
      cancelText: "Cancelar",
      okButtonProps: { danger: !isApprove },
      onOk: async () => {
        try {
          setActionLoading(type);
          const response = isApprove
            ? await approveInventoryReconciliations(ids)
            : await denyInventoryReconciliations(ids);
          const failed = get(response, "results", []).filter((result) => !result.ok);
          if (failed.length) {
            notification.warning({
              message: "Algunas solicitudes no se actualizaron",
              description: failed.map((item) => `#${item.id}: ${item.error}`).join(" | "),
            });
          } else {
            notification.success({
              message: isApprove
                ? "Reconciliación completada correctamente"
                : "Reconciliación denegada correctamente",
            });
          }
          await fetchReconciliations();
        } catch (error) {
          notification.error({
            message: isApprove
              ? "No se pudo aprobar la reconciliación"
              : "No se pudo denegar la reconciliación",
            description: error.userMessage || error.message,
          });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const columns = [
    {
      title: "Solicitud",
      key: "request",
      width: 180,
      render: (_, record) => (
        <RequestCell>
          <strong>#{record.id}</strong>
          <Tag color={get(statusMeta, `${record.status}.color`, "default")}>
            {get(statusMeta, `${record.status}.label`, record.status)}
          </Tag>
          <span>{moment(record.createdAt).format(clientDateFormat)}</span>
        </RequestCell>
      ),
    },
    {
      title: "Producto / tienda",
      key: "product",
      render: (_, record) => (
        <MainCell>
          <ProductLink onClick={() => router.push(`/products/${record.productId}`)}>
            <strong>{record.product?.code || "-"}</strong>
            <span>{record.product?.tradename || record.product?.modelName || "-"}</span>
          </ProductLink>
          <MiniMeta>{record.warehouse?.name || "-"}</MiniMeta>
        </MainCell>
      ),
    },
    {
      title: "Stock",
      key: "stock",
      align: "center",
      width: 250,
      render: (_, record) => (
        <StockPills>
          <StockPill>
            <span>Sistema</span>
            <strong>{record.systemStock}</strong>
          </StockPill>
          <StockPill>
            <span>Conteo</span>
            <strong>{record.countedStock}</strong>
          </StockPill>
          <StockPill>
            <span>Dif.</span>
            <Delta $value={record.delta}>{record.delta > 0 ? `+${record.delta}` : record.delta}</Delta>
          </StockPill>
        </StockPills>
      ),
    },
    {
      title: "Solicitado por",
      dataIndex: "creator",
      width: 180,
      render: (creator, record) => (
        <MainCell>
          <strong>{renderUser(creator)}</strong>
          {record.confirmer && <MiniMeta>Confirmó: {renderUser(record.confirmer)}</MiniMeta>}
        </MainCell>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      align: "center",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            padding="0 0.5rem"
            title="Ver detalle"
            type="primary"
            onClick={() => setDetail(record)}
          >
            <Icon marginRight="0px" fontSize="0.8rem" icon={faEye} />
          </Button>
          {record.status === "PENDING" && (
            <>
              <Button
                padding="0 0.5rem"
                title="Aprobar"
                type="primary"
                loading={actionLoading === "approve"}
                onClick={() => runAction("approve", [record.id])}
              >
                <Icon marginRight="0px" fontSize="0.8rem" icon={faCheck} />
              </Button>
              <Button
                danger
                padding="0 0.5rem"
                title="Denegar"
                type="primary"
                loading={actionLoading === "deny"}
                onClick={() => runAction("deny", [record.id])}
              >
                <Icon marginRight="0px" fontSize="0.8rem" icon={faTimes} />
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const sourceColumns = [
    { title: "Código caja", dataIndex: "trackingCode", render: (value) => value || "Lote lógico" },
    { title: "Tipo", dataIndex: "inventoryKind", render: (value) => value === "EXPLODED" ? "Unitario" : "Caja" },
    { title: "Ubicación", dataIndex: "warehouseName" },
    { title: "Stock al solicitar", dataIndex: "stockAtRequest", align: "center" },
    { title: "Cantidad", dataIndex: "quantity", align: "center" },
  ];

  const selectedPendingIds = selectedRowKeys.filter((id) =>
    reconciliations.some((item) => item.id === id && item.status === "PENDING")
  );

  if (globalAuthUser && !isSuperuser) {
    return (
      <Container height="fit-content" flexDirection="column">
        <Alert
          type="warning"
          showIcon
          message="Módulo disponible solo para superuser"
          description="Las aprobaciones de reconciliación modifican inventario y requieren permisos de superusuario."
        />
      </Container>
    );
  }

  return (
    <>
      <Container height="fit-content" flexDirection="column">
        <Toolbar>
          <Select
            label="Estado"
            value={status}
            onChange={setStatus}
            options={statusOptions}
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por producto, tienda o solicitante"
            allowClear
          />
          <Button type="primary" onClick={fetchReconciliations} loading={loading}>
            Actualizar
          </Button>
        </Toolbar>
        <ActionBar>
          <span>{selectedPendingIds.length} pendiente(s) seleccionada(s)</span>
          <Space>
            <Button
              type="primary"
              disabled={!selectedPendingIds.length}
              loading={actionLoading === "approve"}
              onClick={() => runAction("approve", selectedPendingIds)}
            >
              Aprobar seleccionadas
            </Button>
            <Button
              danger
              type="primary"
              disabled={!selectedPendingIds.length}
              loading={actionLoading === "deny"}
              onClick={() => runAction("deny", selectedPendingIds)}
            >
              Denegar seleccionadas
            </Button>
          </Space>
        </ActionBar>
      </Container>

      <Container height="fit-content">
        <TableSurface>
          <Table
            rowKey="id"
            bordered
            loading={loading}
            columns={columns}
            dataSource={visibleRows}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              getCheckboxProps: (record) => ({
                disabled: record.status !== "PENDING",
              }),
            }}
            scroll={{ x: 880, y: windowHeight * 0.55 }}
            size="middle"
            pagination={{ position: ["bottomCenter"], pageSize: 10, showSizeChanger: false }}
          />
        </TableSurface>
      </Container>

      <Modal
        visible={!!detail}
        width="900px"
        title={`Reconciliación #${detail?.id || ""}`}
        footer={null}
        onCancel={() => setDetail(null)}
      >
        <DetailGrid>
          <Info><span>Producto</span><strong>{get(detail, "product.code", "-")}</strong></Info>
          <Info><span>Tienda</span><strong>{get(detail, "warehouse.name", "-")}</strong></Info>
          <Info><span>Fecha</span><strong>{detail?.createdAt ? moment(detail.createdAt).format(clientDateFormat) : "-"}</strong></Info>
          <Info><span>Sistema</span><strong>{detail?.systemStock ?? "-"}</strong></Info>
          <Info><span>Conteo</span><strong>{detail?.countedStock ?? "-"}</strong></Info>
          <Info><span>Diferencia</span><strong>{detail?.delta > 0 ? `+${detail.delta}` : detail?.delta ?? "-"}</strong></Info>
          <Info><span>Estado</span><strong>{get(statusMeta, `${detail?.status}.label`, detail?.status || "-")}</strong></Info>
          <Info><span>Solicitado por</span><strong>{renderUser(detail?.creator)}</strong></Info>
          <Info><span>Confirmado por</span><strong>{renderUser(detail?.confirmer)}</strong></Info>
        </DetailGrid>
        {detail?.delta < 0 && (
          <>
            <SectionTitle>Fuentes seleccionadas</SectionTitle>
            <Table
              rowKey="productBoxId"
              columns={sourceColumns}
              dataSource={detail.sources || []}
              pagination={false}
              size="small"
            />
          </>
        )}
        {detail?.delta > 0 && (
          <Alert
            type="info"
            showIcon
            message={`Al aprobar, se agregarán ${detail.delta} unidad(es) a la tienda seleccionada.`}
          />
        )}
      </Modal>
    </>
  );
};

const Toolbar = styled.div`
  align-items: center;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(220px, 280px) minmax(260px, 1fr) auto;
  width: 100%;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ActionBar = styled.div`
  align-items: center;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  width: 100%;

  @media (max-width: 700px) {
    align-items: stretch;
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const TableSurface = styled.div`
  width: 100%;

  .ant-table-tbody > tr > td {
    padding-bottom: 0.65rem;
    padding-top: 0.65rem;
    vertical-align: middle;
  }

  .ant-table-selection-column {
    width: 42px;
  }
`;

const RequestCell = styled.div`
  align-items: flex-start;
  display: grid;
  gap: 0.25rem;

  strong {
    color: rgba(0, 0, 0, 0.85);
    font-size: 0.95rem;
  }

  span {
    color: rgba(0, 0, 0, 0.55);
    font-size: 0.82rem;
  }

  .ant-tag {
    margin-right: 0;
    width: fit-content;
  }
`;

const MainCell = styled.div`
  display: grid;
  gap: 0.25rem;
  min-width: 0;

  strong {
    color: rgba(0, 0, 0, 0.82);
  }
`;

const MiniMeta = styled.span`
  color: rgba(0, 0, 0, 0.55);
  font-size: 0.82rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProductLink = styled.button`
  background: transparent;
  border: 0;
  color: #1890ff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  padding: 0;
  text-align: left;

  span {
    color: rgba(0, 0, 0, 0.65);
    font-size: 0.85rem;
  }
`;

const StockPills = styled.div`
  display: grid;
  gap: 0.35rem;
  grid-template-columns: repeat(3, minmax(58px, 1fr));
`;

const StockPill = styled.div`
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  display: grid;
  gap: 0.15rem;
  padding: 0.45rem 0.35rem;

  span {
    color: rgba(0, 0, 0, 0.48);
    font-size: 0.72rem;
  }

  strong {
    color: rgba(0, 0, 0, 0.85);
  }
`;

const Delta = styled.span`
  color: ${(props) => (props.$value > 0 ? "#237804" : props.$value < 0 ? "#cf1322" : "#595959")};
  font-weight: 700;
`;

const DetailGrid = styled.div`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 1rem;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Info = styled.div`
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 0.75rem;

  span {
    color: rgba(0, 0, 0, 0.45);
    display: block;
    font-size: 0.78rem;
    margin-bottom: 0.25rem;
  }

  strong {
    color: rgba(0, 0, 0, 0.85);
  }
`;

const SectionTitle = styled.h3`
  margin: 1rem 0 0.75rem;
`;
