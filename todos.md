<!-- me quedé con un error en el http://localhost:5173/statistics después de loguarme: 
urlCurrent.find is not a function
    at useRedirect.ts:9:37 -->
    Debo refactorizar el componente de error para crer un customHook con él y así no tener que hacer todas las importaciones y colocarlo dentro de todos los componentes en donde se tiene que mostrar, debería existir de forma global en toda la app, lo mismo para el loading