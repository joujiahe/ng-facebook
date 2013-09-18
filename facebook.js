angular.module('facebook.sdk', [])

.provider('$facebook', function() {
    var configs = {
        appId      : undefined, // App ID
        channelUrl : undefined, // Channel file for x-domain communication?
        status     : true,      // Check login status
        xfbml      : true,      // Parse XFBML tags or not?
        permissions: 'email'    // Permissions request
    };

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

    function statusHandler(response) {
        //('The status of the session is: ' + response.status);
        if (response.status === 'connected') {
            // the user is logged in and has authenticated your
            // app, and response.authResponse supplies
            // the user's ID, a valid access token, a signed
            // request, and the time the access token
            // and signed request each expire

            //console.log('connected');
        } else if (response.status === 'not_authorized') {
            // the user is logged in to Facebook,
            // but has not authenticated your app

            //console.log('not authorized');
        } else { // response.status === 'unknown'
            // the user isn't logged in to Facebook.
            //console.log('unknown');
        }
    }

    var helper = {};
    helper.parseQuery = function (query) {
        var q = '/me?';
        if (query.users)
            q = q.replace('me?', '?ids=' + query.users.join() + '&');

        q += 'fields=' + helper.parseFields(query.fields);
        return q;
    }
    helper.parseFields = function (queryFields) {
        var q = '';
        queryFields.forEach(function(field, i) {
            q += field.name;
            if (field.fields) {
                q += '.fields(';
                q += helper.parseFields(field.fields);
                q += ')';
            }
            if (field.conditions) {
                var conditions = field.conditions;
                for (var key in conditions)
                    q += '.' + key + '(' + conditions[key]+ ')'
            }
        });
        return q;
    }

    this.$get = ['$window', function($window) {
        var $FB = undefined;
        return {
            init: function() {
                $FB = $window.FB;
                $FB.init(configs);
            },
            login: function(callback) {
                $FB.login(callback, {scope: configs.permissions});
            },
            logout: function(callback) {
                $FB.logout(callback);
            },
            //subscribe
            //unsubscribe
            //getAuthResponse,
            //getLoginStatus,
            //ui,
            // Wrapper of FB.api()
            api: function(queryString, callback) {
                $FB.api(queryString, callback);
            },
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
    // Load the SDK asynchronously
    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/all.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
}])

.run(['$facebook', function($facebook){
    window.fbAsyncInit = function() {
        $facebook.init();
    };
}]);