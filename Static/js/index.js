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

        

