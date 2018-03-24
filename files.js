var express    = require('express')
var serveIndex = require('serve-index')

var app = express()

// Serve URLs like /ftp/thing as public/ftp/thing
// The express.static serves the file contents
// The serveIndex is this module serving the directory
//app.use('/ftp', express.static('public/ftp'), serveIndex('public/ftp', {'icons': true}))
app.use('/records', serveIndex('public')); // shows you the file list
app.use('/records', express.static('public')); // serve the actual files
//app.use(express.static('public'))

// Listen
app.listen(3000)