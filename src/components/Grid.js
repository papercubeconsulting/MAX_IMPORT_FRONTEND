import styled from "styled-components";

export const Grid = styled.div`
  display: grid;
  width: ${props => props.width || "100%"};
  grid-template-columns: ${props => props.gridTemplateColumns || "1fr"};
  grid-template-rows: ${props => props.gridTemplateRows || "1fr"};
  grid-template-areas: ${props => props.gridTemplateAreas || "initial"};
  grid-gap: ${props => props.gridGap || 0};
  margin-bottom: ${props => props.marginBottom || 0};
  justify-items: ${props => props.justifyItems || "initial"};
  grid-column-end:${props => props.gridColumnEnd || ""};
  grid-column-start:${props => props.gridColumnStart || ""};
`;
