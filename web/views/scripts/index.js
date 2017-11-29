document.addEventListener("DOMContentLoaded", function () {
  document.removeEventListener("DOMContentLoaded", this);

  var btnGo = document.getElementById('btnGo');

  btnGo.addEventListener('click', (data) => {
    var txtInput = document.getElementById('txtTopHeaderInput');

    console.log('Txt input value = ', txtInput.value);
    window.location = '/search/' + txtInput.value;
  });

});
