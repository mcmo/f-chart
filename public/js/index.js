var spinner;
$(function() {
  $('.add').click(function() {
    var newStock = $('#stock-input').val().toUpperCase()
    $('.add-stock').before(`<div class="alert alert-dismissible" role="alert">
      <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
      <strong><span class="symbol">${newStock}</span></strong>
    </div>`)
    $('#stock-input').val('').focus()
    Chart.getData([newStock], true)
    $.post('/add', {symbol: newStock}, function(data, status){
      console.log("Data: " + data + "\nStatus: " + status)
    })
  })

  $('#stocks').on('close.bs.alert', '.alert', function(e) {
    var symbolToDelete = $(e.target).find('.symbol').text()
    $('#stock-input').focus()
    Chart.removeSeries(symbolToDelete)
    $.post('/delete', {symbol: symbolToDelete}, function(data, status){
      console.log("Data: " + data + "\nStatus: " + status)
    })
  })
  
  var opts = {top: '20%'}
  var target = document.getElementById('container')
  spinner = new Spinner(opts).spin(target);
})
