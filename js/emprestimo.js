import { mostrarAviso, confirmar } from "./aviso.js";



/* ---------- Chaves do localStorage (as mesmas dos outros módulos) ---------- */
export function mount() {
const CHAVE_CLIENTES = "db_items";
const CHAVE_LIVROS = "db_livros";
const CHAVE_EMPRESTIMOS = "db_emprestimos";

/* ---------- Elementos ---------- */
const tbody = document.querySelector("#tabelaEmprestimos");
const mensagem = document.querySelector("#mensagemEmprestimos");
const dialog = document.querySelector("#dialogEmprestimo");
const form = document.querySelector("#formEmprestimo");
const selectCliente = document.querySelector("#selectCliente");
const selectLivro = document.querySelector("#selectLivro");
const inputPrazo = document.querySelector("#prazoDias");
const previa = document.querySelector("#previaDevolucao");
const aviso = document.querySelector("#avisoEmprestimo");
const btnEmprestar = document.querySelector("#btnEmprestar");
const busca = document.querySelector("#buscaEmprestimo");
const filtroStatus = document.querySelector("#filtroStatus");


/* ---------- Acesso ao armazenamento ---------- */
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

/* ---------- Datas (formato AAAA-MM-DD, horário local) ---------- */
function formatarISO(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function hojeISO() {
    return formatarISO(new Date());
}

function somarDias(iso, dias) {
    const [ano, mes, dia] = iso.split("-").map(Number);
    return formatarISO(new Date(ano, mes - 1, dia + dias));
}

function exibirData(iso) {
    if (!iso) return "-";
    const [ano, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${ano}`;
}

function normalizar(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

/* ---------- Regras ---------- */
function statusDe(emprestimo) {
    if (emprestimo.dataDevolucao) return "devolvido";
    return hojeISO() > emprestimo.dataPrevista ? "atrasado" : "ativo";
}

const ROTULOS = {
    ativo: "Em andamento",
    atrasado: "Atrasado",
    devolvido: "Devolvido"
};

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

/* ---------- Preenche os selects do formulário ---------- */
function carregarOpcoes() {
    selectCliente.replaceChildren(new Option("Selecione o cliente", ""));
    selectLivro.replaceChildren(new Option("Selecione o livro", ""));

    ler(CHAVE_CLIENTES).forEach((cliente) => {
        selectCliente.appendChild(
            new Option(
                `${cliente.nome} (CPF ${cliente.cpf})`,
                somenteNumeros(cliente.cpf)
            )
        );
    });

    ler(CHAVE_LIVROS)
        .filter((livro) => livro.disponivel > 0)
        .forEach((livro) => {
            selectLivro.appendChild(
                new Option(
                    `${livro.titulo} - ${livro.autor} (${livro.disponivel} disp.)`,
                    livro.id
                )
            );
        });
}

function atualizarPrevia() {
    const dias = Number(inputPrazo.value);

    previa.textContent =
        Number.isInteger(dias) && dias > 0
            ? `Devolução prevista: ${exibirData(somarDias(hojeISO(), dias))}`
            : "";
}

/* ---------- Criar empréstimo ---------- */
function emprestar(evento) {
    evento.preventDefault();

    const cpf = selectCliente.value;
    const livroId = selectLivro.value;
    const dias = Number(inputPrazo.value);

    if (!cpf || !livroId || !Number.isInteger(dias) || dias < 1) {
         mostrarAviso("Preencha todos os campos corretamente.");
        return;
    }

    const livros = ler(CHAVE_LIVROS);
    const livro = livros.find((l) => l.id === livroId);

    if (!livro || livro.disponivel < 1) {
        mostrarAviso("Este livro não possui exemplares disponíveis.");
        carregarOpcoes();
        return;
    }

    const emprestimos = ler(CHAVE_EMPRESTIMOS);

    // Evita o mesmo cliente com o mesmo livro em aberto
    const repetido = emprestimos.some(
        (e) => !e.dataDevolucao && e.cpf === cpf && e.livroId === livroId
    );

    if (repetido) {
        mostrarAviso("Este cliente já está com um exemplar deste livro.");
        return;
    }

    const hoje = hojeISO();

    emprestimos.push({
        id: crypto.randomUUID(),
        livroId,
        cpf,
        dataEmprestimo: hoje,
        dataPrevista: somarDias(hoje, dias),
        dataDevolucao: null
    });

    livro.disponivel -= 1;

    try {
        salvar(CHAVE_LIVROS, livros);
        salvar(CHAVE_EMPRESTIMOS, emprestimos);
    } catch {
        mostrarAviso("Não foi possível salvar o empréstimo.");
        return;
    }

    dialog.close();
    mostrarEmprestimos();
}

/* ---------- Devolver ---------- */
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
    mostrarEmprestimos();
}

/* ---------- Tabela ---------- */
function criarLinha(emprestimo) {
    const status = statusDe(emprestimo);
    const tr = document.createElement("tr");

    [
        tituloDoLivro(emprestimo.livroId),
        nomeDoCliente(emprestimo.cpf),
        exibirData(emprestimo.dataEmprestimo),
        exibirData(emprestimo.dataPrevista)
    ].forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor;
        tr.appendChild(td);
    });

    const tdStatus = document.createElement("td");
    tdStatus.textContent =
        status === "devolvido"
            ? `${ROTULOS[status]} em ${exibirData(emprestimo.dataDevolucao)}`
            : ROTULOS[status];
    tdStatus.className = `status-${status}`;
    tr.appendChild(tdStatus);

    const tdAcao = document.createElement("td");
    tdAcao.className = "columnAction";

    if (status !== "devolvido") {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.textContent = "Devolver";
        botao.addEventListener("click", () => devolver(emprestimo.id));
        tdAcao.appendChild(botao);
    }
    

    tr.appendChild(tdAcao);
    return tr;
}

function mostrarEmprestimos() {
    const termo = normalizar(busca.value);
    const filtro = filtroStatus.value;

    const todos = ler(CHAVE_EMPRESTIMOS);

    const filtrados = todos
        .filter((e) => {
            const status = statusDe(e);
            const textoBusca = normalizar(
                `${tituloDoLivro(e.livroId)} ${nomeDoCliente(e.cpf)}`
            );

            return (
                textoBusca.includes(termo) &&
                (filtro === "todos" || filtro === status)
            );
        })
        // Mais recentes primeiro
        .sort((a, b) => b.dataEmprestimo.localeCompare(a.dataEmprestimo));

    tbody.replaceChildren(...filtrados.map(criarLinha));

    mensagem.textContent =
        filtrados.length === 0
            ? todos.length
                ? "Nenhum empréstimo encontrado."
                : "Nenhum empréstimo registrado."
            : `${filtrados.length} empréstimo(s).`;

}


/* ---------- Eventos ---------- */
document.querySelector("#btnNovoEmprestimo").addEventListener("click", () => {
    form.reset();
    inputPrazo.value = 7;
    carregarOpcoes();
    atualizarPrevia();

    const avisos = [];

    if (selectCliente.options.length === 1) {
        avisos.push("Nenhum cliente cadastrado.");
    }

    if (selectLivro.options.length === 1) {
        avisos.push("Nenhum livro disponível no catálogo.");
    }

    aviso.textContent = avisos.join(" ");
    btnEmprestar.disabled = avisos.length > 0;

    dialog.showModal();
});

dialog.querySelector(".close").addEventListener("click", () => dialog.close());
inputPrazo.addEventListener("input", atualizarPrevia);
form.addEventListener("submit", emprestar);
busca.addEventListener("input", mostrarEmprestimos);
filtroStatus.addEventListener("change", mostrarEmprestimos);

mostrarEmprestimos();
}