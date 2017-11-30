document.addEventListener("DOMContentLoaded", function () {
    document.removeEventListener("DOMContentLoaded", this);

    document.getElementById('btnGo').addEventListener('click', () => {
        var txtInput = document.getElementById('txtTopHeaderInput');
        window.location = '/search/' + txtInput.value;
    });

    document.getElementById('faucet').addEventListener('click', () => {
        var txtInput = document.getElementById('faucet_input');
        window.location = '/faucet/' + txtInput.value;
    });

});
