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
    
    
    if (!nome.value){
         alert("Nome do cliente está em branco, favor preenchê-lo!");
        enviar = false;
 
    }
    if (!cpf.value){
        alert("CPF do cliente está em branco, favor preenchê-lo!");
           enviar = false;
   
    }
    if (!email.value){
        alert("Email do cliente está em branco, favor preenchê-lo!");
           enviar = false;
 
    }
    if (!telefone.value){
        alert("Telefone do cliente está em branco, favor preenchê-lo!");
           enviar = false;
        
    }
    if (!enviar){
    e.preventDefault();
    }
    else cadastroUsuario(nome,cpf,email,telefone)
});


