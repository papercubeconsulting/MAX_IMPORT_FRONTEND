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

  console.log({ logs });

  const sortedLogs =
    logs && logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // console.log(sortedLogs.length);
  return (
    <Modal
      centered
      visible={visible}
      onOk={() => props.onCancel()}
      onCancel={() => props.onCancel()}
    >
      {isLoading && <Spin />}
      {sortedLogs && sortedLogs.length != 0 && !isLoading && !isError ? (
        <Timeline
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
          mode="left"
        >
          {sortedLogs.map((log) => {
            return <TimeLineItem log={log} />;
          })}
        </Timeline>
      ) : (
        <Result title="No se encontraron registros" />
      )}
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
        <Text mark>{new Date(createdAt).toLocaleString()}</Text>
        <Text message={action} strong>
          {action}
        </Text>
        <span>
          <UserOutlined />
          <Text>{`   ${user.name} ${user.lastname || ""}`}</Text>
        </span>
        <Text>{log}</Text>
        <Text>{detail}</Text>
      </div>
      {/* <div> */}
      {/*   <div>{action || "action"}</div> */}
      {/*   <div>{detail || "detail"}</div> */}
      {/* </div> */}
    </Timeline.Item>
  );
};
