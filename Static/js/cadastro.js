
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

const formLivro = document.querySelector("#CadastroLivro");
const dialog3 = document.querySelector("#dialog3");

const getItensBDLivro = () => JSON.parse(localStorage.getItem("db_items")) ?? [];
const setItensBDLivro = (items) => localStorage.setItem("db_items", JSON.stringify(items));

formLivro.addEventListener("submit", (e) => {
    e.preventDefault();

    const items = getItensBDLivro();
    items.push({
        imagem: formLivro.querySelector("#Imagem").value,
        titulo: formLivro.querySelector("#titulo").value,
        autor: formLivro.querySelector("#autor").value,
        quantidade: formLivro.querySelector("#quantidade").value
    });

    setItensBDLivro(items);
    formLivro.reset();
    dialog3.close();
});