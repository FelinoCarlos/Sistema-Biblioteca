let editIndex = null;
let paginaAtual = 1;

const ITENS_POR_PAGINA = 5;

const tbody = document.querySelector("#tabelaUsuarios");
const tabela = tbody?.closest("table");
const dialog = document.getElementById("dialog4");
const form = document.getElementById("cadastroUsuario");

const inputNome = document.getElementById("nome");
const inputCpf = document.getElementById("cpf");
const inputEmail = document.getElementById("email");
const inputTelefone = document.getElementById("telefone");

const inputPesquisa = document.querySelector('input[type="search"]');

/* Armazenar dados dos cliente */
const getItensBD = () => {
    try {
        const dados = JSON.parse(
            localStorage.getItem("db_items") || "[]"
        );

        return Array.isArray(dados) ? dados : [];
    } catch (erro) {
        console.error("Erro ao carregar clientes:", erro);
        return [];
    }
};

const setItensBD = (items) => {
    localStorage.setItem("db_items", JSON.stringify(items));
};

/* fILTRO DE CLIENTE PARA BUSCA */

let filtroCliente = document.getElementById("filtroCliente");

if (inputPesquisa && !filtroCliente) {
    filtroCliente = document.createElement("select");
    filtroCliente.id = "filtroCliente";
    filtroCliente.setAttribute("aria-label", "Filtrar pesquisa");

    [
        ["todos", "Todos os campos"],
        ["nome", "Nome"],
        ["cpf", "CPF"],
        ["email", "E-mail"],
        ["telefone", "Telefone"]
    ].forEach(([valor, texto]) => {
        const opcao = document.createElement("option");

        opcao.value = valor;
        opcao.textContent = texto;

        filtroCliente.appendChild(opcao);
    });

    inputPesquisa.insertAdjacentElement("afterend", filtroCliente);
}

let mensagem = document.getElementById("mensagemClientes");

if (!mensagem && tabela) {
    mensagem = document.createElement("p");
    mensagem.id = "mensagemClientes";
    mensagem.setAttribute("aria-live", "polite");
    tabela.insertAdjacentElement("afterend", mensagem);
}

let paginacao = document.getElementById("paginacaoClientes");

if (!paginacao && tabela) {
    paginacao = document.createElement("nav");
    paginacao.id = "paginacaoClientes";
    paginacao.setAttribute("aria-label", "Paginação de clientes");
    tabela.insertAdjacentElement("afterend", paginacao);
}

function normalizar(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function obterResultados() {
    const items = getItensBD();

    const pesquisa = normalizar(inputPesquisa?.value || "");
    const campo = filtroCliente?.value || "todos";

    return items
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => {
            const campos = {
                nome: item.nome,
                cpf: item.cpf,
                email: item.email,
                telefone: item.telefone
            };

            const valores = campo === "todos"
                ? Object.values(campos)
                : [campos[campo]];

            return valores.some(valor =>
                normalizar(valor).includes(pesquisa)
            );
        });
}

inputPesquisa?.addEventListener("input", () => {
    paginaAtual = 1;
    loadItems();
});

filtroCliente?.addEventListener("change", () => {
    paginaAtual = 1;
    loadItems();
});

/* cadastrar usuarios */

document.querySelectorAll("#btn-button").forEach(button => {
    button.addEventListener("click", () => {
        editIndex = null;
        form.reset();

        const titulo = document.getElementById(
            "tituloFormularioCliente"
        );

        const botaoSalvar = document.getElementById("cadastrar");

        if (titulo) titulo.textContent = "Cadastrar cliente";
        if (botaoSalvar) botaoSalvar.textContent = "Cadastrar";

        dialog.showModal();
    });
});

document.querySelectorAll(".close").forEach(button => {
    button.addEventListener("click", () => {
        editIndex = null;
        form.reset();
        dialog.close();
    });
});

function salvarItem(event) {
    event.preventDefault();

    const item = {
        nome: inputNome.value.trim(),
        cpf: inputCpf.value.trim(),
        email: inputEmail.value.trim(),
        telefone: inputTelefone.value.trim()
    };

    if (!item.nome || !item.cpf || !item.email || !item.telefone) {
        alert("Preencha todos os campos.");
        return;
    }

    const cpfNumeros = item.cpf.replace(/\D/g, "");

    if (cpfNumeros.length !== 11) {
        alert("O CPF deve conter 11 números.");
        inputCpf.focus();
        return;
    }

    const items = getItensBD();

    const duplicado = items.some((cliente, index) => {
        if (index === editIndex) return false;

        return String(cliente.cpf || "").replace(/\D/g, "")
            === cpfNumeros;
    });

    if (duplicado) {
        alert("Já existe um cliente com esse CPF.");
        inputCpf.focus();
        return;
    }

    if (editIndex !== null) {
        items[editIndex] = item;
    } else {
        items.push(item);
    }

    setItensBD(items);

    editIndex = null;
    paginaAtual = 1;

    form.reset();
    dialog.close();

    loadItems();
}

form.addEventListener("submit", salvarItem);

function editItem(index) {
    const item = getItensBD()[index];

    if (!item) return;

    inputNome.value = item.nome || "";
    inputCpf.value = item.cpf || "";
    inputEmail.value = item.email || "";
    inputTelefone.value = item.telefone || "";

    editIndex = index;

    const titulo = document.getElementById(
        "tituloFormularioCliente"
    );

    const botaoSalvar = document.getElementById("cadastrar");

    if (titulo) titulo.textContent = "Editar cliente";
    if (botaoSalvar) botaoSalvar.textContent = "Salvar alterações";

    dialog.showModal();
}


function deleteItem(index) {
    const items = getItensBD();
    const cliente = items[index];

    if (!cliente) return;

    if (!confirm(`Deseja excluir o cliente ${cliente.nome}?`)) {
        return;
    }

    items.splice(index, 1);
    setItensBD(items);

    loadItems();
}


function insertItem(item, index) {
    const tr = document.createElement("tr");

    [item.nome, item.cpf, item.email, item.telefone].forEach(valor => {
        const td = document.createElement("td");
        td.textContent = valor || "-";
        tr.appendChild(td);
    });

    const tdAcao = document.createElement("td");
    tdAcao.className = "columnAction";

    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.textContent = "Editar";
    btnEditar.addEventListener("click", () => editItem(index));

    const btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.textContent = "Excluir";
    btnExcluir.addEventListener("click", () => deleteItem(index));

    tdAcao.append(btnEditar, btnExcluir);
    tr.appendChild(tdAcao);

    tbody.appendChild(tr);
}

function criarBotaoPagina(texto, pagina, opcoes = {}) {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.textContent = texto;
    botao.disabled = Boolean(opcoes.disabled);

    if (opcoes.ativa) {
        botao.classList.add("pagina-ativa");
        botao.setAttribute("aria-current", "page");
    }

    botao.addEventListener("click", () => {
        paginaAtual = pagina;
        loadItems();
    });

    paginacao.appendChild(botao);
}

function renderizarPaginacao(totalResultados) {
    paginacao.innerHTML = "";

    const totalPaginas = Math.ceil(
        totalResultados / ITENS_POR_PAGINA
    );

    if (totalPaginas <= 1) return;

    criarBotaoPagina(
        "‹",
        paginaAtual - 1,
        { disabled: paginaAtual === 1 }
    );

    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
        criarBotaoPagina(
            String(pagina),
            pagina,
            { ativa: pagina === paginaAtual }
        );
    }

    criarBotaoPagina(
        "›",
        paginaAtual + 1,
        { disabled: paginaAtual === totalPaginas }
    );
}


function loadItems() {
    if (!tbody) return;

    const todos = getItensBD();
    const resultados = obterResultados();

    const totalResultados = resultados.length;
    const totalPaginas = Math.ceil(
        totalResultados / ITENS_POR_PAGINA
    );

    // Evita permanecer em uma página que deixou de existir.
    paginaAtual = totalPaginas === 0
        ? 1
        : Math.min(paginaAtual, totalPaginas);

    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;

    const resultadosPagina = resultados.slice(
        inicio,
        inicio + ITENS_POR_PAGINA
    );

    tbody.innerHTML = "";

    resultadosPagina.forEach(({ item, index }) => {
        insertItem(item, index);
    });

    const pesquisando = Boolean(
        inputPesquisa?.value.trim()
    );

    if (totalResultados === 0) {
        mensagem.textContent = todos.length
            ? "Nenhum cliente encontrado para essa pesquisa."
            : "Nenhum cliente cadastrado.";
    } else if (pesquisando) {
        mensagem.textContent =
            `${totalResultados} ${
                totalResultados === 1 ? "cliente encontrado" : "clientes encontrados"
            } de ${todos.length} cadastrados.`;
    } else {
        const primeiro = inicio + 1;
        const ultimo = Math.min(
            inicio + ITENS_POR_PAGINA,
            totalResultados
        );

        mensagem.textContent =
            `Mostrando ${primeiro}–${ultimo} de ${totalResultados} clientes.`;
    }

    renderizarPaginacao(totalResultados);
}


loadItems();