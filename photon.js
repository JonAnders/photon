var photon = (function(){

  var canvas = document.getElementById('image-canvas');
  var selectionCanvas = document.getElementById('selection-canvas');

  var context = canvas.getContext('2d');
  var selectionContext = selectionCanvas.getContext('2d');
  var image = new Image();

  var selectionStartX = null;
  var selectionStartY = null;
  var selectionX, selectionY, selectionWidth, selectionHeight = null;

  return {
    init: function() {
      canvas.width = selectionCanvas.width = 0;
      canvas.height = selectionCanvas.height = 0;

      image.addEventListener('load', function() {
        canvas.width = selectionCanvas.width = image.width;
        canvas.height = selectionCanvas.height = image.height;
        context.drawImage(image, 0, 0);
      });

      selectionCanvas.addEventListener('mousedown', function(e){
        photon.startSelection(e.clientX, e.clientY)
      });

      document.addEventListener('mouseup', function(e){
        photon.completeSelection(e.clientX, e.clientY);
      });

      selectionCanvas.addEventListener('keydown', function(e){
        if (e.keyCode == 27) {
          photon.unselect();
        }
      });
    },
    loadFromFile: function (filePath) {
      image.src = filePath;
    },
    saveToFile: function (filePath) {
      var dataUrl = canvas.toDataURL('image/jpeg');
      var byteString = atob(dataUrl.split(',')[1]);
      var buffer = new Buffer(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
        buffer.writeUInt8(byteString.charCodeAt(i), i);
      }
      fs.writeFile(filePath, buffer, function(err){
        if (err)
          alert(err);
      });
    },
    getCanvasWidth: function() {
      return canvas.width;
    },
    getCanvasHeight: function() {
      return canvas.height;
    },
    resizeCanvas: function (width, height) {
      photon.unselect();
      var imageData = context.getImageData(0, 0, canvas.width - 1, canvas.height - 1);
      canvas.width = width;
      canvas.height = height;
      context.putImageData(imageData, 0, 0);
    },
    startSelection: function (x, y) {
      var rect = canvas.getBoundingClientRect();

      selectionStartX = x - rect.left;
      selectionStartY = y - rect.top;
    },
    completeSelection: function (x, y) {
      if (selectionStartX && selectionStartY) {
        var rect = canvas.getBoundingClientRect();
        var selectionEndX = x - rect.left;
        var selectionEndY = y - rect.top;
        if (selectionEndX < 0)
          selectionEndX = 0;
        if (selectionEndY < 0)
          selectionEndY = 0;
        if (selectionEndX > rect.width)
          selectionEndX = rect.width;
        if (selectionEndY > rect.height)
          selectionEndY = rect.height;

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
    },
    unselect: function() {
      selectionX, selectionY, selectionWidth, selectionHeight = null;
      selectionContext.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
    }
  };
}());
