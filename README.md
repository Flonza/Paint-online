[!NOTE]
Este proyecto esta incompleto

# Paint app with Rough.JS

<h2>
    Introducción
</h2>
    <p> Hola, me llamo Flonza. Este es uno de los tantos proyectos para mi practica y prueba de mis habilidades en los distintos lenguajes de programacion y frameworks de esta gran area de trabajo. <br>El lenguaje seleccionado para realizar este projecto es ReactJS ademas de el optimizador de clases TailwindCSS y RoughJS como API para la creacion de los dibujos. En el projecto hago una replica del famoso software de dibujo excalidraw. </p>

<hr>

<h2>Funcionamiendo de las diversas funciones encontradas dentro del App.jsx</h2>

``Constante DISTANCE.``
    Esta constante es extraña, lo que hace es que dentro del POW se elevan los valores a la 2 luego se suman y por ultimo con el SQRT se les saca la raiz cuadrada
    Si suena como el funcionamiento del teorema de pitagoras, si, es bastante parecido, pero no, es la formula de distancia euclidiana.

    Recibe 2 valores como parametros. Obviamente numeros, pero como estamos en JS queda implicito.

-- Ejemplo del funcionamiento:
     ``const offSet = distance(a, b)``
