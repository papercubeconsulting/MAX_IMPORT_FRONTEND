import React from "react";
import styled from "styled-components";
import { AutoComplete as AntAutoComplete } from "antd";

export const AutoComplete = ({
  color,
  colorFont,
  label,
  _options,
  ...autoCompleteProps
}) => (
  <AutoCompleteContainer $color={color} $colorFont={colorFont}>
    {label && <span className="ant-input-group-addon">{label}</span>}
    <AntAutoComplete
      {...autoCompleteProps}
      style={{ width: "-webkit-fill-available", ...autoCompleteProps.style }}
    >
      {(_options || []).map((option) => (
        <AntAutoComplete.Option key={option.value} value={option.value}>
          {option.label}
        </AntAutoComplete.Option>
      ))}
    </AntAutoComplete>
  </AutoCompleteContainer>
);

const AutoCompleteContainer = styled.div`
  display: flex;
  width: 100%;
  height: fit-content;
  flex-direction: row;
  align-items: center;

  .ant-select-selector {
    background-color: ${(props) => props.$color || "grey"} !important;
    color: ${(props) => props.$colorFont || "white"};
  }

  .ant-input-group-addon {
    width: auto;
    height: 2rem;
    line-height: 2rem;
  }
`;
