import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {Container, Grid, Icon, Select} from "../../components";
import {Input, notification} from "antd";
import {faCalendarAlt} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import {clientDateFormat} from "../../util";
import {getElements, getFamilies, getModels, getSubfamilies} from "../../providers";

export default ({setPageTitle}) => {
    setPageTitle("Inventario");

    const [families, setFamilies] = useState([]);
    const [subfamilies, setSubfamilies] = useState([]);
    const [elements, setElements] = useState([]);
    const [models, setModels] = useState([]);

    const [page, setPage] = useState(null);
    const [stock, setStock] = useState(null);
    const [code, setCode] = useState(null);
    const [familyId, setFamilyId] = useState(null);
    const [subfamilyId, setSubfamilyId] = useState(null);
    const [elementId, setElementId] = useState(null);
    const [modelId, setModelId] = useState(null);
    const [updatingParams, setUpdatingParams] = useState(false);

    const router = useRouter();
    const queryParams = router.query;

    useEffect(() => {
        !updatingParams && Object.keys(router.query).length && urlToState();
    }, [queryParams]);

    useEffect(() => {
        if (page || stock || code || familyId || subfamilyId || elementId || modelId) stateToUrl();
    }, [page, stock, code, familyId, subfamilyId, elementId, modelId]);

    useEffect(() => {
        const initialize = async () => {
            try {
                const _families = await getFamilies();

                setFamilies(_families);
            } catch (error) {
                notification.error({
                    message: "Error en el servidor",
                    description: error.message
                })
            }
        };

        initialize();
    }, []);

    useEffect(() => {
        const fetchSubfamilies = async () => {
            setSubfamilies([]);
            setSubfamilyId(null);

            if (familyId) {
                const _subfamilies = await getSubfamilies(familyId);
                setSubfamilies(_subfamilies)
            }
        };

        fetchSubfamilies();
    }, [familyId]);

    useEffect(() => {
        const fetchElements = async () => {
            setElements([]);
            setElementId(null);

            if (subfamilyId) {
                const _elements = await getElements(subfamilyId);
                setElements(_elements)
            }
        };

        fetchElements();
    }, [subfamilyId]);

    useEffect(() => {
        const fetchModels = async () => {
            setModels([]);
            setModelId(null);

            if (elementId) {
                const _models = await getModels(elementId);
                setModels(_models)
            }
        };

        fetchModels();
    }, [elementId]);

    const urlToState = () => {
        console.log("urlToState", updatingParams);
        setPage(Number.parseInt(queryParams.page) || null);
        setStock(queryParams.stock || null);
        setCode(Number.parseInt(queryParams.code) || null);
        setFamilyId(Number.parseInt(queryParams.familyId) || null);
        setSubfamilyId(Number.parseInt(queryParams.subfamilyId) || null);
        setElementId(Number.parseInt(queryParams.elementId) || null);
        setModelId(Number.parseInt(queryParams.modelId) || null);
    };

    const stateToUrl = async () => {
        setUpdatingParams(true);
        const params = {};

        page && (params.page = page);
        stock && (params.stock = stock);
        code && (params.code = code);
        familyId && (params.familyId = familyId);
        familyId && subfamilyId && (params.subfamilyId = subfamilyId);
        subfamilyId && elementId && (params.elementId = elementId);
        elementId && modelId && (params.modelId = modelId);

        if (Object.keys(params).length) {
            await router.push(`/products?${urlQueryParams(params)}`);
        } else {
            await router.push("/products");
        }
        setUpdatingParams(false);
    };

    const urlQueryParams = params => Object.keys(params)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(params[key]))
        .join("&");

    const selectOptions = collection => {
        const options = collection.map(document => ({
                value: document.id,
                label: document.name
            })
        );

        const defaultOption = {
            value: null,
            label: "Todos"
        };

        return [defaultOption, ...options];
    };


    return (
        <Container height="30%">
            <Grid gridTemplateColumns="repeat(4, 1fr)"
                  gridTemplateRows="repeat(2, 1fr)"
                  gridGap="2rem">
                <Input value={moment().subtract(7, "days").format(clientDateFormat)}
                       addonBefore={
                           <>
                               <Icon icon={faCalendarAlt}/>
                               Fecha
                           </>
                       }
                       disabled/>
                <Select value={stock}
                        onChange={value => setStock(value)}
                        label="Stock"
                        options={[
                            {
                                value: null,
                                label: "Todos"
                            },
                            {
                                value: "yes",
                                label: "Sí"
                            }
                        ]}/>
                <Input value={code}
                       onChange={event => setCode(event.target.value)}
                       addonBefore="Código de inventario"/>
                <Select value={familyId}
                        onChange={value => setFamilyId(value)}
                        label="Familia"
                        options={selectOptions(families)}/>
                <Select value={subfamilyId}
                        onChange={value => setSubfamilyId(value)}
                        label="Sub-Familia"
                        options={selectOptions(subfamilies)}/>
                <Select value={elementId}
                        onChange={value => setElementId(value)}
                        label="Elemento"
                        options={selectOptions(elements)}/>
                <Select value={modelId}
                        onChange={value => setModelId(value)}
                        label="Modelo"
                        options={selectOptions(models)}/>
            </Grid>
        </Container>
    )
}
