


const form = document.querySelector("#cadastroUsuario");
const dialog4 = document.querySelector("#dialog4");

const getItensBD = () => JSON.parse(localStorage.getItem("db_items")) ?? [];
const setItensBD = (items) => localStorage.setItem("db_items", JSON.stringify(items));

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const items = getItensBD();
    items.push({
        nome: form.querySelector("#nome").value,
        cpf: form.querySelector("#cpf").value,
        email: form.querySelector("#email").value,
        telefone: form.querySelector("#telefone").value
    });

    setItensBD(items);
    form.reset();
    dialog4.close();
});