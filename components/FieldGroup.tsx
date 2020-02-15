import { NextPage } from 'next';
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const FieldGroup: NextPage<{ label: string, icon: IconProp, value: string }> = ({ icon, label, value }) => (
    <div className="input-group mb-3">
      <div className="input-group-prepend">
        <span className="input-group-text" id="basic-addon3">
          <FontAwesomeIcon icon={icon}/>
          <span style={{marginLeft: 5}}>{label}</span>
        </span>
      </div>
      <input type="text" className="form-control" id="basic-url" aria-describedby="basic-addon3" value={value}/>
    </div>
  )
export default FieldGroup;