var express = require('express');
var router = express.Router();
var request = require('request');


/* Aller à la homepage et être redirigé rapidement vers la page de l'application */
router.get('/', function(req, res, next) {
  res.render('welcome', { });
});

router.post('/weather', function(req, res, next) {
  if (typeof req.session.cities == "undefined") {
    req.session.cities = [];
  }
  req.session.userName = req.body.userName;
  res.render('index', { userName: req.session.userName, cities: req.session.cities});
});



//Gestion de l'ajout d'une nouvelle ville

router.post('/search', function(req, res, next) {

  // Première condition si la variable req.session.cities n'existe pas encore, c'est-à-dire si on a encore aucune ville en stock pour cette session utilisateur

  if (req.session.cities.length == 0) {
    req.session.cities = [];

    var newCity = {};
    newCity.name = req.body.inputCity;

    var requestText = "http"+"://api.openweathermap.org/data/2.5/weather?q="+req.body.inputCity+"&APPID=c0e1c5eae8f15c6836b3068ec325474d"

    request(requestText, function(error, response, body) {
        bodyModified = JSON.parse(body);

        if (bodyModified.message == "city not found") {
          res.render('errorCity', { userName: req.session.userName});
        }

        if (bodyModified.message != "city not found") {
          newCity.longitude = bodyModified.coord.lon;
          newCity.latitude = bodyModified.coord.lat;
          newCity.weatherDescription = bodyModified.weather[0].main;
          newCity.tempMin = Math.round(bodyModified.main.temp_min - 273.15);
          newCity.tempMax = Math.round(bodyModified.main.temp_max - 273.15);
          newCity.icon = "/images/"+bodyModified.weather[0].icon+".png";

          req.session.cities.push(newCity);

          res.render('index', { userName: req.session.userName, cities: req.session.cities});
        }
      })
    }


    // Ici, si req.session.cities n'est pas vide, on doit vérifier que l'on ajoute pas la même ville plusieurs fois. on va passer par une variable

    if (req.session.cities.length>0) {
      var newCity = {};
      newCity.name = req.body.inputCity;

      var isIn = "false";

      for (var j=0; j<req.session.cities.length; j++) {
        if (req.session.cities[j].name == newCity.name) {
          isIn = "true";
          res.render('index', { userName: req.session.userName, cities: req.session.cities});
        }
      }

      if (isIn == "false") {
        var requestText = "http"+"://api.openweathermap.org/data/2.5/weather?q="+req.body.inputCity+"&APPID=c0e1c5eae8f15c6836b3068ec325474d"

        request(requestText, function(error, response, body) {
            bodyModified = JSON.parse(body);

            if (bodyModified.message == "city not found") {
              res.render('errorCity', { userName: req.session.userName, cities: req.session.cities});
            }

            if (bodyModified.message != "city not found") {
              newCity.longitude = bodyModified.coord.lon;
              newCity.latitude = bodyModified.coord.lat;
              newCity.weatherDescription = bodyModified.weather[0].main;
              newCity.tempMin = Math.round(bodyModified.main.temp_min - 273.15);
              newCity.tempMax = Math.round(bodyModified.main.temp_max - 273.15);
              newCity.icon = "/images/"+bodyModified.weather[0].icon+".png";

              req.session.cities.push(newCity);

              res.render('index', { userName: req.session.userName, cities: req.session.cities});
            }
          })
      }
    }
});



// Gestion de la suppression d'une ville

router.post('/delete-city', function(req, res, next) {

  for (var j=0; j<req.session.cities.length; j++) {

          if (req.body.cityName == req.session.cities[j].name) {
            req.session.cities.splice(j, 1);
          }
  }

  res.render('index', { userName: req.session.userName, cities: req.session.cities});
});



//Gestion de redirection si une ville n'est pas présente dans la base de données de OpenWeatherMap

router.post('/return-index', function(req, res, next) {
  res.render('index', { userName: req.session.userName, cities: req.session.cities});
});



module.exports = router;
