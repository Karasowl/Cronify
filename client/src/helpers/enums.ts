// Routes.ts
 export enum routes {
    root = '/',
    home = '/home',
    statistics = '/statistics',
    user = '/user',
    settings = '/settings',
    login = '/login',
    register = '/register',
  }

  export enum urls {
    createUser = `http://localhost:9785/api/create-user`,
    login = `http://localhost:9785/api/login`,
    createCard = `http://localhost:9785/api/create-card`,
    getCards = `http://localhost:9785/api/get-cards`
  }
  