/* ---------- Cadastro de usuário ---------- */
const nome = document.querySelector("#nome");
const cpf = document.querySelector("#cpf");
const email = document.querySelector("#email");
const telefone = document.querySelector("#telefone");
const cadastroUsuario = document.querySelector("#cadastroUsuario");

cadastroUsuario?.addEventListener("submit", (e) => {
    if (!nome.value || !cpf.value || !email.value || !telefone.value) {
        alert("Preencha todos os campos!");
        e.preventDefault();
    }
});

const mascara = document.querySelector("#cpf");

mascara?.addEventListener("blur", function () {
    if (mascara.value) {
        mascara.value = mascara.value
            .match(/.{1,3}/g)
            .join(".")
            .replace(/\.(?=[^.]*$)/, "-");
    }
});

/* ---------- Relógio ---------- */
const timeDisplay = document.getElementById("time");

function refreshTime() {
    const dateString = new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo"
    });
    if (timeDisplay) timeDisplay.textContent = dateString.replace(", ", " - ");
}

refreshTime();
setInterval(refreshTime, 1000);

/* ---------- Chaves ---------- */
const CHAVE_EMPRESTIMOS = "db_emprestimos";
const CHAVE_LIVROS = "db_livros";
const CHAVE_CLIENTES = "db_items";

/* ---------- Elementos ---------- */
const tbody = document.querySelector("#tabelaAtrasados");
const mensagem = document.querySelector("#mensagemAtrasados");
const totalEmprestimos = document.querySelector("#totalEmprestimos");
const totalClientes = document.querySelector("#totalClientes");

/* ---------- Armazenamento ---------- */
function ler(chave) {
    try {
        const dados = JSON.parse(localStorage.getItem(chave) || "[]");
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

const salvar = (chave, dados) =>
    localStorage.setItem(chave, JSON.stringify(dados));

const somenteNumeros = (texto) => String(texto ?? "").replace(/\D/g, "");

/* ---------- Datas ---------- */
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

function diasDeAtraso(dataPrevista) {
    const [a, m, d] = dataPrevista.split("-").map(Number);
    const prevista = new Date(a, m - 1, d);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return Math.round((hoje - prevista) / 86400000);
}

/* ---------- Regras ---------- */
const estaAtrasado = (e) => !e.dataDevolucao && hojeISO() > e.dataPrevista;

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

/* ---------- Devolução ---------- */
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
    atualizarPainel();
}

/* ---------- Tabela de atrasados ---------- */
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
    tdAcao.className = "columnAction";

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
        .sort((a, b) => a.dataPrevista.localeCompare(b.dataPrevista));

    if (tbody) tbody.replaceChildren(...atrasados.map(criarLinha));
    if (mensagem) mensagem.textContent = atrasados.length;
}

/* ---------- Cards do painel ---------- */
function atualizarPainel() {
    if (totalEmprestimos) {
        totalEmprestimos.textContent = ler(CHAVE_EMPRESTIMOS).length;
    }
    if (totalClientes) {
        totalClientes.textContent = ler(CHAVE_CLIENTES).length;
    }
    mostrarAtrasados();
}

/* ---------- Inicialização e atualização automática ---------- */
atualizarPainel();

// Outras abas alteraram os dados
window.addEventListener("storage", (e) => {
    if ([CHAVE_EMPRESTIMOS, CHAVE_LIVROS, CHAVE_CLIENTES].includes(e.key)) {
        atualizarPainel();
    }
});

// O emprestimo.js (nesta mesma aba) criou ou devolveu algo
window.addEventListener("emprestimos-atualizados", atualizarPainel);