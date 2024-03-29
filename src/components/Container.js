import styled from "styled-components";

export const Container = styled.div`
  display:  ${props => props.display || "flex"};
  height: ${props => props.height || "100%"};
  width: ${props => props.width || "100%"};
  flex-direction: ${props => props.flexDirection || "initial"};
  align-items: ${props => props.alignItems || "initial"};
  justify-content: ${props => props.justifyContent || "initial"};
  padding: ${props => props.padding || "1rem"};
  text-align: ${props => props.textAlign || "left"};
`;
