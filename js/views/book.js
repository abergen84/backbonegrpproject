(function(window, undefined) {
    //"use strict";
var object = {};

_.extend(object, Backbone.Events);

object.on("alert", function(msg) {
  alert("" + msg);
});

object.trigger("alert", "Welcome to our page");

    var containerView = Backbone.View.extend({
        tagName: "div",
        idName: "container",
        initialize: function(opts) {
            this.options = _.extend({}, {
                    $container: $('.grid')
                },
                opts
            );
            //put element into DOM
            this.options.$container.append(this.el);
            this.render();
        },

        template: "<img src={volumeInfo.imageLinks.thumbnail}/>",
        events: {
            "click": "handleClick"
        },
        handleClick: function(event) {
            $.publish("bookSelected", this.model);
        },
        render: function() {
            this.el.innerHTML = _.template(this.template, this.model);
        }
    });

    var rightContainerView = Backbone.View.extend({
        el: document.querySelector("#rightContainer"),
        initialize: function(opts) {
            this.options = _.extend({}, opts);

            var self = this;
            $.subscribe("bookSelected", function(event, data) {
                // data is the model passed from $.publish()
                self.render(data);
            });
        },
        templateHTML: $('#bookTemplate').html(),
        render: function(data) {
            this.el.innerHTML = _.template(this.templateHTML, data);
        }
    });
    var footerView = Backbone.View.extend({
        el: document.querySelector("#footer"),
        initialize: function(opts) {
            this.options = _.extend({}, opts);

            var self = this;
            $.subscribe("bookSelected", function(event, data) {
                // data is the model passed from $.publish()
                self.render(data);
            });
        },
        templateHTML: $('#footTemplate').html(),
        render: function(data) {
            this.el.innerHTML = _.template(this.templateHTML, data);
        }
    });

    function GoogleBook(options) {
        this.options = _.extend({}, options, {
            key: "AIzaSyBU9KgSbBKQMno6QgEoB75TPSRN1c16fLI",
        });
        this.rightContainerView = new rightContainerView();
        this.footerView = new footerView();
        this.Routing();
    }
        //https://www.googleapis.com/books/v1/volumes?q=search+terms:keyes&key=AIzaSyBU9KgSbBKQMno6QgEoB75...

    GoogleBook.prototype.createInputObject = function() {

        var input = {};
        $(':input').each(function() {
            input[this.name] = this.value;
        });
        console.log(input);
        return input;

    }

    GoogleBook.prototype.queryAPI = function() {

        var input = this.createInputObject();

        var url = [
            "https://www.googleapis.com/books/v1/volumes",
            "?q=",
            input.genre,
            "&key=",
            this.options.key,
        ].join('');

        console.log(url);

        return $.get(url).then(function(data) {
            console.log(data);
            return data;
        });
    }

    GoogleBook.prototype.makeGoogleBookRequest = function(data) {
        $.when(
            this.queryAPI(data)
        ).then(function(data) {
            console.log(data);
            //debugger;
            if (!(data.items instanceof Array)

            ) {
                throw new Error("Shit Doesn't Work!");
            }
            data.items.forEach(function(data) {
                new containerView({
                    model: data
                });
            });
        });
    }

    GoogleBook.prototype.Routing = function() {

        var self = this;

        Path.map("#/results").to(function() {

            self.makeGoogleBookRequest();

        });

        Path.root("#/")
        Path.listen();
    }

    window.GoogleBook = GoogleBook;

})(window, undefined);
