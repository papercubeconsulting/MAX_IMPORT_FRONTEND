// import React, {useContext, useState, useEffect, useRef} from 'react';
// import {Table, Input, Button, Popconfirm, Form} from 'antd';
// import {get} from "lodash";
// import {Icon} from "../Icon";
// import {faTrash} from "@fortawesome/free-solid-svg-icons";
//
// const EditableContext = React.createContext();
//
// const EditableRow = ({index, ...props}) => {
//     const [form] = Form.useForm();
//     return (
//         <Form form={form}
//               component={false}>
//             <EditableContext.Provider value={form}>
//                 <tr {...props} />
//             </EditableContext.Provider>
//         </Form>
//     );
// };
//
// const EditableCell = ({
//                           title,
//                           editable,
//                           children,
//                           dataIndex,
//                           record,
//                           handleSave,
//                           ...restProps
//                       }) => {
//     const [editing, setEditing] = useState(false);
//     const inputRef = useRef();
//     const form = useContext(EditableContext);
//     useEffect(() => {
//         if (editing) {
//             inputRef.current.focus();
//         }
//     }, [editing]);
//
//     const toggleEdit = () => {
//         setEditing(!editing);
//         form.setFieldsValue({
//             [dataIndex]: record[dataIndex],
//         });
//     };
//
//     const save = async e => {
//         try {
//             const values = await form.validateFields();
//             toggleEdit();
//             handleSave({...record, ...values});
//         } catch (errInfo) {
//             console.log('Save failed:', errInfo);
//         }
//     };
//
//     let childNode = children;
//
//     if (editable) {
//         childNode = editing ? (
//             <Form.Item
//                 style={{
//                     margin: 0,
//                 }}
//                 name={dataIndex}
//                 rules={[
//                     {
//                         required: true,
//                         message: `${title} is required.`,
//                     },
//                 ]}
//             >
//                 <Input ref={inputRef}
//                        onPressEnter={save}
//                        onBlur={save}/>
//             </Form.Item>
//         ) : (
//             <div
//                 className="editable-cell-value-wrap"
//                 style={{
//                     paddingRight: 24,
//                 }}
//                 onClick={toggleEdit}
//             >
//                 {children}
//             </div>
//         );
//     }
//
//     return <td {...restProps}>{childNode}</td>;
// };
//
// export const EditableTable = props => {
//     const [columns, setColumns] = useState([]);
//
//     useEffect(() => {
//         if (props.columns) {
//             const _columns = columns.map(column => {
//                 if (!column.editable) return column;
//
//                 return {
//                     ...column,
//                     onCell: record => ({
//                         record,
//                         editable: column.editable,
//                         dataIndex: column.dataIndex,
//                         title: column.title,
//                         handleSave: props.onSave,
//                     }),
//                 }
//             });
//
//             const deleteButton = {
//                 dataIndex: "id",
//                 render: (id, record, index) => (
//                     <Button onClick={() => props.onDelete(index)}
//                             type="primary">
//                         <Icon icon={faTrash}
//                               marginRight="0px"/>
//                     </Button>
//                 )
//             };
//
//             if (props.onDelete) setColumns([deleteButton, _columns]);
//
//             setColumns(_columns);
//         }
//     }, [props.columns, props.onDelete]);
// };
//
// class EditableTable extends React.Component {
//     handleAdd = () => {
//         const {count, dataSource} = this.state;
//         const newData = {
//             key: count,
//             name: `Edward King ${count}`,
//             age: 32,
//             address: `London, Park Lane no. ${count}`,
//         };
//         this.setState({
//             dataSource: [...dataSource, newData],
//             count: count + 1,
//         });
//     };
//
//     handleSave = row => {
//         const newData = [...this.state.dataSource];
//         const index = newData.findIndex(item => row.key === item.key);
//         const item = newData[index];
//         newData.splice(index, 1, {...item, ...row});
//         this.setState({
//             dataSource: newData,
//         });
//     };
//
//     render() {
//         const {dataSource} = this.state;
//         const components = {
//             body: {
//                 row: EditableRow,
//                 cell: EditableCell,
//             },
//         };
//         return (
//             <div>
//                 <Button
//                     onClick={this.handleAdd}
//                     type="primary"
//                     style={{
//                         marginBottom: 16,
//                     }}
//                 >
//                     Add a row
//                 </Button>
//                 <Table
//                     components={components}
//                     rowClassName={() => 'editable-row'}
//                     bordered
//                     dataSource={dataSource}
//                     columns={columns}
//                 />
//             </div>
//         );
//     }
// }
