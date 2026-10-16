let editIndex = null;

const tbody = document.querySelector("#tabelaUsuarios");
const dialog = document.getElementById("dialog4");
const form = document.getElementById("cadastroUsuario");

const getItensBD = () => JSON.parse(localStorage.getItem("db_items")) ?? [];
const setItensBD = (items) => localStorage.setItem("db_items", JSON.stringify(items));

document.querySelectorAll("#btn-button").forEach(button => {
    button.onclick = () => {
        editIndex = null;
        form.reset();
        dialog.showModal();
    };
});

document.querySelectorAll(".close").forEach(button => {
    button.onclick = () => {
        editIndex = null;
        form.reset();
        dialog.close();
    };
});

function deleteItem(index) {
    const items = getItensBD();
    items.splice(index, 1);
    setItensBD(items);
    loadItems();
}

function editItem(index) {
    const item = getItensBD()[index];

    document.getElementById("nome").value = item.nome;
    document.getElementById("cpf").value = item.cpf;
    document.getElementById("email").value = item.email;
    document.getElementById("telefone").value = item.telefone;

    editIndex = index;
    dialog.showModal();
}

function salvarItem(e) {
    e.preventDefault();

    const item = {
        nome: document.getElementById("nome").value,
        cpf: document.getElementById("cpf").value,
        email: document.getElementById("email").value,
        telefone: document.getElementById("telefone").value,
    };

    const items = getItensBD();

    if (editIndex !== null) {
        items[editIndex] = item;
        editIndex = null;
    } else {
        items.push(item);
    }

    setItensBD(items);
    loadItems();
    form.reset();
    dialog.close();
}

form.addEventListener("submit", salvarItem);

function insertItem(item, index) {
    const tr = document.createElement("tr");

    [item.nome, item.cpf, item.email, item.telefone].forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor;
        tr.appendChild(td);
    });

    const tdAcao = document.createElement("td");
    tdAcao.className = "columnAction";

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.addEventListener("click", () => editItem(index));

    const btnDeletar = document.createElement("button");
    btnDeletar.textContent = "Deletar";
    btnDeletar.addEventListener("click", () => deleteItem(index));

    tdAcao.append(btnEditar, btnDeletar);
    tr.appendChild(tdAcao);
    tbody.appendChild(tr);
}

function loadItems() {
    tbody.innerHTML = "";
    getItensBD().forEach(insertItem);
}

loadItems();