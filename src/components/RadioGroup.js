import styled from "styled-components";
import { Radio as AntRadio } from "antd";

export const RadioGroup = styled(AntRadio.Group)`
  display: grid !important;
  width: ${(props) => props.width || "100%"};
  grid-template-columns: ${(props) => props.gridTemplateColumns || "1fr"};
  grid-template-rows: ${(props) => props.gridTemplateRows || "1fr"};
  grid-template-areas: ${(props) => props.gridTemplateAreas || "initial"};
  grid-gap: ${(props) => props.gridGap || 0};
  margin-bottom: ${(props) => props.marginBottom || 0} !important;
  justify-items: ${(props) => props.justifyItems || "initial"};
  grid-column-start: ${(props) => props.gridColumnStart || 0} !important;
  grid-column-end: ${(props) => props.gridColumnEnd || 0} !important;
  span{
    font-size: 16px !important;
  }
`;
