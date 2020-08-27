import {get} from "lodash";

const routes = {
    "products": {
        title: "Inventario",
        path: "/products"
    },
    "[productId]": {
        title: "Información de Producto",
        path: "/products/[productId]"
    },
    "proforma": {
        title: "Nueva Proforma",
        path: "/proforma"
    },
    "supplies": {
        title: "Abastecimientos",
        path: "/supplies"
    },
    "[supplyId]": {
        title: "Información de Abastecimiento",
        path: "/supplies/[supplyId]"
    },
    "proformas": {
        title: "Historial de Proformas",
        path: "/proformas"
    },
    "[proformaId]": {
        title: "Información de proforma",
        path: "/proformas/[proformaId]"
    },
}


const recursiveStepperBuild = (path, currentStepper = []) => {
    const title = get(routes[path[0]], "title", "");
    const url = get(routes[path[0]], "path", "");

    if(path.length === 1) return [
        ...currentStepper, 
        <h2>&nbsp;{title}</h2>
    ];

    const remainingPath = path
        .filter((route, index) => index !== 0);

    return recursiveStepperBuild(remainingPath, [
        ...currentStepper,
        <a href={url}>
            <h2 style={{fontWeight: "bold"}}>
                {title}&nbsp;/
            </h2>
        </a>
    ]);
}

export const getRouteStepper = (path) => {
    const splittedPath = path
        .split("/")
        .filter((path, index) => index !== 0);

        
    
    const stepper = recursiveStepperBuild(splittedPath);

    return <div style={{display: "flex"}}>
        {
            stepper
                .map(step => step)
        }
    </div>
}