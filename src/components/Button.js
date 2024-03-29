import styled from "styled-components";
import { Button as AntButton } from "antd";

export const Button = styled(AntButton)`
  width: ${props => props.width || "auto"};
  height: ${props => props.height || "2rem"} !important;
  padding: ${props => props.padding || "0 1rem"} !important;
  margin: ${props => props.margin || 0} !important;
  grid-column-start: ${props => props.gridColumnStart || 0} !important;
  /* background: ${props => props.background || 'initial'} !important  */
`;
