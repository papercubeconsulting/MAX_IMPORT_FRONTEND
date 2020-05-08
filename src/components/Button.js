import styled from "styled-components";
import {Button as AntButton} from "antd";

export const Button = styled(AntButton)`
  width: ${props => props.width || "auto"};
  height: ${props => props.height || "2rem"} !important;
`;
