
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
        blurb: 'Test 1'
    },
    {
        name: "Sur La Table",
        location: {
            lat: 36.1389592,
            lon: -115.3213893
        },
        blurb: 'Test 2'
    },
    {
        name: "Exploration Peak",
        location: {
            lat: 36.0172112,
            lon: -115.2681969
        },
        blurb: 'Test 2'
    },
    {
        name: "The Cornish Pasty Co.",
        location: {
            lat: 36.1425409,
            lon: -115.1447422
        },
        blurb: 'Test 2'
    },
    {
        name: "Sam Boyd Stadium",
        location: {
            lat: 36.0859393,
            lon: -115.0194987
        },
        blurb: 'Test 2'
    }
];

var viewModel = function() {
    var self = this;

    self.markerPins = ko.observableArray([]);
    markerData.forEach(function(marker) {
        self.markerPins.push(new Marker(marker.name, marker.location.lat, marker.location.lon, marker.blurb));
    });

    self.isVisibleToggle = function(data) {
        if(data.isVisible()) {
            data.isVisible(false);
        } else {
            data.isVisible(true);
        }
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

            result = ko.utils.arrayFilter(self.markerPins(), function(search) {
                return search.title().toLowerCase() == self.filterString().toLowerCase();
            });

            result.forEach(function(item) {
                item.isVisible(true);
            });

            return result;
        }
    });
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

    // All click listener and set content
    self.marker.addListener('click', function() {
        infoWindow.setContent(self.title());
        infoWindow.open(map, this);
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
    infoWindow = new google.maps.InfoWindow();


    ko.applyBindings(new viewModel());
};