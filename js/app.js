// Globals
var infoWindow,
    $infoWindowContent = $('#info-window-template');

// Make the menu
$(document).ready(function(){

    $('#nav-expander').on('click',function(e){
        e.preventDefault();
        $('body').toggleClass('nav-expanded');
    });
    $('#nav-close').on('click',function(e){
        e.preventDefault();
        $('body').removeClass('nav-expanded');
    });

});

var initMap = function() {
    // Make the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 36.16,
            lng: -115.19
        },
        zoom: 10
    });

    // Make the info window
    infoWindow = new google.maps.InfoWindow({
        // Content is a hidden div in the DOM to easily manage KO bindings
        content: $infoWindowContent[0]
    });

    // When closing info window append content to body to retain ko bindings
    google.maps.event.addListener(infoWindow, "closeclick", function () {
        $("body").append($infoWindowContent);
    });
};

// OpenWeather API call. Passes in viewModel context (self).
var weather = function(self) {

    var settings = {
        url: '//api.openweathermap.org/data/2.5/weather',
        data: {
            id: '5506956',
            units: 'imperial',
            APPID: '868189a81b76adbe0632ec5c77508e39'
        },
        dataType: 'json',
        success: function(result) {
            self.weatherData.temp(Math.round(result.main.temp) + 'F');
            self.weatherData.status(result.weather[0].main);
            self.weatherData.statusDesc(result.weather[0].description);
            self.weatherData.windSpeed(result.wind.speed);
            self.weatherData.humidity(result.main.humidity);
        },
        fail: function(error) {
            console.log(error);
        }
    };

    // Send request
    $.ajax(settings);
};

// Yelp API call. Passes is item to make call for.
var yelp = function(self, item) {

    // clear previous data
    self.yelpData.img('');
    self.yelpData.stars('');
    self.yelpData.url('');

    function nonce_generate() {
        return (Math.floor(Math.random() * 1e12).toString());
    }

    var yelp_url = 'https://api.yelp.com/v2/search';

    var parameters = {
        oauth_consumer_key: 'TaoAvaw-MM7bqlB9PRy8Iw',
        oauth_token: 'NPYotgIFRKcr9Ghi1QXHW4iT-eHiYQOz',
        oauth_nonce: nonce_generate(),
        oauth_timestamp: Math.floor(Date.now() / 1000),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0',
        location: 'Las Vegas',
        term: item.title(),
        limit: 1,
        callback: 'cb'
    };

    parameters.oauth_signature = oauthSignature.generate('GET', yelp_url, parameters, 'VY0siP_qYDDY3PHld3ncpMcynZs', 'E77kPAX3kUMzjXeHZsXZupO9ApE');

    var settings = {
        url: yelp_url,
        data: parameters,
        cache: true,
        dataType: 'jsonp',
        success: function (results) {
            // Set new data values
            self.yelpData.img(results.businesses[0].image_url);
            self.yelpData.stars(results.businesses[0].rating_img_url_small);
            self.yelpData.url(results.businesses[0].url);
        },
        fail: function () {
            console.log('fail');
            // Do stuff on fail
        }
    };

// Send AJAX query via jQuery library.
    $.ajax(settings);

};


// Data model
var markerData = [
    {
        name: 'Super Summer Theatre',
        location: {
            lat: 36.0688477,
            lon: -115.4556288
        },
        img: '',
        blurb: 'Test 1',
        info: {
            indoor: false,
            events: true
        }
    },
    {
        name: "Sur La Table",
        location: {
            lat: 36.1389592,
            lon: -115.3213893
        },
        blurb: 'Test 2',
        info: {
            indoor: true,
            events: false
        }
    },
    {
        name: "Exploration Peak",
        location: {
            lat: 36.0172112,
            lon: -115.2681969
        },
        blurb: 'Test 2',
        info: {
            indoor: false,
            events: false
        }
    },
    {
        name: "The Cornish Pasty Co.",
        location: {
            lat: 36.1425409,
            lon: -115.1447422
        },
        blurb: 'Test 2',
        info: {
            indoor: true,
            events: false
        }
    },
    {
        name: "Sam Boyd Stadium",
        location: {
            lat: 36.0859393,
            lon: -115.0194987
        },
        blurb: 'Test 2',
        info: {
            indoor: false,
            events: true
        }
    },
    {
        name: "Thomas & Mack Center",
        location: {
            lat: 36.1049243,
            lon: -115.1464457
        },
        blurb: 'Test 2',
        info: {
            indoor: true,
            events: true
        }
    },
    {
        name: "T-Mobile Arena",
        location: {
            lat: 36.1026098,
            lon: -115.179217
        },
        blurb: 'Test 2',
        info: {
            indoor: true,
            events: true
        }
    },
    {
        name: "Brooklyn Bowl Las Vegas",
        location: {
            lat: 36.1175163,
            lon: -115.1718257
        },
        blurb: 'Test 2',
        info: {
            indoor: true,
            events: true
        }
    },
    {
        name: "Dino's Lounge",
        location: {
            lat: 36.1525036,
            lon: -115.1541446
        },
        blurb: 'Test 2',
        info: {
            indoor: true,
            events: false
        }
    }
];

var viewModel = function() {
    var self = this;

    self.flightArray = ko.observableArray([]);

    // Build markerPins array to track data
    self.markerPins = ko.observableArray([]);
    markerData.forEach(function(marker) {
        self.markerPins.push(new Marker(marker.name, marker.location.lat, marker.location.lon, marker.blurb));
    });

    // Set click handler to markers
    self.markerPins().forEach(function(item) {
        item.marker.addListener('click', function() {
            self.openInfoWindow(item);
        });
    });


    self.isVisibleToggle = function(data) {
        if(data.isVisible()) {
            data.isVisible(false);
        } else {
            data.isVisible(true);
        }
    };

    // Set weather info
    self.weatherData = {
        temp: ko.observable(),
        status: ko.observable(),
        statusDesc: ko.observable(),
        windSpeed: ko.observable(),
        humidity: ko.observable()
    };



    // Info window properties via APIs
    self.selected = ko.observable({}); // Current selected marker
    self.yelpData = {
        img: ko.observable(''),
        stars: ko.observable(''),
        url: ko.observable('')
    };





    // Info window controller
    self.openInfoWindow = function(item) {

        // Animate marker for small period
        item.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            item.marker.setAnimation(null);
        }, 1500);

        self.selected(item); // set selected marker
        yelp(self, item); // call Yelp API
        infoWindow.open(map, item.marker);
    };

    self.filterString = ko.observable();

    self.filterMarkers = ko.computed(function() {

        // Close info window and append to body to keep ko bindings intact when calling this search function
        $("body").append($infoWindowContent);
        infoWindow.close();

        // Clear out all markers when this function is called
        self.markerPins().forEach(function(item) {
            item.isVisible(false);
        });

        // If the search box is empty show all the markers
        if(!self.filterString()) {

            // Show all markers when search string is blank
            self.markerPins().forEach(function(item) {
                item.isVisible(true);
            });
            return self.markerPins();

        } else {

            // Make a new array of markers we want
            result = ko.utils.arrayFilter(self.markerPins(), function(search) {
                // This just sees if the search term matches any part of the marker title
                return search.title().toLowerCase().indexOf(self.filterString().toLowerCase()) >= 0;
            });

            // Make these markers visible
            result.forEach(function(item) {
                item.isVisible(true);
            });

            return result;
        }
    });

    // Get weather
    weather(self);


    self.flightModeOn = function() {
        var url ='https://api.flightstats.com/flex/flightstatus/rest/v2/jsonp/flightsNear/36.4/-115.5/36.0/-114.9?appId=92c5ecde&appKey=5d44b9913dfff04d98301c8033c6cc76&maxFlights=15';
        var settings = {
            url: url,
            dataType: 'jsonp',
            jsonpCallback: 'cb',
            success: function(result) {

                // Clear flight data and remove markers
                for (var i = 0; i < self.flightArray().length; i++) {
                    self.flightArray()[i].setMap(null);
                }
                self.flightArray([]);

                // Make each marker
                var image = 'img/plane.png';
                result.flightPositions.forEach(function(item) {
                    self.flightArray.push(new google.maps.Marker({
                        position: {lat: item.positions[0].lat, lng: item.positions[0].lon},
                        map: map,
                        icon: image
                    }))
                });
            },
            fail: function() {
                console.log('Fail');
            }
        };

        $.ajax(settings);
    };

    // Turn each marker view off then clear array
    self.flightModeOff = function() {
        for (var i = 0; i < self.flightArray().length; i++) {
            self.flightArray()[i].setMap(null);
        }
        self.flightArray([]);
    };

};

// Marker class that makes our map markers and stores their data
var Marker = function(title, lat, lng, blurb) {

    var self = this;

    self.title = ko.observable(title);
    self.blurb = ko.observable(blurb);
    self.lat = ko.observable(lat);
    self.lng = ko.observable(lng);

    // Create actual marker
    self.marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat,lng),
        animation: google.maps.Animation.DROP
    });

    // Setup KO subscription to the marker
    self.isVisible = ko.observable(false);
    self.isVisible.subscribe(function(currentState) {
        if(currentState) {
            self.marker.setMap(map);
        } else {
            self.marker.setMap(null);
        }
    });
};

// When google maps has loaded kick things off
var init = function() {
    initMap();



    ko.applyBindings(new viewModel());
};

