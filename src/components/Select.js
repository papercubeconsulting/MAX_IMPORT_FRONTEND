import React from "react";
import styled from "styled-components";
import {Select as AntSelect} from "antd";
import {get} from "lodash";

const NULL_OPTION_VALUE = "__MAX_IMPORT_NULL_OPTION__";

const normalizeOptionValue = (value) =>
    value === null ? NULL_OPTION_VALUE : value;

const normalizeSelectedValue = (value, hasNullOption) => {
    if (value !== null) return value;
    return hasNullOption ? NULL_OPTION_VALUE : undefined;
};

const denormalizeValue = (value) =>
    value === NULL_OPTION_VALUE ? null : value;

export const Select = ({
    label,
    options,
    value,
    defaultValue,
    onChange,
    style,
    ...props
}) => {
    const hasNullOption = get({options}, "options", []).some(
        (option) => option.value === null,
    );

    return (
        <SelectContainer>
        {
            label &&
            <span className="ant-input-group-addon">
                {label}
            </span>
        }
        <AntSelect
            {...props}
            value={normalizeSelectedValue(value, hasNullOption)}
            defaultValue={normalizeSelectedValue(defaultValue, hasNullOption)}
            onChange={(selectedValue, option) =>
                onChange && onChange(denormalizeValue(selectedValue), option)
            }
            style={{width: "100%", ...style}}>
            {
                get({options}, "options", []).map((option, index) =>
                    <AntSelect.Option key={index}
                                      value={normalizeOptionValue(option.value)}>
                        {option.label}
                    </AntSelect.Option>
                )
            }
        </AntSelect>
        </SelectContainer>
    );
};

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
