import React from "react";
import {
  Input,
  Modal,
  Table,
  Spin,
  Result,
  Typography,
  Timeline,
  Alert,
} from "antd";
import { UserOutlined } from "@ant-design/icons";

import { useLogsSupply } from "../util/hooks/useLogsSupply";

const { Text } = Typography;

export const ModalLogs = (props) => {
  const { supplyId, visible } = props;

  const { logs, isLoading, isError } = useLogsSupply(supplyId);

  const sortedLogs =
    logs && logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // console.log(sortedLogs.length);
  return (
    <Modal
      centered
      visible={visible}
      bodyStyle={{
        // width: "100%",
        // minHeight: "600px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onOk={() => props.onCancel()}
      onCancel={() => props.onCancel()}
      style={{ maxHeight: "80vh", overflow: "auto" }}
    >
      {isLoading && <Spin />}
      {sortedLogs && sortedLogs.length != 0 && !isLoading && !isError ? (
        <Timeline
        // style={{ width: "100%", display: "flex", justifyContent: "center" }}
        // mode="left"
        >
          {sortedLogs.map((log) => {
            return <TimeLineItem log={log} />;
          })}
        </Timeline>
      ) : !isLoading ? (
        <Result title="No se encontraron registros" />
      ) : null}
    </Modal>
  );
};

export const TimeLineItem = (props) => {
  const { detail, log, createdAt, action, user } = props.log;
  return (
    <Timeline.Item
    // label="2015-09-01"
    // label={new Date(createdAt).toLocaleString() || "date"}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Text mark>
          {new Date(createdAt).toLocaleString("es-PE", {
            timeZone: "America/Lima",
          })}
        </Text>
        {/* <Text message={action} strong> */}
        {/*   {action} */}
        {/* </Text> */}
        <span style={{ margin: "2px 0px" }}>
          <UserOutlined style={{ fontSize: "16px", fontWeight: 600 }} />
          <Text>{`   ${user.name} ${user.lastname || ""}`}</Text>
        </span>
        <Text strong>{log}</Text>
        <Text keyboard style={{ marginLeft: 0 }}>
          {detail}
        </Text>
      </div>
      {/* <div> */}
      {/*   <div>{action || "action"}</div> */}
      {/*   <div>{detail || "detail"}</div> */}
      {/* </div> */}
    </Timeline.Item>
  );
};
