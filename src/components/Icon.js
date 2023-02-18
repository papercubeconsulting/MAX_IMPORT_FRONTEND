import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Icon = styled(FontAwesomeIcon)`
  font-size: ${props => props.fontSize || "1rem"};
  margin-right: ${props => props.marginRight || "0.5rem"};
  background: ${props => props.background }
`;
