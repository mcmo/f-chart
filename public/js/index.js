var spinner;

var startSpinner = function() {
  var opts = {
    top: '20%'
  }
  var target = document.getElementById('container');
  spinner = new Spinner(opts).spin(target)  
}

var addSymbol = function(symbol) {
  $('.add-stock').before(`<div class="alert alert-dismissible" role="alert">
      <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
      <strong><span class="symbol ${symbol}">${symbol}</span></strong>
    </div>`)
  startSpinner()
  names.push(symbol) // add symbol to array
  Chart.getData([symbol], true)
  $('#stock-input').val('').focus()
}

var deleteSymbol = function(symbol) {
  // delete symbol from array
  var i = names.indexOf(symbol)
  if (i !== -1) {
    names.splice(i, 1)
  }
  Chart.removeSeries(symbol)
}

$(function() {
  $('form').submit(function(e) {
    e.preventDefault()
    var newSymbol = $('#stock-input').val().toUpperCase()

    if (names.indexOf(newSymbol) === -1) {
      addSymbol(newSymbol)

      $.post('/add', {
        symbol: newSymbol
      }, function(data, status) {
        console.log("Data: " + data + "\nStatus: " + status)
      })
    }
    else {
      alert(symbol + ' already exists on the chart')
    }
  })

  $('#stocks').on('close.bs.alert', '.alert', function(e) {
    var symbolToDelete = $(e.target).find('.symbol').text()
    $('#stock-input').focus()
    deleteSymbol(symbolToDelete)
    $.post('/delete', {
      symbol: symbolToDelete
    }, function(data, status) {
      console.log("Data: " + data + "\nStatus: " + status)
    })
  })

  startSpinner()
})
