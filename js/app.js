
// Make the menu
$(document).ready(function(){

    //Navigation Menu Slider
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
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 36.16,
            lng: -115.19
        },
        zoom: 10
    });
};

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

    // Info window properties via APIs
    self.selected = ko.observable({}); // Current selected marker
    self.yelpData = {
        img: ko.observable(''),
        stars: ko.observable(''),
        url: ko.observable('')
    };


    // Info window controller
    self.openInfoWindow = function(item) {
        self.selected(item); // set selected marker

        self.yelp(item); // call Yelp API
        infoWindow.open(map, item.marker);
    };

    self.filterString = ko.observable();

    self.filterMarkers = ko.computed(function() {

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

    self.yelp = function(item) {

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
            callback: 'cb'              // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
        };

        parameters.oauth_signature = oauthSignature.generate('GET', yelp_url, parameters, 'VY0siP_qYDDY3PHld3ncpMcynZs', 'E77kPAX3kUMzjXeHZsXZupO9ApE');

        var settings = {
            url: yelp_url,
            data: parameters,
            cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
            dataType: 'jsonp',
            success: function (results) {
                console.log(results);
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

};

var Marker = function(title, lat, lng, blurb) {

    // Allow marker data to be accessible via InfoWindow
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

    var $node = $('#info-window-template');

    infoWindow = new google.maps.InfoWindow({
        content: $node[0]
    });

    google.maps.event.addListener(infoWindow, "closeclick", function () {
        //google maps will destroy this node and knockout will stop updating it
        //add it back to the body so knockout will take care of it
        $("body").append($node);
    });
    ko.applyBindings(new viewModel());
};

