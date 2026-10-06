import PaginaInicial from "./views/PaginaInicial.js";
import Emprestimo from "./views/Emprestimo.js";


const navigateTo = url => {
    history.pushState(null, null, url);
    router();
}


const router = async () => {
     const routes = [
        { path: "/", view: PaginaInicial},
        { path: "/emprestimos", view: Emprestimo},
     //   { path: "/catalogo", view: () => console.log("Catalogo")},
       // { path: "/clientes", view: () => console.log("Clientes")},
     ];

     const potentialMatches = routes.map( route => {
        return {
            route: route,
            isMatch: location.pathname === route.path
        }
     });

     let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

     if(!match) {
        match = {
            route: routes[0],
            isMatch: true
        };
     }

     const view = new match.route.view();

     document.querySelector("#app").innerHTML = await view.getHtml();

};

window.addEventListener("popstate", router);


document.addEventListener("DOMContentLoaded", () => {
    router();
});

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if(e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });

    router();
});