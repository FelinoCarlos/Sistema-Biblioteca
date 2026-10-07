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