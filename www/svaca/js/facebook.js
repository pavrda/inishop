function fbInit()
{
    try {
        FB.init({
            appId: fbAppID,
            nativeInterface: CDV.FB,
            useCachedDialogs: false
        });
    } catch (e) {
        log("Error facebook inicializace:" +e);
    }


}

function doFBLogin() {
    log("doFBLogin start");
    FB.getLoginStatus(function(response) {
        log("getLoginStatus");
        if (response.status === 'connected') {
            log("fbLogin connected");
            enterFBapp(response);
        } else {
            FB.login(function(response)
            {
                log("login start");
                if (response.authResponse) {
                    enterFBapp(response);
                }
                else
                {// user cancelled login zustat na strance
                    log("user cancelled login");
                }
            }, {
                    scope: 'email'
            });
        }
    });
}

function fbLogin_old(){
    log("fbLogin start");
    FB.getLoginStatus(function(r) {
        log("r.status:" + r.status);
        if (r.status === 'connected') {
            enterFBapp();
        } else {
            log("login start");
            FB.login(function(response) {
                log("response");
                log("response.authResponse:" + response.authResponse);
                if (response.authResponse) {
                    enterFBapp(response);
                } else
                {// user cancelled login zustat na strance
                    log("user cancelled login");
                }

            }, {
                scope: 'email'
            });
        }
    });
}

function fbStatus() {
    FB.getLoginStatus(function(response) {
        if (response.status == 'connected') {
            alert('logged in');
        } else {
            alert('not logged in');
        }
    });
}

function fbLogout() {
    FB.logout(function(response) {
        alert('logged out');
    });
}

function enterFBapp(response) {
    FB.api('/me', function(response)
    {
        log("enterFBapp");
        // fake
        //response = new Object();
        //response.id = "15090712";
        //response.id = "1509071250";
        // fake end
        log(response.id + response.first_name + response.last_name + response.gender);

            $.ajax({
                type: "POST",
                url: appServerUrlPreffix + "/api/loginFB.json",
                data: {
                    firstname: response.first_name,
                    gender: response.gender,
                    id: response.id,
                    last_name: response.last_name
                },
                dataType: "json",
                success: function(data) {
                    if (data.msg) alert(data.msg);
                    if (data.status == "ok" && data.goto=="student.html")
                    {
                        console.log("prihlaseni ok");
                        transition("#page-registracePrihlaseniOK","fade");
                        nacistDataPoPrihlaseni();
                        $("#registracePrihlaseniOKdiv").text("Přihlášení proběhlo úspěšně");
                        pageNext = "";

                        return;
                    }
                    if (data.status == "ok")
                    {
                        console.log("prihlaseni ok - k doregistraci");
                        registraceDoplnit(response);
                    }
                    if (data.status == "error") {
                        alertZobraz("Nelze přihlásit pomcí facebooku ")
                    }
                    return;
                },
                error: function(data) {
                    console.log(data);
                    alert('chyba ověření se serverem:' + data);
                }
            });
     });

}


// ======================================================= old
function old()
{
    if ((typeof cordova == 'undefined') && (typeof Cordova == 'undefined')) alert('Cordova variable does not exist. Check that you have included cordova.js correctly');
    if (typeof CDV == 'undefined') alert('CDV variable does not exist. Check that you have included cdv-plugin-fb-connect.js correctly');
    if (typeof FB == 'undefined') alert('FB variable does not exist. Check that you have included the Facebook JS SDK file.');
    FB.Event.subscribe('auth.login', function(response) {
        alert('auth.login event');
    });

    FB.Event.subscribe('auth.logout', function(response) {
        alert('auth.logout event');
    });

    FB.Event.subscribe('auth.sessionChange', function(response) {
        alert('auth.sessionChange event');
    });

    FB.Event.subscribe('auth.statusChange', function(response) {
        alert('auth.statusChange event');
    });




    function flogin(){
        FB.getLoginStatus(function(r) {
            if (r.status === 'connected') {
                processFacebook();
            } else {
                FB.login(function(response) {
                    if (response.authResponse) {
                        processFacebook();
                    } else {
                        // user is not logged in
                    }
                }, {
                    scope: 'email'
                });
            }
        });
    }
    function processFacebook() {
        FB.api('/me', function(response) {
            if (response.error) {
                alert('Unexpected Facebook Login Error: ' + JSON.stringify(response.error));
            } else {
                console.log(response);
                var login_data = '';
                for (var key in response) {
                    if (key == 'id' || key == 'name' || key == 'email' || key == 'gender')
                        login_data += key + '=' + encodeURIComponent(response[key]) + '&';
                }
                // do further processing as per your application
            }
        });
    }


    function flogin_old() {
        FB.login(
            function(response) {
                if (response.session) {
                    alert('logged in');
                } else {
                    alert('not logged in');
                }
            },
            { scope: "email" }
        );
    }

    var friendIDs = [];
    var fdata;
    function me() {
        FB.api('/me/friends', { fields: 'id, name, picture' },  function(response) {
            if (response.error) {
                alert(JSON.stringify(response.error));
            } else {
                var data = document.getElementById('data');
                fdata=response.data;
                console.log("fdata: "+fdata);
                response.data.forEach(function(item) {
                    var d = document.createElement('div');
                    d.innerHTML = "<img src="+item.picture+"/>"+item.name;
                    data.appendChild(d);
                });
            }
            var friends = response.data;
            console.log(friends.length);
            for (var k = 0; k < friends.length && k < 200; k++) {
                var friend = friends[k];
                var index = 1;

                friendIDs[k] = friend.id;
                //friendsInfo[k] = friend;
            }
            console.log("friendId's: "+friendIDs);
        });
    }




}



