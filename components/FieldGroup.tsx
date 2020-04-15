import { NextPage } from "next";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import DropdownList, { SelectItem, SelectItemCallback } from "./DropdownList";
registerLocale("es", es);
setDefaultLocale("es");
type DateCallback = (date: Date) => void;
type TextCallback = (str: string) => void;
type FileCallback = (FileList: FileList) => void;
type DropdownConfig = {
  data: SelectItem[];
  value: SelectItem | null;
  type: "dropdown";
  onChange: SelectItemCallback;
};
const FieldGroup: NextPage<{
  label: string;
  icon?: IconProp;
  fieldConfig:
    | {
        value: string;
        type: "text" | "number";
        onChange?: TextCallback;
      }
    | {
        value: Date;
        type: "date";
        onChange?: DateCallback;
      }
    | {
        value?: undefined;
        type: "file";
        onChange?: FileCallback;
      }
    | DropdownConfig;
}> = ({ icon, label, fieldConfig }) => {
  let { value, type, onChange } = fieldConfig;
  return (
    <div className="input-group mb-3">
      <div className="input-group-prepend">
        <span className="input-group-text" id="basic-addon3">
          {icon && <FontAwesomeIcon icon={icon} />}
          <span style={{ marginLeft: 5 }}>{label}</span>
        </span>
      </div>
      {type == "date" && (
        <DatePicker
          className="form-control"
          selected={value as Date}
          onChange={onChange as DateCallback}
          dateFormat="dd/MM/yyyy"
          readOnly={onChange === undefined}
        />
      )}
      {(type == "text" || type == "number") && (
        <input
          type={type}
          className="form-control"
          defaultValue={value as string}
          style={{ minWidth: 100 }}
          readOnly={onChange === undefined}
          onChange={(e) => {
            onChange && (onChange as TextCallback)(e.target.value);
          }}
        />
      )}
      {type == "dropdown" && (
        <DropdownList
          value={value as SelectItem}
          data={(fieldConfig as DropdownConfig).data as SelectItem[]}
          onChange={onChange as SelectItemCallback}
        />
      )}
      {type == "file" && (
        <input
          type="file"
          className="form-control"
          defaultValue={value as string}
          style={{ minWidth: 100 }}
          readOnly={onChange === undefined}
          onChange={(e) => {
            onChange && (onChange as FileCallback)(e.target.files as FileList);
          }}
        />
      )}
    </div>
  );
};
export default FieldGroup;
