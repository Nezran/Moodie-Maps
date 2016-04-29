# Moodie-Maps

Is a plug-in Jquery for google maps.

With a json file you can put students on maps and filter it by type, section, student


#### Init plug-in

	jQuery(function ($) {
	    $(window).ready(function () {
	        $.getJSON('addresses.json', function (addresses) {
	            $("#moodie").moodie(addresses);
	        });
	    });
	});

### Materialize

Moodie use Materialize

[![Travis CI](https://travis-ci.org/Dogfalo/materialize.svg?branch=master)](https://github.com/Dogfalo/materialize)

__Created in April 2016__

