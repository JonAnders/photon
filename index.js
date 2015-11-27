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

selectionCanvas.addEventListener('mousedown', function(e){
  console.log('document mousedown');
  photon.startSelection(e.clientX, e.clientY)
});

document.addEventListener('mouseup', function(e){
  console.log('document mouseup');
  photon.completeSelection(e.clientX, e.clientY);
});

selectionCanvas.addEventListener('keydown', function(e){
  console.log('keydown');
  if (e.keyCode == 27) {
    photon.unselect();
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
