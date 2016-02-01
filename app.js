require('dotenv').load();

var express         = require('express');
var app             = express();
var bodyParser      = require('body-parser');
var port            = process.env.PORT;
var router          = express.Router();
var models          = require('./app/models');

// Controllers
var UserController      = require('./app/controllers/users');
var CompanyController   = require('./app/controllers/companies');
var CardController      = require('./app/controllers/cards');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

router.get('/', function(req, res){
  res.json({ message: 'CLIFRE API :)' });
});

app.use([router, UserController, CompanyController, CardController]);

models
  .sequelize
  .sync()
  .then(function() {
    app.listen(port);
  })
.catch(function(err) {
  throw err;
});
