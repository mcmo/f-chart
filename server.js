'use strict'
require('dotenv').config()
const Hapi = require('hapi')
const mongo = require('mongodb').MongoClient

// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname
const uri = process.env.URI

const server = new Hapi.Server()
server.connection({
  // required for Heroku
  port: process.env.PORT || 8080
})

server.register([require('inert'), require('vision')], (err) => {

  if (err) throw err

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
      reply('hapi is happy')
    }
  }, {
    path: '/chart',
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

server.start(() => console.log('Started'))

function getSymbols(reply) {
  mongo.connect(uri, function(err, db) {
    if (err) throw err
    var symbols = db.collection('symbols')

    symbols.findOne({}, function(err, result) {
      if (err) throw err
      if (result) {
        console.log(result.stocks)
        reply.view('index', {
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
        console.log(result.result)
        reply('POST to add received!')
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
      console.log(result)
      if (result){
        reply('POST to delete received')        
      }
    })
  })
}
