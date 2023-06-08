import React from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { FileTextOutlined } from "@ant-design/icons";
import { Button } from "antd";

export const FloatButton = (props) => {
  const [mounted, setMounted] = React.useState(false);

  const ref = React.useRef();

  React.useEffect(() => {
    ref.current = document.body;
    setMounted(true);
  }, []);

  return mounted && ref.current
    ? createPortal(
      <FloatingButtonContainer>
        <Button
          type="primary"
          shape="circle"
          icon={<FileTextOutlined />}
          size="large"
          onClick={props.onClick}
        >
          {/* Logs */}
        </Button>
      </FloatingButtonContainer>,
      ref.current
    )
    : null;
};

export const FloatingButtonContainer = styled("div")`
  position: fixed;
  bottom: 20px;
  right: 0;
  margin: 50px;
  z-index: 999;
`;
