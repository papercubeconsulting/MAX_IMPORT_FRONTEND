import React from "react";
import styled from "styled-components";
import {Select as AntSelect} from "antd";
import {get} from "lodash";

export const Select = props => (
    <SelectContainer>
        {
            props.label &&
            <span className="ant-input-group-addon">
                {props.label}
            </span>
        }
        <AntSelect {...props}
                   style={{width: "100%", ...props.style}}>
            {
                get(props, "options", []).map((option, index) =>
                    <AntSelect.Option key={index}
                                      value={option.value}>
                        {option.label}
                    </AntSelect.Option>
                )
            }
        </AntSelect>
    </SelectContainer>
);

const SelectContainer = styled.div`
  display: flex;
  width: 100%;
  min-width: 0;
  height: fit-content;
  flex-direction: row;
  align-items: center;

  .ant-select {
    flex: 1;
    min-width: 0;
  }
  
  .ant-input-group-addon {
    flex: 0 0 auto;
    width: auto;
    height: 2rem;
    line-height: 2rem;
  }
`;
