import React from "react";
import styled from "styled-components";
import {AutoComplete as AntAutoComplete} from "antd";
import {get} from "lodash";

export const AutoComplete = props => (
    <AutoCompleteContainer color={props.color}>
        {
            props.label &&
            <span className="ant-input-group-addon">
                {props.label}
            </span>
        }
        <AntAutoComplete {...props}
                         style={{width: "-webkit-fill-available"}}>
            {
                get(props, "_options", []).map(option =>
                    <AntAutoComplete.Option key={option.value}
                                            value={option.value}>
                        {option.label}
                    </AntAutoComplete.Option>
                )
            }
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
    background-color: ${props => props.color || "grey"} !important;
    color: white;
  }
  
  
  .ant-input-group-addon {
    width: auto;
    height: 2rem;
    line-height: 2rem;
  }
`;
