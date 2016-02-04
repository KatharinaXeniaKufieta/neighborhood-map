# Neighborhood Map Project - Las Vegas

Project 5-1 of the Udacity's Front-End Nanodegree

## Getting started

Fork or clone the repository here: https://github.com/slooptb/neighborhood-map.git and load up in your web browser. Note
 an internet connection is required to use.
 
Weather data is provided via the OpenWeatherMaps API and loads current weather status, temperature (f), wind speed (meters
per second) and humidity, all pushed to the DOM via Knockout.js bindings.

Yelp data is grabbed when opening an Info Window, but is currently not rendered anywhere.

Flight Mode grabs recent airplane location data from the FlightStats API and adds plane image markers to the map
when activated.

All DOM updates are controlled via Knockout.js bindings.

## APIs

- Google Maps
- OpenWeatherMaps
- Yelp
- FlightStats (30 day trial as of 1st Feb 2016)

## Features

Using Knockout.js for data binding and Google Maps this project incorporates several APIs to produce a map with location
data for Las Vegas.

## Requirements/dependencies

- Bootstrap
- jQuery
- Knockout.js
- Google Maps
- Node/grunt for distribution

## TODO

- Figure out Info Window knockout.js bindings and how to make them work!