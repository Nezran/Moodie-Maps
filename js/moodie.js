// AIzaSyDwiI9w86obegz-3HY6UZK9P2p48LvnUB0

(function ($, window, document, undefined) {

    document.write('<scr' + 'ipt type="text/javascript" src="https://maps.googleapis.com/maps/api/js" ></scr' + 'ipt>');

    // ajout d'une méthode pour array()
    Array.prototype.indexOfObjectBy = function (key, finder_object) {
        index = -1;
        var self = this;
        this.forEach(function (object) {
            if (index < 0 && object[key] == finder_object[key]) index = self.indexOf(object);
        });
        return index;
    };

    function Moodie(element, data, options) {
        this.$element = $(element);
        this.options = options;

        this.$map = null; // objet jquery avec convention $variable
        this.$types = null;
        this.$students = null;
        this.$sections = null;


        this.info_window = null;

        this.map = null;
        this.current_position = {
            lat: 46.7773329,
            lng: 6.6326846
        };

        this.addresses = [];
        this.types = [];
        this.students = [];
        this.sections = [];

        // Géolocatisation pour trouver l'utilisateur
        this.geofinder();

        // Initialiser html et carte google maps
        this.init();

        // Parser les données et initialisation des objets
        this.parse(data);

        this.markers();

        // Remplir l'html et mettre les events
        this.fillhtml();

        // Refresh l'interface
        this.refresh();

        // Plugin init goes here...

    }

    Moodie.prototype = {
        // Récupère la position
        geofinder: function () {
            if (!navigator.geolocation) return false;
            var self = this;
            navigator.geolocation.getCurrentPosition(function (position) {
                self.current_position = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
            });
        },
        // init du programme, conteneurs html, materializee accordeon et map
        init: function () {
            this.$element.addClass('moodiestyle');

            var $mapcontainer = $('<div/>').addClass('moodiemap').appendTo(this.$element);


            this.$map = $('<div/>').addClass('moodiemapinner').appendTo($mapcontainer);
            var $sidebar = $('<div/>').addClass('moodiesidebar').appendTo($mapcontainer);

            $('<h4/>').text("Filters").appendTo($sidebar);
            var $row = $('<div/>', {class: "row"}).appendTo($sidebar);


            var $col = $('<div/>', {class: "col s12 m2"}).appendTo($row);
            var $head1 = $('<ul/>', {class: "collapsible", "data-collapsible": "accordion"}).appendTo($col);
            var $li1 = $('<li/>').appendTo($head1);
            $('<div/>', {class: "collapsible-header"}).html("<h5>Sections</h5>").appendTo($li1);
            var $collheader = $('<div/>', {class: "collapsible-body"}).appendTo($li1);
            this.$sections = $('<ul/>').appendTo($collheader);


            var $col = $('<div/>', {class: "col s12 m2"}).appendTo($row);
            var $head1 = $('<ul/>', {class: "collapsible", "data-collapsible": "accordion"}).appendTo($col);
            var $li1 = $('<li/>').appendTo($head1);
            $('<div/>', {class: "collapsible-header"}).html("<h5>Types</h5>").appendTo($li1);
            var $collheader = $('<div/>', {class: "collapsible-body"}).appendTo($li1);
            this.$types = $('<ul/>').appendTo($collheader);


            var $col = $('<div/>', {class: "col s12 m8"}).appendTo($row);
            var $head1 = $('<ul/>', {class: "collapsible", "data-collapsible": "accordion"}).appendTo($col);
            var $li1 = $('<li/>').appendTo($head1);
            $('<div/>', {class: "collapsible-header"}).html("<h5>Students</h5>").appendTo($li1);
            var $collheader = $('<div/>', {class: "collapsible-body"}).appendTo($li1);
            this.$students = $('<ul/>').appendTo($collheader);

            $('.collapsible').collapsible({
                accordion: false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
            });


            var mapoptions = {
                center: this.current_position,
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.HYBRID
            };
            //mapoptions = $({}, mapoptions, this.options.map);
            console.log(mapoptions);
            this.map = new google.maps.Map(this.$map[0], mapoptions);

        },
        // parse les donnnées pour les rajouter à l'objet moodie
        parse: function (data) {
            var self = this;
            $.each(data, function (key, address) {
                address.type.show = true;
                if (self.types.indexOfObjectBy("name", address.type) < 0) self.types.push(address.type);
                address.type = self.types[self.types.indexOfObjectBy("name", address.type)];

                address.student.section.show = true;
                if (self.sections.indexOfObjectBy("id", address.student.section) < 0) self.sections.push(address.student.section);
                address.student.section = self.sections[self.sections.indexOfObjectBy("id", address.student.section)];

                address.student.show = true;
                if (self.students.indexOfObjectBy("id", address.student) < 0) self.students.push(address.student);
                address.student = self.students[self.students.indexOfObjectBy("id", address.student)];

                self.addresses.push(address);
            });
        },
        // On génère les markers
        markers: function () {
            var self = this;
            $.each(this.addresses, function (key, address) {
                if (!address.coords) address.coords = self.geocode(address);
                address.marker = new google.maps.Marker({
                    map: self.map,
                    position: address.coords,
                    visible: false,
                    icon: "http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=" + address.type.icon + "|" + address.student.color.substring(1)
                });
                address.marker.addListener('click', function () {
                    if (self.info_window) self.info_window.close();
                    self.info_window = new google.maps.InfoWindow({
                        content: '<h5>' + (address.host ? address.host + ', ' : '') + address.street + ', ' + address.city + ', ' + address.country + '</h5><div style="display:table; width:100%;"><div style="display:table-cell; vertical-align:top;"><table class=""><tr><th>Student</th><td>' + address.student.name + '</td></tr><tr><th>Email</th><td><a href="mailto:"></a></td></tr><tr><th>Phone</th><td></td></tr><tr><th>Section</th><td>' + address.student.section.name + '</td></tr></table></div></div>',
                        maxWidth: 1001,
                    });
                    self.info_window.open(self.map, this);
                });

            });

            // map - position - visible - icon              

        },
        // on Génère l'html pour les filtres
        fillhtml: function () {
            var self = this;

            $.each(this.sections, function (key, section) {
                $('<li/>')
                    .text(section.name)
                    .appendTo(self.$sections)
                    .addClass("waves-effect waves-light btn deep-purple")
                    .click(function (e) {
                        e.preventDefault();
                        section.show = !section.show;
                        $(this).toggleClass("disabled", !section.show);
                        self.refresh();
                    });
            });

            $.each(this.types, function (key, type) {
                $('<li/>')
                    .text(type.name)
                    .appendTo(self.$types)
                    .addClass("waves-effect waves-light btn deep-purple")
                    .click(function (e) {
                        e.preventDefault();
                        type.show = !type.show;
                        $(this).toggleClass("disabled", !type.show);
                        self.refresh();
                    });
            });

            $.each(this.students, function (key, student) {
                $('<li/>')
                    .text(student.name)
                    .appendTo(self.$students)
                    .addClass("waves-effect waves-light btn deep-purple")
                    .click(function (e) {
                        e.preventDefault();
                        student.show = !student.show;
                        $(this).toggleClass("disabled", !student.show);
                        self.refresh();
                    });
            });

        },
        // refresh la map pour les markers et le bound
        refresh: function () {
            var self = this;
            var bound = new google.maps.LatLngBounds();
            $.each(this.addresses, function (key, address) {
                var is_visible = (address.type.show && address.student.show && address.student.section.show);
                if (address.marker.getPosition()) {
                    address.marker.setVisible(is_visible);
                    if (is_visible) bound.extend(address.marker.getPosition());
                }
            });
            if (bound.isEmpty()) this.map.setCenter(this.current_position);
            else this.map.fitBounds(bound);
        },
        // recherche avec l'adresse pour avoir les coords lat/lng
        geocode: function (address) {
            var urlcode = "https://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURIComponent(address.street + "," + address.city + "," + address.country);
            var responsegoogle = $.ajax(urlcode, {
                dataType: "json",
                async: false
            }).responseJSON;
            if (responsegoogle.status != "OK") {
                console.info(responsegoogle.status, urlcode, responsegoogle.results);
                return null;
            }
            return responsegoogle.results[0].geometry.location;
        }
    };


///////////////////////////////////////////////////////////////////////////
    // Plugin Definition //
    $.fn.moodie = function (data, options) {
        if (typeof options == 'string') {
            var plugin = this.data('moodie');
            if (plugin) {
                var r = plugin[options].apply(plugin, Array.prototype.slice.call(arguments, 1));
                if (r) return r
            }
            return this
        }

        options = $.extend({}, $.fn.moodie.defaults, options);

        return this.each(function () {
            var plugin = $.data(this, 'moodie');
            if (!plugin) {
                plugin = new Moodie(this, data, options);
                $.data(this, 'moodie', plugin);
            }
        });
    };
    $.fn.moodie.defaults = {
        map: {}
    };

})(jQuery, window, document);