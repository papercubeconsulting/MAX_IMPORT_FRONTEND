import { NextPage } from "next";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import es from "date-fns/locale/es";
registerLocale("es", es);
setDefaultLocale("es");
type DateCallback = (date: Date) => void;
const FieldGroup: NextPage<{
  label: string;
  icon: IconProp;
  fieldConfig:
    | {
        defaultValue: string;
        type: "text";
        onChange?(text: string): void;
      }
    | {
        defaultValue: Date;
        type: "date";
        onChange?: DateCallback;
      };
}> = ({ icon, label, fieldConfig: { defaultValue, type, onChange } }) => (
  <div className="input-group mb-3 mt-3">
    <div className="input-group-prepend">
      <span className="input-group-text" id="basic-addon3">
        <FontAwesomeIcon icon={icon} />
        <span style={{ marginLeft: 5 }}>{label}</span>
      </span>
    </div>
    {type == "date" && (
      <DatePicker
        className="form-control"
        selected={defaultValue as Date}
        onChange={onChange as DateCallback}
        dateFormat="dd/MM/yyyy"
        readOnly={onChange === undefined}
      />
    )}
    {type == "text" && (
      <input
        type="text"
        className="form-control"
        id="basic-url"
        defaultValue={defaultValue as string}
        style={{ minWidth: 100 }}
        readOnly={onChange === undefined}
      />
    )}
  </div>
);
export default FieldGroup;
