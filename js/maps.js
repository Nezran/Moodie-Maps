jQuery(function ($) {
    $(window).ready(function () {
        $.getJSON('addresses.json', function (addresses) {
            $("#moodie").moodie(addresses);
        });
    });
});