// React hooks
import { useEffect, useLayoutEffect, useRef, useState } from "react";
// Librerías externas
import rough from "roughjs/bundled/rough.esm";
// Constantes
import { MenuItems } from "./constants/menus-items";
// Hooks personalizados
import { useHistory } from "./hooks/useHistory";
// Componentes
import { Labels } from "./components/Labels";
import { Menu } from "./components/ColorLabels";
import { FillColors } from "./components/FillColors";
import { RangeWidth } from "./components/RangeWidth";
import { FillMenu } from "./components/FillMenu";
import { RangeButtons } from "./components/RangeButtons";
import { FontsSelect } from "./components/FontsSlect";
import { OptionsText } from "./components/OptionsText";
// Funciones
import {
  CheckAdjustElement,
  DrawElement,
  onLine,
} from "./functions/Conts.functions";
// Estilos
import "./App.css";
import "./components/Components.css"
import { OptionsTypes } from "./constants/options-svg";

//---------------------------------------------------------------------------------------------------------------
// CONSTANTES
//---------------------------------------------------------------------------------------------------------------
let escala = 1;
const generator = rough.generator();
const width = window.innerWidth;
const height = window.innerHeight;

//---------------------------------------------------------------------------------------------------------------
//FUNCIONES CONSTANTES
//---------------------------------------------------------------------------------------------------------------

/*Esta constante recibe 3 valores como parametros, x, y, element, el ultimo es un objeto. Del objeto se desarma para asi poder tener sus difetentes atributos.
    Uno de los atributos que tiene este objeto seria el atributo TYPE el cual tiene como tipo de dato un string en el cual se describe el tipo de elemento que este 
    posee, para que permita modificar o ejecutar las funciones de manera optima y deacuerdo al tipo de objeto.

    Esta funcion dependiendo del tipo de objeto realizara distintas operaciones matematicas deacuerdo a la geometria de estos (Por ejemplos los rectangulos o los vectores). Apartir de estas operaciones devolvera un valor verdadero o falso dependiendo del resultado de estas. */
const positionWithin = (x, y, element) => {
  //? Desarmo el objeto en las variables pertinentes
  const { x1, y1, x2, y2, type } = element;
  if (type === "rect") {
    const topLeft = locationPoint(x, y, x1, y1, "topl");
    const topRight = locationPoint(x, y, x2, y1, "topr");
    const bottomLeft = locationPoint(x, y, x1, y2, "btnl");
    const bottomRight = locationPoint(x, y, x2, y2, "btnr");
    //? Esto lo que hace es devolver inside si se encuentra x y y dentro de los rangos de valores
    const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;

    return inside || topRight || bottomRight || topLeft || bottomLeft;
  } else if (type === "line") {
    //? Esto devolvera true si el valor obsoluto del offSet es menor a uno (0)
    const on = onLine(x1, y1, x2, y2, x, y);
    const start = locationPoint(x, y, x1, y1, "start");
    const end = locationPoint(x, y, x2, y2, "end");
    return on || start || end;
  } else if (type == "pencil") {
    const betweenPoints = element.points.some((point, index) => {
      const nextPoint = element.points[index + 1];
      if (!nextPoint) return false;
      return (
        onLine(point.x, point.y, nextPoint.x, nextPoint.y, x, y, 5) != null
      );
    });
    const onPath = betweenPoints ? "inside" : null;
    return onPath;
  } else if (type == "text") {
    const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
    return inside;
  } else if (type === "elipse") {
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const a = Math.abs(x2 - x1) / 2;
    const b = Math.abs(y2 - y1) / 2;

    const top = locationPointEllipse(x, y, centerX, centerY, a, b, "start");
    const end = locationPointEllipse(x, y, centerX, centerY, a, b, "end");
    const left = locationPointEllipse(x, y, centerX, centerY, a, b, "left");
    const right = locationPointEllipse(x, y, centerX, centerY, a, b, "right");
    const inside =
      Math.pow(x - centerX, 2) / Math.pow(a, 2) +
        Math.pow(y - centerY, 2) / Math.pow(b, 2) <=
      1
        ? "inside"
        : null;
    return inside || top || right || end || left;
  } else {
    throw new Error("Type of tool not reconizeg");
  }
};

const adjustCoordinates = (element) => {
  const { x1, y1, x2, y2, type } = element;

  if (type == "rect") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else if (type == "line") {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      return { x1, y1, x2, y2 };
    } else {
      return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
  } else if (type == "elipse") {
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    return { centerX, centerY, width, height };
  }
};

const locationPoint = (x1, y1, x2, y2, name) => {
  return Math.abs(x1 - x2) < 6 && Math.abs(y1 - y2) < 6 ? name : null;
};

const locationPointEllipse = (x, y, centerX, centerY, a, b) => {
  const tolerance = 15; // Puedes ajustar este valor según sea necesario
  // Comprueba si el mouse está cerca del punto start (norte)
  if (
    Math.abs(y - centerY + b) < tolerance &&
    Math.abs(x - centerX) < tolerance
  ) {
    return "start";
  }
  // Comprueba si el mouse está cerca del punto end (sur)
  if (
    Math.abs(y - centerY - b) < tolerance &&
    Math.abs(x - centerX) < tolerance
  ) {
    return "end";
  }
  // Comprueba si el mouse está cerca del punto left (oeste)
  if (
    Math.abs(x - centerX + a) < tolerance &&
    Math.abs(y - centerY) < tolerance
  ) {
    return "left";
  }
  // Comprueba si el mouse está cerca del punto right (este)
  if (
    Math.abs(x - centerX - a) < tolerance &&
    Math.abs(y - centerY) < tolerance
  ) {
    return "right";
  }
  // Comprueba si el mouse está cerca del punto inferior derecho o superior izquierdo
  if (
    (Math.abs(x - centerX - a) < tolerance &&
      Math.abs(y - centerY - b) < tolerance) ||
    (Math.abs(x - centerX + a) < tolerance &&
      Math.abs(y - centerY + b) < tolerance)
  ) {
    return "topl";
  }
  // Comprueba si el mouse está cerca del punto inferior izquierdo o superior derecho
  if (
    (Math.abs(x - centerX + a) < tolerance &&
      Math.abs(y - centerY - b) < tolerance) ||
    (Math.abs(x - centerX - a) < tolerance &&
      Math.abs(y - centerY + b) < tolerance)
  ) {
    return "btnl";
  }

  // Si no está cerca de ningún punto cardinal, devuelve null
  return null;
};

const setValueScale = (value) => {
  escala = value;
};

const cursorValue = (position) => {
  switch (position) {
    case "topl":
    case "btnr":
      return "nwse-resize";
    case "topr":
    case "btnl":
      return "nesw-resize";
    case "start":
    case "end":
      return "ns-resize";
    case "left":
    case "right":
      return "ew-resize";
    default:
      return "move";
  }
};

const resizeCoordinates = (x, y, position, coordinates) => {
  const { x1, y1, x2, y2 } = coordinates;

  switch (position) {
    case "topl":
    case "start":
      return { x1: x, y1: y, x2, y2 };
    case "topr":
      return { x1, y1: y, x2: x, y2 };
    case "btnl":
      return { x1: x, y1, x2, y2: y };
    case "end":
    case "btnr":
      return { x1, y1, x2: x, y2: y };
    default:
      return null;
  }
};
// Función para redimensionar la elipse
const elipseResize = (x, y, position, coordinates) => {
  const { x1, y1, x2, y2 } = coordinates;
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;
  let width;
  let height;

  if (position == "start" || position == "end") {
    width = Math.abs(x2 - x1);
    height = Math.abs(y - centerY) * 2;
  } else if (position == "left" || position == "right") {
    width = Math.abs(x - centerX) * 2;
    height = Math.abs(y2 - y1);
  } else if (position == "topl" || position == "btnl") {
    width = Math.abs(x - centerX) * 2;
    height = Math.abs(y - centerY) * 2;
  }

  return { centerX, centerY, width, height };
};

//---------------------------------------------------------------------------------------------------------------
//FUNCIONES
//---------------------------------------------------------------------------------------------------------------
// Esta funcion es mas sensilla de explicar. Recibe 6 parametros, dependiendo del parametro TYPE esta renderizara un elemento.
// Con los parametros obtenidos esta retornara un objeto que aparte de los parametros obtenidos, tambien enviara la renderizacion del elemento
function createElement(id, x1, y1, x2, y2, type, options) {
  let roughtElement;
  if (type === "line") {
    roughtElement = generator.line(x1, y1, x2, y2, options);
    return { id, x1, y1, x2, y2, type, roughtElement, type };
  } else if (type == "rect") {
    roughtElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, options);
    return { id, x1, y1, x2, y2, type, roughtElement, type };
  } else if (type == "elipse") {
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const width = x2 - x1;
    const height = y2 - y1;
    roughtElement = generator.ellipse(centerX, centerY, width, height, options);
    return { id, x1, y1, x2, y2, type, roughtElement, type };
  } else if (type == "pencil") {
    return { id, type, points: [{ x: x1 - 5, y: y1 + 23 / escala }], options };
  } else if (type == "text") {
    return { id, type, x1, y1, x2, y2, text: "", options };
  }
}

//Esta funcion es extraña. Lo que hace es por cada elemento del array ejecuta la funcion isWithin, para encontrar el elemento que tenga las cordenadas en el punto seleccionado
function getElementPosition(x, y, elements) {
  return elements
    .map((element) => ({ ...element, position: positionWithin(x, y, element) }))
    .find((element) => element.position != null);
}

function App() {
  //---------------------------------------------------------------------------------------------------------------
  // USE STATES
  //---------------------------------------------------------------------------------------------------------------

  const [elements, setElements, undo, redo, removeElement, clearAll] =
    useHistory([]);
  const [action, setAction] = useState("none");
  const [types, setTypes] = useState("line");
  const [slectElm, setSlect] = useState(null);
  const [grab, setGrab] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const textAreRef = useRef(null);
  const [className, setClass] = useState("bg-gray-50");
  const [scale, setScale] = useState(1);
  const [scaleOffset, setScaleOffset] = useState({ x: 0, y: 0 });
  const [isErasing, setErasing] = useState(false);
  const [optionsRought, setOptionsRought] = useState({
    fill: "#000",
    fillStyle: "solid",
    stroke: "#000",
    strokeWidth: 1,
    roughness: 0.5,
    hachureGap: 9,
    fillWeight: 1,
    hachureAngle: 45,
  });
  const [optionFreeHand, setOptionsFree] = useState({
    size: 4,
    fillColor: "#000000",
    thinning: 0.1,
    hasFill: true,
    strokeWeight: 1,
    stroke: "#000000",
  });
  const [textOptions, setTextOptions] = useState({
    fontSize: 12,
    fontFamily: "Arial",
    fontDecoration: "", 
    fontColor: "#000000", 
    fontUnderline: false
  });
  const [decorationActive, setDecoration] = useState([])

  //---------------------------------------------------------------------------------------------------------------
  // FUNCIONES CONSTANTES
  //---------------------------------------------------------------------------------------------------------------
  //* Esta funcion esta creada para evitar escribir codigo una y otra vez.
  // Se crea un nuevo elemento por medio del create element, luego se crea una variable para crear una copia de los ELEMENTOS
  // Y por ultimo se remplaza un valor del array que tenga el mismo index que el id que se recibe, es remplazado por lo qe deveulve la funcion
  const updateElement = (id, x1, y1, clientX, clientY, types, options) => {
    setValueScale(scale);
    const copyElements = [...elements];
    const opciones = optionsRought;
    const opcionesFreeHand = optionFreeHand;
    if (types === "line" || types === "rect") {
      copyElements[id] = createElement(
        id,
        x1,
        y1,
        clientX,
        clientY,
        types,
        opciones
      );
    } else if (types === "elipse") {
      copyElements[id] = createElement(
        id,
        x1,
        y1,
        clientX,
        clientY,
        types,
        opciones
      );
    } else if (types === "pencil") {
      copyElements[id].points = [
        ...copyElements[id].points,
        { x: clientX - 7, y: clientY + 23 / scale },
      ];
      copyElements[id].options = {
        size: opcionesFreeHand.size,
        fill: opcionesFreeHand.fillColor,
        hasFill: opcionesFreeHand.hasFill,
        stroke: opcionesFreeHand.stroke,
        strokeWidth: opcionesFreeHand.strokeWeight,
        thinning: opcionesFreeHand.thinning,
      };
    } else if (types === "text") {
      const height = 22;
      const textWidth = document
        .getElementById("board")
        .getContext("2d")
        .measureText(options.text).width;
      copyElements[id] = {
        ...createElement(
          id,
          x1,
          y1,
          x1 + textWidth,
          y1 + height,
          types,
          textOptions
        ),
        text: options.text,
      };
    }
    setElements(copyElements, true);
  };

  const getMouseCoordinates = (event) => {
    const clientX = (event.clientX - pan.x + scaleOffset.x * scale) / scale;
    const clientY = (event.clientY - pan.y + scaleOffset.y * scale) / scale;
    return { clientX, clientY };
  };

  const onZoom = (value) => {
    setScale((prevState) => Math.min(Math.max(prevState + value, 0.1), 3));
  };

  //! Funcion para cuando se clickee el canvas
  const handledMouseDown = (event) => {
    // Variables de las coordenadas del mouse
    const { clientX, clientY } = getMouseCoordinates(event);

    // Switch para detener el funcionamiento dependiendo de las acciones
    switch (action) {
      case "writing":
        return;
      case "erased":
        const element = getElementPosition(
          clientX,
          clientY + 20 / scale,
          elements
        );
        if (element) {
          removeElement(element.id);
        }
        setErasing(true);
        return;
    }
    //Valores de la ubicacion del mouse
    // Cambia el valor del cursor dependiendo de la ubicacion de este ademas de que cambia el valor de grab
    if (types === "selection") {
      const element = getElementPosition(clientX, clientY, elements);
      event.target.style.cursor = element ? "move" : "default";
      if (element) {
        if (element.type == "pencil") {
          const offSetsArrX = element.points.map((point) => clientX - point.x);
          const offSetsArrY = element.points.map((point) => clientY - point.y);
          setSlect({ ...element, offSetsArrX, offSetsArrY });
        } else {
          const offsetX = clientX - element.x1;
          const offsetY = clientY - element.y1;
          setSlect({ ...element, offsetX, offsetY });
        }
        if (element.position == "inside") {
          setAction("moving");
        } else {
          setAction("resizing");
        }
      }
    } else if (action == "grab") {
      if (action == "grab" && types == "none") {
        event.target.style.cursor = "grabbing";
        setGrab(true);
        setClass("bg-gray-50");
      }
      return;
    } else {
      if (!elements) return;
      // Varaibles para el ajuste de los elementos
      const id = elements.length;
      //? Aqui se accede a las propiedades del objeto event por medio de su desustructuracion
      const element = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        types,
        optionFreeHand
      );

      //? Practicamente se hace un forEach en el cual se van agregando elementos dentro del state elements
      //? sin modificar el estado anterior
      setElements((prevState) => [...prevState, element]);
      setSlect(element);
      setAction(types == "text" ? "writing" : "drawing");

      // Funcion para determinar el estilo del mouse
      if (types == "rect" || types == "line" || types == "elipse") {
        const element = getElementPosition(clientX, clientY, elements);
        event.target.style.cursor = element ? "crosshair" : "default";
        setClass("bg-gray-50");
      } else if (types == "text") {
        event.target.style.cursor = "text";
        setClass("bg-gray-50");
      } else if (types == "pencil") {
        event.target.style.cursor = "default";
        setClass("bg-gray-50 cursor-pencil");
      }
    }
  };
  //! Funcion para cuando se mueva atraves del canvas
  const handledMouseMove = (event) => {
    const { clientX, clientY } = getMouseCoordinates(event);
    if (action == "erased" && isErasing === true) {
      if (elements) {
        const element = getElementPosition(clientX, clientY + 20, elements);
        if (element) {
          if (element.position == "inside") removeElement(element.id);
        }
      }
      return;
    } else if (action === "drawing") {
      //? Aqui lo que se hace es obtener el valor previo que fue agregado en la funcion de click en el canvas
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, types, false);
    } else if (action === "moving") {
      if (slectElm.type == "pencil") {
        const newPoints = slectElm.points.map((_, index) => ({
          x: clientX - slectElm.offSetsArrX[index],
          y: clientY - slectElm.offSetsArrY[index],
        }));
        const copyElements = [...elements];
        copyElements[slectElm.id] = {
          ...copyElements[slectElm.id],
          points: newPoints,
        };
        setElements(copyElements, true);
      } else {
        const { id, x1, y1, x2, y2, type, offsetX, offsetY } = slectElm;
        const width = x2 - x1;
        const height = y2 - y1;
        const nextX = clientX - offsetX;
        const nextY = clientY - offsetY;
        const options = type === "text" ? { text: slectElm.text } : {};
        updateElement(
          id,
          nextX,
          nextY,
          nextX + width,
          nextY + height,
          type,
          options,
          false
        );
      }
    } else if (action === "resizing") {
      const { id, type, position, ...coordinates } = slectElm;
      if (type === "elipse") {
        const { centerX, centerY, width, height } = elipseResize(
          clientX,
          clientY,
          position,
          coordinates
        );
        updateElement(
          id,
          centerX - width / 2,
          centerY - height / 2,
          centerX + width / 2,
          centerY + height / 2,
          type,
          false
        );
      } else {
        const { x1, y1, x2, y2 } = resizeCoordinates(
          clientX,
          clientY,
          position,
          coordinates
        );
        updateElement(id, x1, y1, x2, y2, type, false);
      }
    }

    if (types === "selection") {
      const element = getElementPosition(clientX, clientY, elements);
      event.target.style.cursor = element
        ? cursorValue(element.position)
        : "default";
      setClass("bg-gray-50");
    } else if (types === "rect" || types === "line" || types == "elipse") {
      event.target.style.cursor = "crosshair";
      setClass("bg-gray-50");
    } else if (types == "text") {
      event.target.style.cursor = "text";
      setClass("bg-gray-50");
    } else if (types == "pencil") {
      event.target.style.cursor = "default";
      setClass("bg-gray-50 cursor-pencil");
    } else if (action === "grab" && grab === false) {
      event.target.style.cursor = "grab";
      setClass("bg-gray-50");
    } else if (action === "grab" && grab === true) {
      event.target.style.cursor = "grabbing";
      setClass("bg-gray-50");
    }
  };

  //! Funcion para cuando se suelte el click en el canvas canvas
  const handledMouseUp = (event) => {
    const { clientX, clientY } = getMouseCoordinates(event);
    if (slectElm) {
      const index = slectElm.id;
      const { id, type } = elements[index];

      if (
        (action === "drawing" || action === "resizing") &&
        CheckAdjustElement(type)
      ) {
        const { x1, y1, x2, y2 } = adjustCoordinates(elements[index]);
        updateElement(id, x1, y1, x2, y2, type);
      }

      if (
        slectElm.type == "text" &&
        clientX - slectElm.offsetX === slectElm.x1 &&
        clientY - slectElm.offsetY === slectElm.y1
      ) {
        setAction("writing");
        return;
      }
    }

    //? Este if es para cambiar el valor del mouse
    if (types === "selection") {
      const element = getElementPosition(clientX, clientY, elements);
      event.target.style.cursor = element
        ? cursorValue(element.position)
        : "default";
      setClass("bg-gray-50");
    } else if (types === "rect" || types === "line" || types == "elipse") {
      event.target.style.cursor = "crosshair";
      setClass("bg-gray-50");
    } else if (types == "text") {
      event.target.style.cursor = "text";
      setClass("bg-gray-50");
    } else if (types == "pencil" && action !== "grab") {
      event.target.style.cursor = "default";
      setClass("bg-gray-50 cursor-pencil");
    } else if (action == "grab") {
      setGrab(false);
      event.target.style.cursor = "grab";
      setClass("bg-gray-50");
    }

    if (action == "erased") {
      setErasing(false);
      return;
    }

    if (action === "writing") return;
    if (action === "grab") return;
    setAction("none");
    setSlect(null);
  };

  const handleBlur = (event) => {
    const { id, x1, y1, type } = slectElm;
    setAction("none");
    setSlect(null);
    const text = event.target.value;
    updateElement(id, x1, y1, null, null, type, { text: text });
  };

  const handledSaveCanvas = () => {
    let canvas = document.getElementById('board');
    let dataUrl = canvas.toDataURL('image/png');

    let link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'imagen.png';
    link.click();
  }

  //---------------------------------------------------------------------------------------------------------------
  // USE EFFECTS
  //---------------------------------------------------------------------------------------------------------------
  useLayoutEffect(() => {
    const board = document.getElementById("board");
    const ctx = board.getContext("2d");
    //* Declaracion del tablero por medio de la API de Rought
    const roughtBoard = rough.canvas(document.getElementById("board"));
    ctx.clearRect(0, 0, board.width, board.height);

    const widthScale = board.width * scale;
    const heightScale = board.height * scale;
    const offSetX = (widthScale - board.width) / 2;
    const offSetY = (heightScale - board.height) / 2;
    setScaleOffset({ x: offSetX, y: offSetY });

    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(-offSetX + pan.x / scale, -offSetY + pan.y / scale);

    if (elements)
      elements.forEach((element) => {
        if (action === "writing" && slectElm.id == element.id) return;
        DrawElement(roughtBoard, element, ctx);
      });

    ctx.restore();
  }, [elements, action, slectElm, pan, scale]);

  useEffect(() => {
    const undoRedoFunction = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Z") {
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    document.addEventListener("keydown", undoRedoFunction);
    return () => {
      document.removeEventListener("keydown", undoRedoFunction);
    };
  }, [undo, redo]);

  useEffect(() => {
    const textArea = textAreRef.current;
    if (action === "writing" && textArea) {
      setTimeout(() => {
        textArea.value = slectElm.text;
        textArea.focus();
      }, 0);
    }
  }, [slectElm, action, elements]);

  useEffect(() => {
    const movePan = (event) => {
      if (grab && action === "grab") {
        setPan((prevState) => ({
          x: prevState.x + event.movementX,
          y: prevState.y + event.movementY,
        }));
      }
    };

    document.addEventListener("mousemove", movePan);
    return () => {
      document.removeEventListener("mousemove", movePan);
    };
  }, [grab, action]);

  //---------------------------------------------------------------------------------------------------------------
  // MANEJO DE LA INFORMACION DE LOS COMPONENTES HIJOS
  //---------------------------------------------------------------------------------------------------------------

  // Funciones relacionadas con FreeHand
  const setFillColorFree = (data) => {
    setOptionsFree((prevOptions) => ({ ...prevOptions, fillColor: data }));
  };

  const setStrokeFree = (data) => {
    setOptionsFree((prevOptions) => ({ ...prevOptions, stroke: data }));
  };

  const setThinningValue = (data) => {
    setOptionsFree((prevOptions) => ({ ...prevOptions, thinning: data }));
  };

  const setWidhtFree = (data) => {
    setOptionsFree((prevOptions) => ({ ...prevOptions, size: data }));
  };

  const setStrokeWeigth = (data) => {
    setOptionsFree((prevOptions) => ({ ...prevOptions, strokeWeight: data }));
  };

  // Funciones relacionadas con Rough
  const setStrokeColorRough = (data) => {
    setOptionsRought((prevOptions) => ({ ...prevOptions, stroke: data }));
  };

  const setRoughtValue = (data) => {
    setOptionsRought((prevOptions) => ({ ...prevOptions, roughness: data }));
  };

  const setStrokeWidht = (data) => {
    setOptionsRought((prevOptions) => ({ ...prevOptions, strokeWidth: data }));
  };

  const SetFillColor = (data) => {
    setOptionsRought((prevOptions) => ({ ...prevOptions, fill: data }));
  };

  const SetFillType = (data) => {
    setOptionsRought((prevOptions) => ({ ...prevOptions, fillStyle: data }));
  };

  const SetFillWeighit = (data) => {
    setOptionsRought((prevOptions) => ({ ...prevOptions, fillWeight: data }));
  };

  const SetAnchureGap = (data) => {
    setOptionsRought((prevOptions) => ({ ...prevOptions, hachureGap: data }));
  };

  const SetAnchureAngle = (data) => {
    setOptionsRought((prevOptions) => ({ ...prevOptions, hachureAngle: data }));
  };

  // Funciones para el texto

  const setFontSize = (data) => {
    setTextOptions((prevOptions) => ({ ...prevOptions, fontSize: data }));
  };

  const setFontFamily = (data) => {
    const font = data.value
    setTextOptions((prevOptions) => ({ ...prevOptions, fontFamily: font }));
  }

  const setTextDecoration = (data) => {
    setDecoration(data)
    let decoration = data.toString().replace(',', ' ')
    let underline = false
    if (decoration.includes("underline")){
      underline = true 
      decoration = data.toString().replace(',', ' ').replace('underline', '').replace(',', ' ')
    }
    setTextOptions((prevOptions) => ({ ...prevOptions, fontDecoration: decoration, fontUnderline: underline }));
  }

  const setTextColor = (data) => {
    setTextOptions((prevOptions) => ({ ...prevOptions, fontColor: data }));
  }

  return (
    <div>

      <div className="fixed left-3 top-3">
        <button className="flex justify-center items-center text-black font-gloria
          border border-1 border-slate-700 px-3 py-2 rounded-md sombra-input hover:bg-slate-500 hover:text-white 
          duration-150"
          onClick={handledSaveCanvas}>
          <p>Save canvas</p>
          {OptionsTypes.save}
        </button>
      </div>

      <div className="fixed left-[40%] my-3 py-2 px-4 border border-1 border-slate-300 rounded-md sombra">
        <ul className=" gap-2 flex">
          <li>
            <input
              type="radio"
              id="grab"
              name="Grab-pan"
              className="hidden peer"
              checked={action === "grab"}
              onChange={() => {
                setAction("grab");
                setClass("bg-gray-50");
                setTypes("none");
              }}
            />
            <Labels For={"grab"}>{MenuItems.grab}</Labels>
          </li>
          <li>
            <input
              type="radio"
              id="selection"
              name="Selection"
              className="hidden peer"
              checked={types === "selection"}
              onChange={() => {
                setTypes("selection");
                setClass("bg-gray-50");
                setAction("none");
              }}
            />
            <Labels For={"selection"}>{MenuItems.selection}</Labels>
          </li>
          <li>
            <input
              type="radio"
              id="line"
              name="Line"
              className="hidden peer"
              checked={types === "line"}
              onChange={() => {
                setTypes("line");
                setAction("none");
                setClass("bg-gray-50");
              }}
            />
            <Labels For={"line"}>{MenuItems.line}</Labels>
          </li>
          <li>
            <input
              type="radio"
              id="rectangle"
              name="Rectangle"
              className="hidden peer"
              checked={types === "rect"}
              onChange={() => {
                setTypes("rect");
                setAction("none");
                setClass("bg-gray-50");
              }}
            />
            <Labels For={"rectangle"}>{MenuItems.square}</Labels>
          </li>
          <li>
            <input
              type="radio"
              id="elipse"
              name="elipse"
              className="hidden peer"
              checked={types === "elipse"}
              onChange={() => {
                setTypes("elipse");
                setAction("none");
                setClass("bg-gray-50");
              }}
            />
            <Labels For={"elipse"}>{MenuItems.elipse}</Labels>
          </li>
          <li>
            <input
              type="radio"
              id="pencil"
              name="Pencil"
              className="hidden peer"
              checked={types === "pencil"}
              onChange={() => {
                setTypes("pencil");
                setClass("bg-gray-50 cursor-pencil");
                setAction("none");
              }}
            />
            <Labels For={"pencil"}>{MenuItems.pencil}</Labels>
          </li>
          <li>
            <input
              type="radio"
              id="text"
              name="Text"
              className="hidden peer"
              checked={types === "text"}
              onChange={() => {
                setTypes("text");
                setAction("none");
                setClass("bg-gray-50");
              }}
            />
            <Labels For={"text"}>{MenuItems.text}</Labels>
          </li>
          <li>
            <input
              type="radio"
              id="erased"
              name="Erased"
              className="hidden peer"
              checked={action === "erased"}
              onChange={() => {
                setTypes("none");
                setAction("erased");
                setClass("bg-gray-50 cursor-erased");
              }}
            />
            <Labels For={"erased"}>{MenuItems.erase}</Labels>
          </li>
        </ul>
      </div>

      <div className="fixed bottom-3 right-3 font-gloria">
        <div className="flex justify-between gap-3">
          <div className="bg-[#f0e9fa8f] rounded-md text-gray-800 sombra">
            <ul className="flex h-full">
              <li>
                <button
                  className="inline-flex items-center py-2 px-3 h-full hover:bg-[#70707036] hover:rounded-l-md duration-150 font-bold"
                  onClick={() => {
                    clearAll();
                  }}
                >
                  {MenuItems.clear} Clear Board
                </button>
              </li>
            </ul>
          </div>
          <div className="bg-[#f0e9fa8f] rounded-md text-gray-800 sombra">
            <ul className="flex h-full">
              <li>
                <button
                  className="inline-flex items-center py-2 px-3 h-full hover:bg-[#70707036] hover:rounded-l-md duration-150"
                  onClick={() => {
                    onZoom(-0.1);
                  }}
                >
                  {MenuItems.recede}
                </button>
              </li>
              <li
                className="font-bold my-auto cursor-pointer py-2 px-3 h-full hover:bg-[#70707036] duration-150"
                onClick={() => setScale(1)}
              >
                {(scale * 100).toFixed(0)}%
              </li>
              <li>
                <button
                  className="inline-flex items-center py-2 px-3 h-full hover:bg-[#70707036] hover:rounded-r-md duration-150"
                  onClick={() => {
                    onZoom(0.1);
                  }}
                >
                  {MenuItems.zoom}
                </button>
              </li>
            </ul>
          </div>

          <div className="bg-[#f0e9fa8f] rounded-md text-gray-800 sombra">
            <ul className="flex h-full">
              <li>
                <button
                  className="inline-flex items-center py-2 px-3 h-full hover:bg-[#70707036] hover:rounded-l-md"
                  onClick={undo}
                >
                  {MenuItems.undo}
                </button>
              </li>

              <li>
                <button
                  className="inline-flex items-center py-2 px-3 h-full hover:bg-[#70707036] hover:rounded-r-md"
                  onClick={redo}
                >
                  {MenuItems.redo}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {action === "writing" ? (
        <textarea
          id="text-area"
          ref={textAreRef}
          onBlur={handleBlur}
          style={{
            position: "fixed",
            top: (slectElm.y1 - scaleOffset.y) * scale + pan.y - 2,
            left: (slectElm.x1 - scaleOffset.x) * scale + pan.x,
            font: `${textOptions.fontSize * scale}px ${textOptions.fontFamily}`,
            color: textOptions.fontColor,
            margin: 0,
            padding: 0,
            border: 0,
            outline: 0,
            resize: "auto",
            overflow: "hidden",
            whiteSpace: "pre",
            background: "transparent",
            resize: "none",
            zIndex: 2,
            fontWeight: textOptions.fontDecoration.includes('bold') ? "bold" : 'normal',
            fontStyle: textOptions.fontDecoration.includes('italic') ? "italic" : 'normal',
            textDecoration:  textOptions.fontUnderline ? "underline" : ""
          }}
        ></textarea>
      ) : null}

      {(types === "line" || types === "rect" || types === "elipse") && (
        <div className="fixed top-[20%] left-2 w-[15%] border border-1 border-slate-500 rounded-md fuente-especial">
          <div className="stroke p-2">
            <p className="text-black">Stroke color</p>
            <div className="w-full mt-1 flex justify-center">
              <Menu
                ColorStroke={setStrokeColorRough}
                ColorActive={optionsRought.stroke}
              />
            </div>
            <hr />
            <p className=" text-black">Stroke Options</p>
            <ul>
              <li>
                <div>
                  <p className="text-sm text-[#383838]">Roughness</p>
                  <div className="min-h-[25px] my-2">
                    <RangeButtons
                      Range={4}
                      SendRoungh={setRoughtValue}
                      RoughnessActive={optionsRought.roughness}
                    ></RangeButtons>
                  </div>
                </div>
              </li>
              <hr />
              <li>
                <div>
                  <p className="text-sm text-[#383838]">Stroke width</p>
                  <div>
                    <div className="flex justify-around">
                      <div className="w-5/6">
                        <RangeWidth
                          SendWidth={setStrokeWidht}
                          WidthActive={optionsRought.strokeWidth}
                          Range={10.5}
                        ></RangeWidth>
                      </div>
                      <div className="w-1/6">
                        <p className="text-black text-center underline">
                          {optionsRought.strokeWidth}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
            <hr />
            {types !== "line" ? (
              <>
                <p className="text-black">Fill options</p>
                <ul>
                  <li>
                    <div>
                      <p className="text-sm font-bold text-[#383838]">
                        Fill color
                      </p>
                      <div className="min-h-[25px] my-2 flex justify-center" >
                        <FillColors
                          ColorFill={SetFillColor}
                          FillActive={optionsRought.fill}
                        >
                        </FillColors>
                      </div>
                    </div>
                  </li>
                  <hr />
                  <li>
                    <div>
                      <p className="text-sm font-bold text-[#383838]">
                        Type of fill
                      </p>
                      <div>
                        <FillMenu
                          SendFill={SetFillType}
                          TypeActive={optionsRought.fillStyle}
                        ></FillMenu>
                      </div>
                    </div>
                  </li>
                  {optionsRought.fillStyle !== "solid" ? (
                    <>
                      <li>
                        <div>
                          <p className="text-sm font-bold text-[#383838]">
                            Fill weight
                          </p>
                          <div className="min-h-[25px] my-2">
                            <RangeButtons
                              Range={5}
                              SendRoungh={SetFillWeighit}
                              RoughnessActive={optionsRought.fillWeight}
                            ></RangeButtons>
                          </div>
                        </div>
                      </li>
                      <li>
                        <div>
                          <p className="text-sm font-bold text-[#383838]">
                            Fill separation
                          </p>
                          <div>
                            <div className="flex justify-around">
                              <div className="w-5/6">
                                <RangeWidth
                                  Range={51}
                                  WidthActive={optionsRought.hachureGap}
                                  SendWidth={SetAnchureGap}
                                ></RangeWidth>
                              </div>
                              <div className="w-1/6">
                                <p className="text-black text-center underline">
                                  {optionsRought.hachureGap}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                      <li>
                        <p className="text-sm font-bold text-[#383838]">
                          Angle of the fill
                        </p>
                        <div>
                          <RangeButtons
                            Range={180}
                            StepsValue={1}
                            RoughnessActive={optionsRought.hachureAngle}
                            SendRoungh={SetAnchureAngle}
                          ></RangeButtons>
                        </div>
                      </li>
                    </>
                  ) : null}
                </ul>
              </>
            ) : null}
          </div>
        </div>
      )}

      {types === "pencil" ? (
        <>
          <div className="fixed top-[20%] left-2 w-[15%] border border-1 border-slate-500 rounded-md fuente-especial">
            <div className="stroke p-2">
              <p className=" text-black">Stroke Options</p>
              <ul>
                <li>
                  <div>
                    <p className="text-sm text-[#383838]">Thinning</p>
                    <div className="min-h-[25px] my-2">
                      <RangeButtons
                        Range={10}
                        SendRoungh={setThinningValue}
                        RoughnessActive={optionFreeHand.thinning}
                      ></RangeButtons>
                    </div>
                  </div>
                </li>
                <hr />
                <li>
                  <div>
                    <p className="text-sm text-[#383838]">Size</p>
                    <div className="flex justify-between">
                      <div className="w-4/5">
                        <RangeWidth
                          SendWidth={setWidhtFree}
                          WidthActive={optionFreeHand.size}
                          Range={50.5}
                        ></RangeWidth>
                      </div>
                      <p className="text-black text-center underline w-1/5 ">
                        {optionFreeHand.size}
                      </p>
                    </div>
                  </div>
                </li>
                <li>
                  <div>
                    <div className="flex gap-10">
                      <p className="font-bold text-[#383838]">Fill:</p>
                      <ul className="flex gap-8">
                        <li>
                          <input
                            type="radio"
                            id="yes"
                            className="hidden peer"
                            onChange={() => {
                              setOptionsFree({
                                ...optionFreeHand,
                                hasFill: true,
                              });
                            }}
                            checked={optionFreeHand.hasFill === true}
                          />
                          <label
                            htmlFor="yes"
                            className="text-gray-700 text-sm cursor-pointer peer-checked:text-base 
                            peer-checked:underline duration-100"
                          >
                            Yes
                          </label>
                        </li>
                        <li>
                          <input
                            type="radio"
                            id="no-fill"
                            className="hidden peer"
                            onChange={() => {
                              setOptionsFree({
                                ...optionFreeHand,
                                hasFill: false,
                              });
                            }}
                            checked={optionFreeHand.hasFill === false}
                          />
                          <label
                            htmlFor="no-fill"
                            className="text-gray-700 text-sm cursor-pointer peer-checked:text-base 
                            peer-checked:underline duration-100"
                          >
                            No
                          </label>
                        </li>
                      </ul>
                    </div>
                    {optionFreeHand.hasFill === true ? (
                      <>
                        <p className="text-black">Fill color</p>
                        <div className="w-full mt-1">
                          <FillColors
                            ColorFill={setFillColorFree}
                            FillActive={optionFreeHand.fillColor}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-[#383838]">
                            Border weight
                          </p>
                          <div className="flex justify-between">
                            <div className="w-4/5">
                              <RangeWidth
                                SendWidth={setStrokeWeigth}
                                WidthActive={optionFreeHand.strokeWeight}
                                Range={40.5}
                              ></RangeWidth>
                            </div>
                            <p className="text-black text-center underline w-1/5 ">
                              {optionFreeHand.strokeWeight}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </li>
                {optionFreeHand.strokeWeight >= 0.5 &&
                !optionFreeHand.hasFill ? (
                  <>
                    <p className="text-black text-sm">Border color</p>
                    <div className="w-full mt-1 flex justify-center">
                      <Menu
                        ColorStroke={setStrokeFree}
                        ColorActive={optionFreeHand.stroke}
                      />
                    </div>
                  </>
                ) : null}
              </ul>
              <hr />
            </div>
          </div>
        </>
      ) : null}

      {types === "text" ? (
        <>
          <div className="fixed top-[20%] left-2 w-[15%] border border-1 border-slate-500 rounded-md fuente-especial">
            <div className="stroke p-2">
              <p className="text-black">Text Options</p>
              <ul>
                <li>
                  <p className="text-gray-700 text-sm">Font size</p>
                  <div>
                    <RangeButtons
                      Range={32}
                      RoughnessActive={textOptions.fontSize}
                      SendRoungh={setFontSize}
                      StepsValue={1}
                      MinRange={1}
                    />
                  </div>
                </li>
                <li>
                  <p className="text-gray-700 text-sm">Font family</p>
                  <FontsSelect
                    FontFamily={setFontFamily}
                    FontFamilyActive={textOptions.fontFamily}
                   />
                </li>
                <li>
                  { 
                    textOptions.fontFamily !== "Gloria Hallelujah, cursive" && textOptions.fontFamily !== "Pacifico, cursive" ?
                    ( 
                      <>
                        <p className="text-gray-700 text-sm">Text style</p>
                        <OptionsText Decoration={setTextDecoration} DecorationActive={decorationActive} />
                      </> 
                    ) : null
                  }
                </li>
                <li>
                  <p className="text-gray-700 text-sm">Text color</p>
                  <div className="flex justify-center">
                    <Menu ColorActive={textOptions.fontColor} ColorStroke={setTextColor} > </Menu>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : null}
      <canvas
        id="board"
        width={width}
        height={height}
        className={className}
        onMouseDown={handledMouseDown}
        onMouseMove={handledMouseMove}
        onMouseUp={handledMouseUp}
      ></canvas>
    </div>
  );
}

export default App;
