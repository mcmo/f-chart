var client = new nes.Client("wss://f-chart.herokuapp.com");

client.connect(function(err) {
  if (err) return console.log(err);

  console.log("hapi nes connected");

  var handler = function(update) {
    
    if (update.option === 'add') {
      console.log('add ' + update.symbol)
      if (names.indexOf(update.symbol) === -1) {
        addSymbol(update.symbol)
      }
    }

    if (update.option === 'delete') {
      console.log('delete', update.symbol)
      if (names.indexOf(update.symbol) !== -1) {
        $('.' + update.symbol).alert('close')
      }
    }
  }

  client.subscribe('/', handler, function(err) {
    if (err) throw err
  })

})