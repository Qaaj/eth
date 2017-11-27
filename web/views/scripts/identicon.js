document.addEventListener("DOMContentLoaded", function(){
  var elements = document.getElementsByClassName('identicon');
  Array.from(elements).forEach(item => {
    identicon.generate({ id: item.title, size: 50 }, function(err, buffer) {
      if (err) throw err;
      var img = new Image();
      img.src = buffer;
      item.style = "width: 50px; height: 50px;"
      item.appendChild(img);
    });
  });
});