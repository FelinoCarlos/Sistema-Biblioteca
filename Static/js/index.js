
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



        

