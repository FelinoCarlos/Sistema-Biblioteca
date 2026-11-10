
const nome = document.querySelector("#nome");
const cpf = document.querySelector("#cpf");
const email = document.querySelector("#email");
const telefone = document.querySelector("#telefone");
const cadastroUsuario = document.querySelector("#cadastroUsuario");

cadastroUsuario.addEventListener("submit", (e) => {
    let enviar = true;
    
    if (!nome.value || !cpf.value || !email.value || !telefone.value){
         alert("Preencha todos os campos!");
        enviar = false;

    if (!enviar){
    e.preventDefault();
    }
   
}});


var mascara = document.querySelector("#cpf");

mascara.addEventListener("blur", function(){
   if(mascara.value) mascara.value = mascara.value.match(/.{1,3}/g).join(".").replace(/\.(?=[^.]*$)/,"-");
});

        


function getTotalClientes() {
    try {
        const dados = JSON.parse(
            localStorage.getItem("db_items") || "[]"
        );

        return Array.isArray(dados) ? dados.length : 0;
    } catch (erro) {
        console.error("Erro ao carregar clientes:", erro);
        return 0;
    }
}

function mostrarTotalClientes() {
    const elemento = document.getElementById("totalClientes");

    if (elemento) {
        elemento.textContent = getTotalClientes();
    }
}

mostrarTotalClientes();


var timeDisplay = document.getElementById("time");


function refreshTime() {
  var dateString = new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"});
  var formattedString = dateString.replace(", ", " - ");
  timeDisplay.innerHTML = formattedString;
}

setInterval(refreshTime, 1000);


/* Isso configura o total de emprestimos, pegando os valores do emprestimo.js */
const CHAVE_EMPRESTIMOS = "db_emprestimos";
const CHAVE_LIVROS = "db_livros";
const CHAVE_CLIENTES = "db_items";
const tbody = document.querySelector("#tabelaAtrasados");
const mensagem = document.querySelector("#mensagemAtrasados");
const totalAtrasados = document.querySelector("#totalAtrasados");



function ler(chave) {
    try {
        const dados = JSON.parse(localStorage.getItem(chave) || "[]");
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

const totalEmprestimos = document.querySelector("#totalEmprestimos");

if (totalEmprestimos) {
    totalEmprestimos.textContent = ler(CHAVE_EMPRESTIMOS).length;
}

const somenteNumeros = (texto) => String(texto ?? "").replace(/\D/g, "");

function formatarISO(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

const hojeISO = () => formatarISO(new Date());

function exibirData(iso) {
    if (!iso) return "-";
    const [ano, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${ano}`;
}

// Quantos dias passaram do prazo
function diasDeAtraso(dataPrevista) {
    const [a, m, d] = dataPrevista.split("-").map(Number);
    const prevista = new Date(a, m - 1, d);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return Math.round((hoje - prevista) / 86400000);
}

// Mesma regra da página de empréstimos
function estaAtrasado(e) {
    return !e.dataDevolucao && hojeISO() > e.dataPrevista;
}

function nomeDoCliente(cpf) {
    const cliente = ler(CHAVE_CLIENTES).find(
        (c) => somenteNumeros(c.cpf) === cpf
    );
    return cliente ? cliente.nome : "Cliente removido";
}

function tituloDoLivro(livroId) {
    const livro = ler(CHAVE_LIVROS).find((l) => l.id === livroId);
    return livro ? livro.titulo : "Livro removido";
}

function devolver(id) {
    const emprestimos = ler(CHAVE_EMPRESTIMOS);
    const emprestimo = emprestimos.find((e) => e.id === id);

    if (!emprestimo || emprestimo.dataDevolucao) return;
    if (!confirm("Confirmar a devolução deste livro?")) return;

    emprestimo.dataDevolucao = hojeISO();

    const livros = ler(CHAVE_LIVROS);
    const livro = livros.find((l) => l.id === emprestimo.livroId);

    if (livro) {
        livro.disponivel = Math.min(livro.disponivel + 1, livro.quantidade);
        salvar(CHAVE_LIVROS, livros);
    }

    salvar(CHAVE_EMPRESTIMOS, emprestimos);
    mostrarAtrasados();
}
function criarLinha(emprestimo) {
    const tr = document.createElement("tr");

    [
        tituloDoLivro(emprestimo.livroId),
        nomeDoCliente(emprestimo.cpf),
        exibirData(emprestimo.dataEmprestimo),
        exibirData(emprestimo.dataPrevista),
        `${diasDeAtraso(emprestimo.dataPrevista)} dia(s)`
    ].forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor;
        tr.appendChild(td);
    });

    const tdAcao = document.createElement("td");
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = "Devolver";
    botao.addEventListener("click", () => devolver(emprestimo.id));
    tdAcao.appendChild(botao);
    tr.appendChild(tdAcao);

    return tr;
}

function mostrarAtrasados() {
    const atrasados = ler(CHAVE_EMPRESTIMOS)
        .filter(estaAtrasado)
        // Os mais atrasados primeiro
        .sort((a, b) => a.dataPrevista.localeCompare(b.dataPrevista));

    tbody.replaceChildren(...atrasados.map(criarLinha));

    mensagem.textContent =
        atrasados.length === 0
            ? "Nenhum livro atrasado."
            : `${atrasados.length}`;

    totalAtrasados.textContent = atrasados.length;
}

/* ---------- Inicialização ---------- */
mostrarAtrasados();

// Atualiza se outra aba alterar empréstimos ou livros
window.addEventListener("storage", (e) => {
    if (e.key === CHAVE_EMPRESTIMOS || e.key === CHAVE_LIVROS) {
        mostrarAtrasados();
    }
});


