import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import {Button, Container} from "../../components";
import {Input, notification, Modal, Form} from "antd";
import {login, forgotPassword} from "../../providers";
import { UserOutlined, LockOutlined } from '@ant-design/icons';

export const Login = props => {
    const router = useRouter();
    const [email, setEmail] = useState(null)

    const [isModalResetPasswordVisible, setIsModalResetPasswordVisible] = useState(false)
        
    const onFinish = async values => {
        try {
            const response = await login(values);  
            // TODO: Setear usuario y token en funcion de la respuesta
            notification.success({
                message: `Bienvenido`,
                description: response.user.name,
            });
            // TODO: Validar si es la forma correcta de redreccionar a home
            router.push('/'); 
        } catch (error) {
            notification.error({
                message: "Error al identificarse",
                description: error.message,
            });
        }
    };
    
    const submitForgotPassword = async () =>{
        try {
            const response = await forgotPassword({email});  
            notification.success({
                message: `Revise su bandeja de entrada`,
                description: `Se ha enviado un correo a ${email}`,
            });
            setIsModalResetPasswordVisible(false)
        } catch (error) {
            notification.error({
                message: "Error al identificarse",
                description: error.message,
            });
        }        
      }
    return <>
        {
            isModalResetPasswordVisible &&            
            <Modal visible={isModalResetPasswordVisible}
                onOk={() => submitForgotPassword()}
                onCancel={() => setIsModalResetPasswordVisible(false)}
                width="40%"
                title="Recuperar contraseña">
                Enviaremos un correo con un link para que pueda cambiar su contraseña al email que ingresó en la casilla correo: {email}
            </Modal>
        }
        <Container 
            flexDirection="column"
            justifyContent="center"
            textAlign="center"
            alignItems="center"
            padding="2rem 0">
                <h3>
                    Bienvenido, por favor ingrese su usuario y contraseña
                </h3>

                <Form
                    name="login"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="email"
                        rules={[{ type: 'email', required: true, message: 'Por favor ingrese un correo válido' }]}
                    >
                        <Input 
                            prefix={
                                <UserOutlined 
                                className="site-form-item-icon" />
                            } 
                            placeholder="Correo electrónico"
                            onChange={event => setEmail(event.target.value)}
                            />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Por favor ingrese su contraseña' }]}
                    >
                        <Input
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        type="password"
                        placeholder="Password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="link" onClick={()=>setIsModalResetPasswordVisible(true)}>
                        Olvidé contraseña
                        </Button>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                        Ingresar
                        </Button>
                    </Form.Item>
                </Form>
        </Container>
    </>
};