(function(angular) {
'use strict';

angular.module('facebook.sdk', [])

.provider('$facebook', function() {
    var cachedHandles = [],
        configs = {
            appId      : undefined, // App ID
            channelUrl : undefined, // Channel file for x-domain communication?
            status     : true,      // Check login status
            xfbml      : true,      // Parse XFBML tags or not?
            permissions: 'email'    // Permissions request
        };

    // Configuration methods for Facebook SDK provider
    this.setConfigs = function(opts) {
        configs = angular.extend(configs, opts);
    };
    this.getConfigs = function(opts) {
        return configs;
    };
    this.setAppId = function(appId) {
        configs.appId = appId;
    };
    this.getAppId = function() {
        return configs.appId;
    };
    this.setPermissions = function(permissions) {
        configs.permissions = permissions;
    };
    this.getPermissions = function() {
        return configs.permissions;
    };
    this.setChannelUrl = function(channelUrl) {
        configs.channelUrl = channelUrl;
    };
    this.getChannelUrl = function() {
        return config.channelUrl;
    };

    // Helper for parsing object formatted query 
    var helper = {};
    helper.parseQuery = function (query) {
        var queryString = '/me?';
        if (query.users)
            queryString = '/?ids=' + query.users.join() + '&';

        queryString += 'fields=' + helper.parseFields(query.fields);
        return queryString;
    }
    helper.parseFields = function (queryFields) {
        var queryString = '';
        queryFields.forEach(function(field, i) {
            queryString += field.name;
            if (field.fields) {
                queryString += '.fields(';
                queryString += helper.parseFields(field.fields);
                queryString += ')';
            }
            if (field.conditions) {
                var conditions = field.conditions;
                for (var key in conditions)
                    queryString += '.' + key + '(' + conditions[key]+ ')'
            }
        });
        return queryString;
    }

    // Handles method called whether Facebook SDK initialized or not
    var handle = undefined;
    function cacheHandle(fn) {
        cachedHandles.push(fn);
    }
    function doHandle(fn) {
        fn();
    }
    function executeCachedHandles() {
        angular.forEach(cachedHandles, function(fn, i) {
            fn();
        });
    }
    handle = cacheHandle;

    // Facebook SDK Service
    this.$get = ['$window', '$log', function($window, $log) {
        var $FB = undefined;
        return {
            fbAsyncInit: function(callback) {
                $window.fbAsyncInit = callback;
            },
            init: function() {
                if (configs.appId !== undefined)
                    this.initFacebook();
                else
                    $log.error('App ID should be configured before init!');
            },
            initFacebook: function() {
                $FB = $window.FB;
                $FB.init(configs);

                // Executes FB.api() right after FB.init() will caused
                // access token is not ready issue
                handle = doHandle;
                this.getLoginStatus(function() {
                    executeCachedHandles();
                });
            },
            // Login/out
            login: function(callback) {
                handle(function() {
                    $FB.login(callback, {scope: configs.permissions});
                });
            },
            logout: function(callback) {
                handle(function() {
                    $FB.logout(callback);
                });
            },
            getAuthResponse: function(callback) {
                handle(function() {
                    $FB.getAuthResponse(callback);
                });
            },
            getLoginStatus: function(callback) {
                handle(function() {
                    $FB.getLoginStatus(callback);
                });
            },
            // Event (un)subscription
            subscribeEvent: function(event, callback) {
                handle(function() {
                    $FB.Event.subscribe(event, callback);
                });
            },
            unsubscribeEvent: function(event, callback) {
                handle(function() {
                    $FB.Event.subscribe(event, callback);
                });
            },
            // Facebook UIs
            ui: function(opts, callback) {
                handle(function() {
                    $FB.ui(opts, callback);
                });
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
                handle(function() {
                    $FB.api(queryString, callback);
                });
            },
            // API call with object formatted query
            query: function(query, callback) {
                this.api(helper.parseQuery(query), callback);
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

.run(['$facebook', '$log', function($facebook, $log) {
    $facebook.login();
    // Load the SDK asynchronously
    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = '//connect.facebook.net/en_UK/all.js';
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    // Call Facebook provider initilizer
    //$facebook.fbAsyncInit(function(){
    //    $facebook.init();
    //});
}]);

})(angular);