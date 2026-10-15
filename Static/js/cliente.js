const buttons = document.querySelectorAll("#btn-button");

buttons.forEach(button => {
    button.onclick = function() {

        const dialogId = button.dataset.dialog;
        const dialog = document.getElementById(dialogId);

        dialog.showModal();
    };
});


const closeButtons = document.querySelectorAll(".close");

closeButtons.forEach(button => {
    button.onclick = function() {
        button.closest("dialog").close();
    };
});

const tbody = document.querySelector("#tabelaUsuarios");

const getItensBD = () => JSON.parse(localStorage.getItem("db_items")) ?? [];
const setItensBD = (items) => localStorage.setItem("db_items", JSON.stringify(items));

function deleteItem(index) {
    const items = getItensBD();
    items.splice(index, 1);
    setItensBD(items);
    loadItems();
}

function insertItem(item, index) {
    const tr = document.createElement("tr");

    [item.nome, item.cpf, item.email, item.telefone].forEach((valor) => {
        const td = document.createElement("td");
        td.textContent = valor;
        tr.appendChild(td);
    });

    const tdAcao = document.createElement("td");
    tdAcao.className = "columnAction";

    const btn = document.createElement("button");
    btn.textContent = "Deletar";
    btn.addEventListener("click", () => deleteItem(index));

    tdAcao.appendChild(btn);
    tr.appendChild(tdAcao);
    tbody.appendChild(tr);
}

function loadItems() {
    tbody.innerHTML = "";
    getItensBD().forEach(insertItem);
}

loadItems();