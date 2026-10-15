
const tbody = document.querySelector("#tabelaUsuarios");

const nome = document.querySelector("#nome");
const cpf = document.querySelector("#cpf");
const email = document.querySelector("#email");
const telefone = document.querySelector("#telefone");

const formulario = document.querySelector("#cadastroUsuario");
const dialog = document.querySelector("#dialog4");

let items = getItensBD();

// Cadastrar usuário
formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    // Verificar se o CPF já está cadastrado
    const cpfExistente = items.some(item => item.cpf === cpf.value);

    if (cpfExistente) {
        alert("Este CPF já está cadastrado!");
        return;
    }

    // Adicionar usuário à lista
    items.push({
        nome: nome.value.trim(),
        cpf: cpf.value.trim(),
        email: email.value.trim(),
        telefone: telefone.value.trim()
    });

    // Salvar e atualizar a tabela
    setItensBD();
    loadItems();

    // Limpar formulário
    formulario.reset();

    // Fechar o diálogo
    dialog.close();
});

// Excluir usuário
function deleteItem(index) {
    items.splice(index, 1);

    setItensBD();
    loadItems();
}

// Inserir usuário na tabela
function insertItem(item, index) {
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td class="columnAction">
            <button type="button" class="deletar">
                Deletar
            </button>
        </td>
    `;

    // Inserir os dados como texto
    tr.cells[0].textContent = item.nome;
    tr.cells[1].textContent = item.cpf;
    tr.cells[2].textContent = item.email;
    tr.cells[3].textContent = item.telefone;

    // Configurar botão de exclusão
    tr.querySelector(".deletar").addEventListener("click", function() {
        deleteItem(index);
    });

    tbody.appendChild(tr);
}

// Carregar usuários na tabela
function loadItems() {
    tbody.innerHTML = "";

    items.forEach((item, index) => {
        insertItem(item, index);
    });
}

// Buscar dados salvos
function getItensBD() {
    return JSON.parse(localStorage.getItem("db_items")) ?? [];
}

// Salvar dados
function setItensBD() {
    localStorage.setItem("db_items", JSON.stringify(items));
}

// Carregar os usuários ao abrir a página
loadItems();
