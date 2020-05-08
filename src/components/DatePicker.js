import React from "react";
import styled from "styled-components";
import {DatePicker as AntDatePicker} from "antd";

export const DatePicker = props => (
    <DatePickerContainer>
        {
            props.label &&
            <span className="ant-input-group-addon">
                {props.label}
            </span>
        }
        <AntDatePicker {...props} style={{width: "-webkit-fill-available"}}/>
    </DatePickerContainer>
);

const DatePickerContainer = styled.div`
  display: flex;
  width: 100%;
  height: fit-content;
  flex-direction: row;
  align-items: center;
  
  .ant-input-group-addon {
    width: auto;
    height: 2rem;
    line-height: 2rem;
  }
`;
