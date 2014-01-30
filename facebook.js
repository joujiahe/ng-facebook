(function(angular) {
'use strict';

angular.module('ngFacebook', [])

.provider('ngFacebook', function() {
    // Encapsulate Facebook configs
    var configs = undefined;
    this.setConfig = function setFacebookConfig(opts) {
        configs = opts;
    };

    function parseQuery(query) {
        var queryString = '/me?';
        if (query.users)
            queryString = '/?ids=' + query.users.join() + '&';

        queryString += 'fields=' + parseFields(query.fields);
        return queryString;
    }

    function parseFields(queryFields) {
        var queryString = '';
        angular.forEach(queryFields, function(field, i) {
            queryString += field.name;
            if (field.fields != undefined) {
                queryString += '.fields('
                            + parseFields(field.fields)
                            + ')';
            }
            if (field.conditions != undefined) {
                var conditions = field.conditions;
                angular.forEach(conditions, function(key, i) {
                    queryString += '.' + key + '('
                                + conditions[key]
                                + ')';
                });
            }
        });
        return queryString;
    }

    // Facebook SDK Service
    this.$get = ['$window', '$log', function($window, $log) {
        return {
            // Initialization
            init: function() {
                $window.fbAsyncInit = function() {
                    FB.init(configs);
                };
            },
            // Login/out
            login: function(callback) {
                FB.login(callback, {scope: configs.permissions});
            },
            logout: function(callback) {
                FB.logout(callback);
            },
            getAuthResponse: function(callback) {
                FB.getAuthResponse(callback);
            },
            getLoginStatus: function(callback) {
                FB.getLoginStatus(callback);
            },
            // Event (un)subscription
            subscribeEvent: function(event, callback) {
                FB.Event.subscribe(event, callback);
            },
            unsubscribeEvent: function(event, callback) {
                FB.Event.subscribe(event, callback);
            },
            // Facebook UIs
            ui: function(opts, callback) {
                FB.ui(opts, callback);
            },
            feedDialog: function(opts, callback) {
                this.ui(angular.extend({method: 'feed'}, opts), callback)
            },
            oAuthDialog: function(opts, callback) {
                this.ui(angular.extend({method: 'oauth'}, opts), callback)
            },
            addTabDialog: function(opts, callback) {
                this.ui(angular.extend({method: 'pagetab'}, opts), callback)
            },
            friendsDialog: function(opts, callback) {
                this.ui(angular.extend({method: 'friends'}, opts), callback)
            },
            requestsDialog: function(opts, callback) {
                this.ui(angular.extend({method: 'apprequests'}, opts), callback)
            },
            sendDialog: function(opts, callback) {
                this.ui(angular.extend({method: 'send'}, opts), callback)
            },
            // Wrapper of FB.api()
            api: function(queryString, callback) {
                FB.api(queryString, callback);
            },
            // API call with formatted query object
            query: function(query, callback) {
                this.api(parseQuery(query), callback);
            },
            getNewsFeed: function(callback) {
                //this.api('/me?fields=home', callback);
                this.query({
                    users: ['me'],
                    fields: [{
                        name: 'home'
                    }]
                }, callback);
            },
            getFriends: function(callback) {
                //this.api('/me?fields=friends.fields(name,picture.width(50px))', callback);
                this.query({
                    users: ['me'],
                    fields: [{
                        name: 'friends',
                        fields: [{
                            name: 'picture',
                            conditions: {
                                width: '50px'
                            }
                        }],
                        conditions: {
                            limit: 25
                        }
                    }]
                }, callback);
            },
        };
    }];
})

.config([function() {
}])

.run(['$document', function($document) {
    // Load the SDK asynchronously
    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = '//connect.facebook.net/en_UK/all.js';
        fjs.parentNode.insertBefore(js, fjs);
    }($document[0], 'script', 'facebook-jssdk'));}]);
})(angular);