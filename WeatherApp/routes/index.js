var express = require('express');
var router = express.Router();
var request = require('request');

var cities = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('welcome', { });
});

router.post('/weather', function(req, res, next) {
  req.session.userName = req.body.userName;
  res.render('index', { userName: req.session.userName, cities});
});


//Gestion de l'ajout d'une nouvelle ville

router.post('/search', function(req, res, next) {


  var newCity = {};
  newCity.name = req.body.inputCity;

  var requestText = "http"+"://api.openweathermap.org/data/2.5/weather?q="+req.body.inputCity+"&APPID=c0e1c5eae8f15c6836b3068ec325474d"

  request(requestText, function(error, response, body) {
      bodyModified = JSON.parse(body);

      newCity.longitude = bodyModified.coord.lon;
      newCity.latitude = bodyModified.coord.lat;
      newCity.weatherDescription = bodyModified.weather[0].main;
      newCity.tempMin = Math.round(bodyModified.main.temp_min -273.15);
      newCity.tempMax = Math.round(bodyModified.main.temp_max -273.15);
      newCity.icon = "/images/"+bodyModified.weather[0].icon+".png";

      console.log(newCity);

      cities.push(newCity);

      res.render('index', { userName: req.session.userName, cities});
    })

});


// Gestion de la suppression d'une ville

router.post('/delete-city', function(req, res, next) {

  console.log(req.body);

  for (var j=0; j<cities.length; j++) {

          if (req.body.cityName == cities[j].name) {
            cities.splice(j, 1);
          }
  }

  res.render('index', { userName: req.session.userName, cities});
});


module.exports = router;
