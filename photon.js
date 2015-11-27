var photon = (function(){

  var selectionStartX = null;
  var selectionStartY = null;
  var selectionX, selectionY, selectionWidth, selectionHeight = null;

  return {
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
    },
    unselect: function() {
      selectionX, selectionY, selectionWidth, selectionHeight = null;
      selectionContext.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
    }
  };
}());
