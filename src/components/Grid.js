import styled from "styled-components";

export const Grid = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: ${props => props.gridTemplateColumns || "1fr"};
  grid-template-rows: ${props => props.gridTemplateRows || "1fr"};
  grid-gap: ${props => props.gridGap || 0};
`;
