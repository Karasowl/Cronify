(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__2be06a00._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/messages/en.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"HomePage":{"title":"Master Your Habits","subtitle":"Build the life you want with Cronify.","getStarted":"Get Started","login":"Login","features":{"trackingTitle":"Habit Tracking Reimagined","trackingDesc":"Track your daily goals with a beautiful, intuitive interface. Mark habits as complete, or log reasons for misses.","accountabilityTitle":"Shared Accountability","accountabilityDesc":"Share your progress with a partner. They see your wins and your reasons for misses.","privacyTitle":"Privacy First","privacyDesc":"You control what you share. Granular permissions for every habit."}},"Navbar":{"dashboard":"Dashboard","partners":"Partners","sharedView":"Shared View","login":"Login","logout":"Logout"},"Auth":{"welcomeBack":"Welcome Back","createAccount":"Create Account","enterCredentials":"Enter your credentials to access your account","startJourney":"Start your journey to better habits today","emailLabel":"Email","emailPlaceholder":"m@example.com","passwordLabel":"Password","signInButton":"Sign In","signUpButton":"Sign Up","noAccount":"Don't have an account? Sign up","hasAccount":"Already have an account? Sign in","checkEmail":"Check your email to confirm your account"},"Dashboard":{"title":"Your Habits","noHabits":"Track your progress and stay consistent."},"HabitTracker":{"todaysHabits":"Today's Habits","done":"Done","fail":"Fail","greatJob":"Great job!","logged":"Logged.","addHabitButton":"Add Habit","createTitle":"Create New Habit","createDesc":"What do you want to achieve? Start small.","habitTitleLabel":"Habit Title","habitTitlePlaceholder":"e.g., Read 10 pages","habitDescLabel":"Description (Optional)","habitDescPlaceholder":"Why is this important?","createButton":"Create Habit","creating":"Creating...","success":"Habit created successfully","viewCalendar":"View calendar","habitDeleted":"Habit deleted","deleteConfirmTitle":"Delete habit?","deleteConfirmDescription":"This action cannot be undone. All records associated with this habit will be deleted.","breakHabits":"Break Habits","buildHabits":"Build Habits","habitType":"Habit Type","buildType":"Build","buildTypeDesc":"Create a new habit","breakType":"Break","breakTypeDesc":"Stop doing something","breakTitlePlaceholder":"e.g., Quit smoking, No social media...","goalLabel":"Initial Goal","goalHint":"The timer will show your progress towards this goal"},"Common":{"loading":"Loading...","save":"Save","cancel":"Cancel","delete":"Delete","edit":"Edit","error":"Something went wrong"},"Partnerships":{"title":"Share Your Progress","description":"Invite a partner to view your habits and help keep you accountable.","emailLabel":"Partner Email","emailPlaceholder":"partner@example.com","inviteButton":"Invite","inviting":"Inviting...","yourPartners":"Your Accountability Partners","noPartners":"No partners yet.","noPartnersHint":"Invite someone to help you stay on track with your habits","remove":"Remove","inviteSuccess":"Partner added successfully","removeSuccess":"Partner removed","alreadyPartner":"This email is already your partner","whatShared":"Your partner will be able to see:","sharedItem1":"Your habits and their progress","sharedItem2":"Calendar with completed/failed days","sharedItem3":"Reasons when you fail a day","sharedItem4":"Your current streak and completion percentage","statusActive":"Active","statusPending":"Pending","addedOn":"Added","removeConfirmTitle":"Remove partner?","removeConfirmDesc":"This partner will no longer be able to see your habits or progress.","cancel":"Cancel"},"SharedHabits":{"title":"Shared View","description":"Habits others share with you for your support.","noHabits":"No shared habits found.","noHabitsHint":"When someone adds you as an accountability partner, their habits will appear here.","statusToday":"Status today:","pending":"Pending","completed":"Completed","failed":"Failed","completion":"Completion","streak":"Streak","failReasons":"Recent failure reasons"}});}),
"[project]/messages/es.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"HomePage":{"title":"Domina tus Hábitos","subtitle":"Construye la vida que deseas con Cronify.","getStarted":"Comenzar","login":"Iniciar Sesión","features":{"trackingTitle":"Seguimiento de Hábitos Reinventado","trackingDesc":"Sigue tus objetivos diarios con una interfaz hermosa e intuitiva. Marca hábitos como completados o registra razones si fallas.","accountabilityTitle":"Responsabilidad Compartida","accountabilityDesc":"Comparte tu progreso con un compañero. Ellos verán tus logros y tus razones para fallar.","privacyTitle":"Privacidad Primero","privacyDesc":"Tú controlas lo que compartes. Permisos granulares para cada hábito."}},"Navbar":{"dashboard":"Panel","partners":"Compañeros","sharedView":"Vista Compartida","login":"Iniciar Sesión","logout":"Cerrar Sesión"},"Auth":{"welcomeBack":"Bienvenido de nuevo","createAccount":"Crear Cuenta","enterCredentials":"Ingresa tus credenciales para acceder","startJourney":"Comienza tu viaje hacia mejores hábitos hoy","emailLabel":"Correo Electrónico","emailPlaceholder":"m@ejemplo.com","passwordLabel":"Contraseña","signInButton":"Iniciar Sesión","signUpButton":"Registrarse","noAccount":"¿No tienes cuenta? Regístrate","hasAccount":"¿Ya tienes cuenta? Inicia sesión","checkEmail":"Revisa tu correo para confirmar tu cuenta"},"Dashboard":{"title":"Tus Hábitos","noHabits":"Sigue tu progreso y mantente constante."},"HabitTracker":{"todaysHabits":"Hábitos de Hoy","done":"Hecho","fail":"Falló","greatJob":"¡Buen trabajo!","logged":"Registrado.","addHabitButton":"Agregar Hábito","createTitle":"Crear Nuevo Hábito","createDesc":"¿Qué quieres lograr? Empieza pequeño.","habitTitleLabel":"Título del Hábito","habitTitlePlaceholder":"ej. Leer 10 páginas","habitDescLabel":"Descripción (Opcional)","habitDescPlaceholder":"¿Por qué es importante?","createButton":"Crear Hábito","creating":"Creando...","success":"Hábito creado exitosamente","viewCalendar":"Ver calendario","habitDeleted":"Hábito eliminado","deleteConfirmTitle":"¿Eliminar hábito?","deleteConfirmDescription":"Esta acción no se puede deshacer. Se eliminarán todos los registros asociados a este hábito.","breakHabits":"Dejar de hacer","buildHabits":"Construir hábitos","habitType":"Tipo de hábito","buildType":"Construir","buildTypeDesc":"Crear un nuevo hábito","breakType":"Romper","breakTypeDesc":"Dejar de hacer algo","breakTitlePlaceholder":"ej. Dejar de fumar, No redes sociales...","goalLabel":"Meta inicial","goalHint":"El cronómetro mostrará tu progreso hacia esta meta"},"Common":{"loading":"Cargando...","save":"Guardar","cancel":"Cancelar","delete":"Eliminar","edit":"Editar","error":"Algo salió mal"},"Partnerships":{"title":"Comparte tu Progreso","description":"Invita a un compañero para que vea tus hábitos y te ayude a mantenerte responsable.","emailLabel":"Correo del Compañero","emailPlaceholder":"compañero@ejemplo.com","inviteButton":"Invitar","inviting":"Invitando...","yourPartners":"Tus Compañeros de Accountability","noPartners":"Aún no tienes compañeros.","noPartnersHint":"Invita a alguien para que te ayude a mantener tus hábitos","remove":"Eliminar","inviteSuccess":"Compañero agregado exitosamente","removeSuccess":"Compañero eliminado","alreadyPartner":"Este email ya es tu partner","whatShared":"Tu partner podrá ver:","sharedItem1":"Tus hábitos y su progreso","sharedItem2":"Calendario con días completados/fallados","sharedItem3":"Razones cuando falles un día","sharedItem4":"Tu racha actual y porcentaje de cumplimiento","statusActive":"Activo","statusPending":"Pendiente","addedOn":"Agregado","removeConfirmTitle":"¿Eliminar partner?","removeConfirmDesc":"Este partner ya no podrá ver tus hábitos ni tu progreso.","cancel":"Cancelar"},"SharedHabits":{"title":"Vista Compartida","description":"Hábitos que otros comparten contigo para que los apoyes.","noHabits":"No se encontraron hábitos compartidos.","noHabitsHint":"Cuando alguien te agregue como accountability partner, sus hábitos aparecerán aquí.","statusToday":"Estado hoy:","pending":"Pendiente","completed":"Completados","failed":"Fallados","completion":"Cumplimiento","streak":"Racha","failReasons":"Razones de fallos recientes"}});}),
"[project]/src/i18n/request.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getRequestConfig$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__getRequestConfig$3e$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/server/react-server/getRequestConfig.js [middleware-edge] (ecmascript) <export default as getRequestConfig>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$routing$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/i18n/routing.ts [middleware-edge] (ecmascript)");
;
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getRequestConfig$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__getRequestConfig$3e$__["getRequestConfig"])(async ({ requestLocale })=>{
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;
    // Ensure that a valid locale is used
    if (!locale || !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$routing$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["routing"].locales.includes(locale)) {
        locale = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$routing$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["routing"].defaultLocale;
    }
    return {
        locale,
        messages: (await __turbopack_context__.f({
            "../../messages/en.json": {
                id: ()=>"[project]/messages/en.json (json)",
                module: ()=>Promise.resolve().then(()=>__turbopack_context__.i("[project]/messages/en.json (json)"))
            },
            "../../messages/es.json": {
                id: ()=>"[project]/messages/es.json (json)",
                module: ()=>Promise.resolve().then(()=>__turbopack_context__.i("[project]/messages/es.json (json)"))
            }
        }).import(`../../messages/${locale}.json`)).default
    };
});
}),
"[project]/src/i18n/routing.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Link",
    ()=>Link,
    "getPathname",
    ()=>getPathname,
    "redirect",
    ()=>redirect,
    "routing",
    ()=>routing,
    "usePathname",
    ()=>usePathname,
    "useRouter",
    ()=>useRouter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$routing$2f$defineRouting$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__defineRouting$3e$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/routing/defineRouting.js [middleware-edge] (ecmascript) <export default as defineRouting>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$navigation$2f$react$2d$server$2f$createNavigation$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__createNavigation$3e$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/navigation/react-server/createNavigation.js [middleware-edge] (ecmascript) <export default as createNavigation>");
;
;
const routing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$routing$2f$defineRouting$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__defineRouting$3e$__["defineRouting"])({
    // A list of all locales that are supported
    locales: [
        'en',
        'es'
    ],
    // Used when no locale matches
    defaultLocale: 'en'
});
const { Link, redirect, usePathname, useRouter, getPathname } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$navigation$2f$react$2d$server$2f$createNavigation$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__createNavigation$3e$__["createNavigation"])(routing);
}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$middleware$2f$middleware$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/middleware/middleware.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$routing$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/i18n/routing.ts [middleware-edge] (ecmascript)");
;
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$middleware$2f$middleware$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$i18n$2f$routing$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["routing"]);
const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: [
        '/((?!api|auth|_next|_vercel|.*\\..*).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__2be06a00._.js.map