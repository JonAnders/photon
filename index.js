var remote = require('remote');
var Menu = remote.require('menu');
var dialog = remote.require('dialog');
var fs = require('fs');

var canvas = document.getElementById('image-canvas');
var selectionCanvas = document.getElementById('selection-canvas');
canvas.width = selectionCanvas.width = 0;
canvas.height = selectionCanvas.height = 0;
var context = canvas.getContext('2d');
var selectionContext = selectionCanvas.getContext('2d');
var image = new Image();
image.onload = function() {
  canvas.width = selectionCanvas.width = image.width;
  canvas.height = selectionCanvas.height = image.height;
  context.drawImage(image, 0, 0);
};

var selectionStartX = null;
var selectionStartY = null;
var selectionX, selectionY, selectionWidth, selectionHeight = null;

selectionCanvas.addEventListener('mousedown', function(e){
  console.log('document mousedown');
  var rect = canvas.getBoundingClientRect();
  var isInsideCanvas = e.clientX >= rect.left
                       && e.clientX <= rect.left + rect.width
                       && e.clientY >= rect.top
                       && e.clientY <= rect.top + rect.height;
  console.log('isInsideCanvas: ' + isInsideCanvas);
  if (isInsideCanvas) {
    selectionStartX = e.clientX - rect.left;
    selectionStartY = e.clientY - rect.top;
  }
  else {
    selectionStartX = null;
    selectionStartY = null;
  }
});

document.addEventListener('mouseup', function(e){
  console.log('document mouseup');
  if (selectionStartX && selectionStartY) {
    var rect = canvas.getBoundingClientRect();
    var selectionEndX = e.clientX - rect.left;
    var selectionEndY = e.clientY - rect.top;
    if (selectionEndX < 0)
      selectionEndX = 0;
    if (selectionEndY < 0)
      selectionEndY = 0;
    if (selectionEndX > rect.width)
      selectionEndX = rect.width;
    if (selectionEndY > rect.height)
      selectionEndY = rect.height;
    console.log('(' + selectionStartX + ', ' + selectionStartY + ') => ('
              + selectionEndX + ', ' + selectionEndY + ')');

    selectionX = Math.min(selectionStartX, selectionEndX);
    selectionY = Math.min(selectionStartY, selectionEndY);
    selectionWidth = Math.max(selectionStartX, selectionEndX) - selectionX;
    selectionHeight = Math.max(selectionStartY, selectionEndY) - selectionY;

    selectionContext.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
    selectionContext.beginPath();
    selectionContext.rect(selectionX + 0.5, selectionY + 0.5,
                          selectionWidth - 1, selectionHeight - 1);
    selectionContext.strokeStyle = '#000';
    selectionContext.setLineDash([5, 4]);
    selectionContext.lineDashOffset = 0;
    selectionContext.stroke();

    selectionContext.rect(selectionX + 0.5, selectionY + 0.5,
                          selectionWidth - 1, selectionHeight - 1);
    selectionContext.strokeStyle = '#fff';
    selectionContext.setLineDash([3, 6]);
    selectionContext.lineDashOffset = 5;
    selectionContext.stroke();

    selectionStartX = null;
    selectionStartY = null;
  }
});

selectionCanvas.addEventListener('keydown', function(e){
  console.log('keydown');
  if (e.keyCode == 27) {
    selectionX, selectionY, selectionWidth, selectionHeight = null;
    selectionContext.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
  }
})

var appMenu = Menu.getApplicationMenu();
var menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        click: function() {
          var imagePaths = dialog.showOpenDialog({ properties: ['openFile']});
          if (imagePaths)
            image.src = imagePaths[0];
        }
      },
      {
        label: 'Save'
      },
      {
        label: 'Save As',
        click: function() {
          var imagePath = dialog.showSaveDialog({
            filters:
              [
                { name: 'jpg', extensions: ['jpg'] }
              ]
            });
          if (!imagePath)
            return;

          var dataUrl = canvas.toDataURL('image/jpeg');
          var byteString = atob(dataUrl.split(',')[1]);
          var buffer = new Buffer(byteString.length);
          for (var i = 0; i < byteString.length; i++) {
            buffer.writeUInt8(byteString.charCodeAt(i), i);
          }
          fs.writeFile(imagePath, buffer, function(err){
            if (err)
              alert(err);
          })
        }
      }
    ]
  },
  {
    label: 'Image',
    submenu: [
      {
        label: 'Resize canvas',
        click: function() {
          var dialog = document.getElementById('resize-dialog');
          var widthInput = document.getElementById('resize-width');
          var heightInput = document.getElementById('resize-height');
          var submit = document.getElementById('resize-submit');

          widthInput.value = canvas.width;
          heightInput.value = canvas.height;

          submit.addEventListener('click', function() {
            var imageData = context.getImageData(0, 0, canvas.width - 1, canvas.height - 1);
            canvas.width = widthInput.value;
            canvas.height = heightInput.value;
            context.putImageData(imageData, 0, 0);
          });

          dialog.addEventListener('click', function(e) {
            var rect = dialog.getBoundingClientRect();
            var isInsideDialog = e.clientX >= rect.left
                                 && e.clientX <= rect.left + rect.width
                                 && e.clientY >= rect.top
                                 && e.clientY <= rect.top + rect.height;
            if (!isInsideDialog)
              dialog.close();
          });

          dialog.showModal();
        }
      }
    ]
  }
];
var menu = Menu.buildFromTemplate(menuTemplate);
appMenu.insert(1, menu.items[0]);
appMenu.insert(3, menu.items[1]);
Menu.setApplicationMenu(appMenu);
