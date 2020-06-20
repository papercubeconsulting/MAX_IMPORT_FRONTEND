import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import {Button, Container, Grid, Icon, Select} from "../../components";
import {Input, notification, Modal, Form,  Alert } from "antd";
import {resetPassword} from "../../providers";
import styled from "styled-components";
import {urlQueryParams} from "../../util";
import {get} from "lodash";
import {AddProduct} from "../../components/products";
import {ReadProductCode} from "../../components/products/productBoxes/ReadProductCode";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import { UserOutlined, LockOutlined } from '@ant-design/icons';

export const ResetPassword = props => {
    const router = useRouter();
    const {email, token} = props;
      
    const onFinish = async values => {
        try {
          const response = await resetPassword({
            token,
            email,
            password: values.password,
          });  
          notification.success({
            message: `Éxito`,
            description: 'Inicie sesión con su nueva contraseña',
          });
          router.push('/');
        } catch (error) {
          notification.error({
            message: "Error al recuperar contraseña",
            description: error.message,
          });
        }
    };
    
    return <>
        <Container 
            flexDirection="column"
            justifyContent="center"
            textAlign="center"
            alignItems="center"
            padding="2rem 0">
                <h3>
                    Por favor ingrese los datos para cambiar su contraseña
                </h3>
                
                <h3>
                    Usuario: {email}
                </h3>

                <FormContainer>

                  <Form
                      name="login"
                      onFinish={onFinish}
                  >
                      <Form.Item
                          name="password"
                          hasFeedback
                          rules={[{ min:8, required: true, message: 'Por favor ingrese una contraseña de al menos 8 caracteres' }]}
                      >
                          <Input
                          prefix={<LockOutlined className="site-form-item-icon" />}
                          type="password"
                          placeholder="Contraseña"
                          />
                      </Form.Item>
                      
                      <Form.Item
                        name="confirm"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                          {
                            required: true,
                            message: 'Confirme su contraseña',
                          },
                          ({ getFieldValue }) => ({
                            validator(rule, value) {
                              if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject('Las contraseñas no coinciden');
                            },
                          }),
                        ]}
                      >
                        <Input
                          prefix={<LockOutlined className="site-form-item-icon" />}
                          type="password"
                          placeholder="Confirme contraseña"
                        />
                      </Form.Item>

                      <Form.Item>
                          <Button type="primary" htmlType="submit">
                            Confirmar
                          </Button>
                      </Form.Item>
                  </Form>
                </FormContainer>
        </Container>
    </>
};

const FormContainer = styled.div`
    width: 20%;
`;