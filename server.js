'use strict'
require('dotenv').config()
const Hapi = require('hapi')
const Inert = require('inert')
const Vision = require('vision')
const Nes = require('nes')
const mongo = require('mongodb').MongoClient

// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname
const uri = process.env.URI

const server = new Hapi.Server()
server.connection({
  // required for Heroku
  port: process.env.PORT || 8080
})

// options for using the socket on this app
var options = {
  onConnection: function(socket) {
    // send message to all (except 1 connecting) clients
    //server.broadcast("welcome everybody!!!")
  },
  onMessage: function(socket, symbol, next) {
    // send message to all clients when receive message
    console.log('onMessage', symbol)
    server.publish('/', symbol)
  }
}

server.register([Inert, Vision, {register: Nes, options: options}], (err) => {

  if (err) throw err
  
  // the server subscription path
  server.subscription("/")

  server.views({
    engines: {
      hbs: require('handlebars')
    },
    path: './templates'
  })

  server.route([{
    path: '/assets/{path*}',
    method: 'GET',
    handler: {
      directory: {
        path: 'public',
        listing: false
      }
    }
  }, {
    path: '/',
    method: 'GET',
    handler: function(request, reply) {
      getSymbols(reply)
    }
  }, {
    path: '/add',
    method: 'POST',
    handler: function(request, reply) {
      let symbol = request.payload.symbol
      addSymbol(symbol, reply)
    }
  },{
    path: '/delete',
    method: 'POST',
    handler: function(request, reply) {
      let symbol = request.payload.symbol
      deleteSymbol(symbol, reply)
    }
  }])
})

server.start(() => console.log("server starting at:" + server.info.uri))

function getSymbols(reply) {
  mongo.connect(uri, function(err, db) {
    if (err) throw err
    var symbols = db.collection('symbols')

    symbols.findOne({}, function(err, result) {
      if (err) throw err
      if (result) {
        console.log(result.stocks)
        return reply.view('index', {
          symbols: result.stocks
        })
      }
    })
  })
}

function addSymbol(symbol, reply) {
  mongo.connect(uri, function(err, db) {
    if (err) throw err
    var symbols = db.collection('symbols')

    symbols.update({}, {
      $addToSet: {
        stocks: symbol
      }
    }, function(err, result) {
      if (err) throw err
      if (result) {
        server.publish('/', {option: 'add', symbol: symbol})
        return reply('POST to add received!')
      }
    })
  })
}

function deleteSymbol(symbol, reply) {
  mongo.connect(uri, function(err, db) {
    if (err) throw err
    var symbols = db.collection('symbols')

    symbols.update({}, {
      $pull: {
        stocks: symbol
      }
    }, function(err, result){
      if (err) throw err
      if (result){
        server.publish('/', {option: 'delete', symbol: symbol})
        return reply('POST to delete received')        
      }
    })
  })
}
