<!-- me quedé con un error en el http://localhost:5173/statistics después de loguarme: 
urlCurrent.find is not a function
    at useRedirect.ts:9:37 -->
    Debo refactorizar el componente de error para crer un customHook con él y así no tener que hacer todas las importaciones y colocarlo dentro de todos los componentes en donde se tiene que mostrar, debería existir de forma global en toda la app, lo mismo para el loading


    /* Extra small devices (phones, 600px and down) */
@media only screen and (max-width: 600px) {...} 

/* Small devices (portrait tablets and large phones, 600px and up) */
@media only screen and (min-width: 600px) {...} 

/* Medium devices (landscape tablets, 768px and up) */
@media only screen and (min-width: 768px) {...} 

/* Large devices (laptops/desktops, 992px and up) */
@media only screen and (min-width: 992px) {...} 

/* Extra large devices (large laptops and desktops, 1200px and up) */
@media only screen and (min-width: 1200px) {...}