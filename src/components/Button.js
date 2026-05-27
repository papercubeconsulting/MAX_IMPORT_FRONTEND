import styled from "styled-components";
import { Button as AntButton } from "antd";

const layoutProps = new Set([
  "width",
  "height",
  "padding",
  "margin",
  "gridColumnStart",
  "background",
]);

export const Button = styled(AntButton).withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) =>
    defaultValidatorFn(prop) && !layoutProps.has(prop),
})`
  width: ${props => props.width || "auto"};
  height: ${props => props.height || "2rem"} !important;
  padding: ${props => props.padding || "0 1rem"} !important;
  margin: ${props => props.margin || 0} !important;
  grid-column-start: ${props => props.gridColumnStart || 0} !important;
  /* background: ${props => props.background || 'initial'} !important  */
`;
