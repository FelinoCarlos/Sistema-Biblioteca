
// exporta uma funcao mount()
import * as home from "./home.js";
import * as emprestimo from "./emprestimo.js";
import * as catalogo from "./catalogo.js";
import * as cliente from "./cliente.js";

// ---------- TABELA DE ROTAS ----------
const rotas = {
    "/":           { tela: "home",       css: ["pagina-inicial.css"], mount: home.mount },
    "/emprestimo": { tela: "emprestimo", css: [],                     mount: emprestimo.mount },
    "/catalogo":   { tela: "catalogo",   css: ["catalogo.css"],       mount: catalogo.mount },
    "/cliente":    { tela: "cliente",    css: [],                     mount: cliente.mount }
};

// ---------- ESTADO ----------
const app = document.querySelector("#app"); 
const cacheHtml = {};  
let linksCss = [];      
let limpar = null;      
let versao = 0;        

function caminhoAtual() {
    const caminho = location.pathname.replace(/\.html$/, "").replace(/\/+$/, "");
    return caminho === "" || caminho === "/index" ? "/" : caminho;
}


async function carregarHtml(nome) {
    if (!cacheHtml[nome]) {
        const resposta = await fetch(`/screens/${nome}.html`);
        if (!resposta.ok) throw new Error(`Tela "${nome}" não encontrada`);
        cacheHtml[nome] = await resposta.text();
    }
    return cacheHtml[nome];
}

function carregarCss(arquivos) {
    linksCss.forEach((link) => link.remove());

    linksCss = arquivos.map((arquivo) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = `/css/${arquivo}`;
        document.head.appendChild(link);
        return link;
    });

    return Promise.all(
        linksCss.map((link) => new Promise((resolve) => {
            link.onload = resolve;
            link.onerror = resolve; // se falhar, segue sem o CSS
        }))
    );
}

function marcarMenu() {
    document.querySelectorAll("nav a[data-link]").forEach((link) => {
        link.classList.toggle("ativo", link.getAttribute("href") === caminhoAtual());
    });
}


async function renderizar() {
    const minhaVersao = ++versao;  

    limpar?.();                    
    limpar = null;
    marcarMenu();

    const rota = rotas[caminhoAtual()];

    if (!rota) {
        await carregarCss([]);
        app.innerHTML = "<h2>Página não encontrada</h2>";
        return;
    }

    let html;

    try {
        
        [html] = await Promise.all([carregarHtml(rota.tela), carregarCss(rota.css)]);
    } catch (erro) {
        console.error(erro);
        app.innerHTML = "<h2>Não foi possível carregar a página.</h2>";
        return;
    }

    if (minhaVersao !== versao) return;

    app.innerHTML = html;          
    limpar = rota.mount() ?? null; 
}

document.addEventListener("click", (evento) => {
    const link = evento.target.closest("a[data-link]");
    if (!link) return;                        

    evento.preventDefault();                  
    history.pushState(null, "", link.getAttribute("href")); 
    renderizar();                             
});

window.addEventListener("popstate", renderizar);

renderizar();
