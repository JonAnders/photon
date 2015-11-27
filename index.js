var remote = require('remote');
var Menu = remote.require('menu');
var dialog = remote.require('dialog');
var fs = require('fs');

photon.init();

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
            photon.loadFromFile(imagePaths[0]);
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

          photon.saveToFile(imagePath);
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

          widthInput.value = photon.getCanvasWidth();
          heightInput.value = photon.getCanvasHeight();

          submit.addEventListener('click', function() {
            photon.resizeCanvas(widthInput.value, heightInput.value);
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
