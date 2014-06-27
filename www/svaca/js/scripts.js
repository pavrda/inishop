/*
 v9
 - odebrano ctvercove menu
 - oprava pozadi barvy headeru - typ produktu
 - dodlany filtry headerech - typ produktu
 - kosik - zobrazeni cisla 1-5
 - tlac zaplatit hned pod kosikem
 - zvětšení horního menu relativně podle velikosti písma
 - html verze stranky kdyz neni kredit
 */
var viewport;
var maxHeightVybratSvacu = false;
var maxHeightKosik = false;

var dataZbozi;                  // jSON prijaty ze serveru
var dataKategorie;              // jSON prijaty ze serveru
var dataProfil;                 // jSON prijaty ze serveru

var zbozi;                      // jSON cast z dataZbozi
var kategorie;                  // jSON cast z dataZbozi
var profil;

var userInfo = {name:"", pass:""};               // heslo

var kosik =[];                  // idcka zbozi
var zboziOblibene=[];           // idcka ze zbozi
var zboziOblibenaMena=[];     // [[1,2], "nazevMenu", "vlozeno"], [[1,2],  "nazevMenu", "vlozeno"]
// [[1,2], nazev, datumVlozeni], [[1,2], nazev, datumVlozeni]

var kosikSoucetCeny = 0;
var objednavka ="";
var appPreffix = "svaca/";
var appServerUrlPreffix = "http://demo.livecycle.cz/fajnsvaca";
var fbAppID = "207808999413453";
var cachePreffix = "";
var pageNext = "";
//var pageNext = "#page-test";
var registraceDoplnitFB = false;  // priznak estlize po prihlaseni pres FB neni vyplnena skola a dalsi veci

var obrInterni = ["productsOblozenaBageta.png","productsRyzekVHousce.png"];

// static
var donaskaKuryremCena= 15;

/*
prihlaseni pres FB
- stav FB (jiz connected/prihlaseni do FB) prihlasuji k serveru svaca pres FB-userID
    - jestli status.goto je student jsem kompletne prihlasen. Nactu zbozi, profil ...
    - jestli status.goto registrace:
        - predvyplnim registraci udaji co mam
        - username je needitovatelny a zatim je to cislo fb
        - invisible je heslo
        - odeslu jako registraci (server pozna ze jde o zmenu)


 */


//var a = [5,3,4];
//var c = ["as","gg"];
//var a = new Array();
//a[0] = [5,3,4];
//a[1] = "asd";
//zboziOblibenaMena.push([a][c]);
//zboziOblibenaMena.push([[5,3,4]["as","gg"]]);//zboziOblibenaMena.push(a);
//alert(zboziOblibenaMena.length);
//alert(JSON.stringify(zboziOblibene));
//storage("getItem","zboziOblibene","jSON");
//storage("setItem","zboziOblibene","jSON");
//storage("getItem","zboziOblibene","jSON");
//alert(JSON.stringify(zboziOblibenaMena));

//zboziOblibneRefresh();

function facebookHack(response)
{
    if(response==null)
    {
        response = new Object();
        response.first_name = "Zdenek";
        response.gender = "male";
        response.id = "1509071250";
        response.last_name = "Pavlicek";
    }
    //alert(response.id);
    enterFBapp(response);
}

function init()
{
    //userInfo.name = "a";
    //userInfo.pass = "b";
    //("setItem","userInfo","jSON");


    storage("getItem","userInfo","jSON");
    console.log(userInfo);
    if(userInfo.name!= null && userInfo.pass!= null)
    {
        if(userInfo.name.length>0 && userInfo.pass.length>0)
        {
            $('#prihlaseniJmeno').val(userInfo.name);
            $('#prihlaseniHeslo').val(userInfo.pass);
            prihlaseniAjax("silent");
        }
    }

    fbInit();
    //cacheInit();



    // TODO hack upravy ---------
    viewport = {
        width  : $(window).width(),
        height : $(window).height()
    };

    /* tady nelze pocitat height protoze neni vykresleno a je 0.
        pocita se pred prvnim transitions viz dole
        //$('#ulVybratSvacu').css('max-height',viewport.height - $('#ulVybratSvacu').position().top);
        $('#ulVybratSvacu').css('max-height',viewport.height - $('#vybratSvacuKredit').height());
        //alert($('#vybratSvacuKredit').height());
        $('#ulVybratSvacu').css('height','auto');
        maxHeightVybratSvacu = true;
    */

    $('#pages > div').css('min-height',viewport.height);
    // kosik nastaveni 60% height
    //$('.ulKosik').css('max-height',viewport.height*0.4);
    //var kosikPosition = $('.ulKosik').offset();


    //$('#ulKosik').css('position','relative');
    //$('#ulKosik').css('margin-bottom','0px');
    //$('.ulKosikFooter').css('position','relative');
    // --------------------------

    profilNactiAjax();
    pageNext = "#page-vybratSvacu";
    zboziNactiAjax();
    storage("getItem","zboziOblibene","jSON");
    storage("getItem","zboziOblibenaMena","jSON");
    //transition('#page-registrace1','fade');



    $(".clickNext").keypress(function(event) {
        if(event.keyCode == 13) {
            if($(this).attr('id')=="prihlaseniHeslo")
            {
                prihlaseniAjax();
                return;
            }
            if($(this).attr('id')=="registraceHeslo2")
            {
                registraceAjax();
                return;
            }

            $(this).nextAll('input:first').focus();
            /*
             for(var i=0; i< keyPosloupnost.length; i++)
             {
             if(keyPosloupnost[i]==$(this).attr('id'))
             {
             if(keyPosloupnost[i+1]=="prihlaseniPrihlasitSe")
             {
             prihlaseniAjax();
             return;
             }
             $('#'+keyPosloupnost[i+1]).focus();
             console.log("focus na:" + keyPosloupnost[i+1]);
             return;
             }
             }
             */
        }
    });


    $("#pages a").click(function(e){
        //if(e.target.hash.slice(1)=="") console.log("nic");
        e.preventDefault();
        if(e.target.hash == null) return;
        var nextPage = $(e.target.hash);
        if(e.target.hash.slice(1)!="") {
            transition(nextPage, 'fade');
            //console.log(e.target.hash.slice(1));
            $("#pages").attr("className", e.target.hash.slice(1));
        }


    });



    //storeIntelligrapeLogo();



}



function transition(toPage, type) {

    //$('#menuLeftDiv').css('display','none');
    var toPage = $(toPage),
        fromPage = $("#pages .current");

    if(toPage.hasClass("current") || toPage === fromPage) {
        return;
    };


        toPage.addClass("current");
        fromPage.removeClass("current");

    transitionAfter(toPage);
}

function transition_efekt(toPage, type) {

    //$('#menuLeftDiv').css('display','none');
    var toPage = $(toPage),
        fromPage = $("#pages .current");

    if(toPage.hasClass("current") || toPage === fromPage) {
        return;
    };

    toPage
        .addClass("current " + type + " in")
        .one("webkitAnimationEnd", function(){
            fromPage.removeClass("current " + type + " out");
            toPage.removeClass(type + " in")
        });
    fromPage.addClass(type + " out");

    if(!("WebKitTransitionEvent" in window)){
        toPage.addClass("current");
        fromPage.removeClass("current");
        //return;
    }
    transitionAfter(toPage);
}

function transitionAfter(toPage)
{
    // --------------------------- operace nad strankamy
    console.log("zmena stranky na:" + toPage.selector);

    // oznaceni aktivniho menuLeft
    $('#menuLeftDiv').find(".menuLeftImgActive").removeClass("menuLeftImgActive");
    var menuLeft = toPage.selector.split("-");
    $('#menuLeftDiv' + menuLeft[1]).addClass("menuLeftImgActive");

    if(toPage.selector=="#page-profil")
    {
        console.log("profilNacti");
        profilNactiAjax();
    }

    if(toPage.selector=="#page-vybratSvacu")
    {
        kosikZobrazCisloVkolecku();
        //TODO synchronizaci na zbozi, ale aby to neprepisovalo cisla v kosiku
        //zboziNactiAjax();
        profilNactiAjax();  // update kreditu
        //alert("Načítám data");

        if(!maxHeightVybratSvacu)
        {

            $('#ulVybratSvacu').css('max-height',viewport.height - $('#ulVybratSvacu').position().top);
            $('#ulVybratSvacu').css('height','auto');
            maxHeightVybratSvacu = true;
        }
    }

    if(toPage.selector=="#page-kosik") {

        kosikRefresh();
        //$('#page-kosik').attr('class', 'page-kosik');
        $('#page-kosik').removeClass('objednavka');
        if(!maxHeightKosik)
        {
            var maxDelka = viewport.height - $('#koupitSvacuZaplatitKredit').height() - $('.ulKosikFooter').height()-$('#ulKosikTlacitkoCeleMenu').height();
            $('.ulKosik').css('max-height',maxDelka);
            $('.ulKosik').css('position','relative');
            $('.ulKosikFooter').css('position','relative');
        }
    }

    if(toPage.selector=="#page-mojeOblibene") {

        zboziOblibneRefresh();
    }

    if(toPage.selector=="#page-prihlaseni")
    {
        $('#menuLeftDiv').css('display','none');


        var delka = viewport.height - $('#prihlaseniContainerZaregistrovat').offset().top;
        //alert(viewport.height + "-"+ $('#prihlaseniContainerZaregistrovat').offset().top + "delka:" + delka);
        $('#prihlaseniContainerZaregistrovat').css('height',(delka));
    }

    if(toPage.selector=="#page-registrace1") {

        selectDataAjax("listSchools","registraceSelectSkola","");
    }

    if(toPage.selector=="#page-registracePrihlaseniOK") {

        //pageNext = "#page-vybratSvacu";
        $('#menuLeftDiv').css('display','none');
        setTimeout( function()
        {
            transition("#page-vybratSvacu","fade");
            $('#menuLeftDiv').css('display','block');
        }, 1000);
    }

    if(toPage.selector=="#page-dokoncitPlatbu") {

        $("#checkBoxVyzvednout").prop("checked","true");
        $('#mistoDoruceniDiv').css('display','none');
    }

    if(toPage.selector=="#page-potvrzeniPlatby") {


        if($("#checkBoxDonaskaKuryrem").is(":checked"))
        {
            $("#potvrzeniPlatbyVyzvednutiText").html("Bude doručena příští přestávku kurýrem.");
        } else
        {
            $("#potvrzeniPlatbyVyzvednutiText").html("Vyzvednut si jí můžete příští přestávku v našem bufetu.");
        }
    }
    if(toPage.selector=="#page-test") {
        $("#logContainer").scrollTop( $("#log").height() );
    }
}



// ----------------------------------- nakup -------------------------------------------------------




/*
 logika nacitani:
 document ready     -   nacteni zbozi (pri neprihlasen jde na prihlaseni) definovano promenou pageNext
 prihlaseni         -   nacteni zbozi
 -   kosik empty
 -   getUserInfo = jmeno(horni lista), profil, kredit(horni lista)
 page-vybratSvacu   -   nacteni zbozi
 -   getUserInfo (kredit)

 */

function kosikZobrazCisloVkolecku() {
    var kosikPocetPolozek = kosik.length;
    if(kosikPocetPolozek>0) {
        $(".circleKosik").text(kosikPocetPolozek);
        $(".circleKosik").css('display','block');
    } else
    {
        $(".circleKosik").css('display','none');
    }


}

function zboziOblibeneAddStar(produkt,vlozitID)
{
    if($(produkt).attr("class")=="cena star starOn")
    {
        $(produkt).attr("class","cena star starOff");
    } else
    {
        $(produkt).attr("class","cena star starOn");
    }

    zboziOblibeneAddRem(vlozitID);
}

// zboziOblibene prida(jestli neni) nebo odebere(jestli je)
function zboziOblibeneAddRem(vlozitID, produkt) {
    //zjisti hestli jiz neni vlozene
    var jizVlozene = false;
    for(var i=0; i<zboziOblibene.length; i++)
    {
        if(zboziOblibene[i]==vlozitID)
        {
            jizVlozene = true;
            zboziOblibeneRemove(vlozitID);
            $(produkt).attr("class","cena star starOff");
            kosikRefreshStars(vlozitID,"starOff");
        }
    }

    if(!jizVlozene)
    {
        console.log("pridavam do oblibenych:" + vlozitID);
        zboziOblibene.push(vlozitID);
        $(produkt).attr("class","cena star starOn");
        kosikRefreshStars(vlozitID,"starOn");
    }

    storage("setItem","zboziOblibene","jSON");
}

function zboziOblibeneRemove(odebratID)
{
    console.log("odebiram z oblibenych::" + odebratID);
    var index;
    for(var i=0;i<zboziOblibene.length; i++)
    {
        if(zboziOblibene[i]==odebratID) index = i;
    }
    zboziOblibene.splice(index,1);

    for(var i=0;i<zboziOblibene.length; i++)
    {
        console.log(zboziOblibene[i]);
    }
}

// vlozi kosik do zboziOblibenaMena
// nesmi jiz takove tam byt (na poradi polozek nezalezi)
function zboziOblibenaMenaAdd()
{

    // kontrola jestli takove menu uz v oblibenych neni
    var menuExist = false;
    var shoda = true;
    for(var i=0;i<zboziOblibenaMena.length;i++)
    {
        // jestli pocet produktu v menu je stejny jako pocet produktu v kosiku
        if(zboziOblibenaMena[i][0].length==kosik.length)
        {
            // porovna existenci kazdeho produktu v menu[i] s kazdym produktem v kosiku
            var vsechnyZmenuVkosiku = true;
            for(var j=0;j<zboziOblibenaMena[i][0].length;j++)
            {
                // jedna vec z menu[x].menu vuci kosiku
                var jedenZmenuVkosi = false;
                for(var k=0;k<kosik.length;k++)
                {
                    if(kosik[k]==zboziOblibenaMena[i][0][j])
                    {
                        jedenZmenuVkosi = true;
                    }
                }

                if(!jedenZmenuVkosi)
                {
                    vsechnyZmenuVkosiku = false;
                }
            }
            if(vsechnyZmenuVkosiku)
            {
                menuExist = true;
            }
        }


    }

    if(menuExist)
    {
        alertZobraz("Takové menu je již v oblíbených");
    }
    else
    {
        var menuName=prompt("Pojmenujte své menu","Menu1");
        if(menuName!=null && menuName!="")
        {
            var menuPolozky = [];
            for(var i=0;i<kosik.length;i++)
            {
                menuPolozky.push(kosik[i]);
            }
            var menu = [];
            menu[0] = menuPolozky;
            menu[1] = menuName;
            zboziOblibenaMena.push(menu);
            storage("setItem","zboziOblibenaMena","jSON");
            console.log("pridano menu do oblibenych");
            alertZobraz("Menu bylo přidáno do oblíbených");
        }
    }

}

function zboziOblibenaMenaRem(menuIndex)
{
    zboziOblibenaMena.splice(menuIndex,1);
    alertZobraz("Menu bylo odebráno z oblíbených");
    storage("setItem","zboziOblibenaMena","jSON");
    zboziOblibneRefresh();
}

// prida zbozi do kosiku s temito funkcemi:
// misto kosiku da cislo
// jestli je cislo vestsi nez pet, opet se zobrazi kosik
// updatuje se cislo v kolecku
function kosikAdd(produkt,vlozitID) {

    if(produkt!=null)
    {
        if($(produkt).text().length>1)
        {
            $(produkt).find('div').html("1");
            $(produkt).attr('class', 'produkt2KosikCislo');
        } else
        {
            var pocet = $(produkt).find('div').text();
            pocet ++;
            if(pocet<6)
            {
                $(produkt).find('div').text(pocet);
            }
            else
            {
                console.log("vic jak pet");
                kosikOdebrat5kusu(vlozitID);
                $(produkt).find('div').html("Přidat do<br>košíku");
                $(produkt).attr('class', 'produkt2KosikObr');
                kosikZobrazCisloVkolecku();
                return;
            }
        }
    }


    kosik.push(vlozitID);
    kosikZobrazCisloVkolecku();

}

function kosikAddMenu(menuID) {
    for(var i= 0;i< zboziOblibenaMena[menuID][0].length; i++)
    {
        kosik.push(zboziOblibenaMena[menuID][0][i]);
    }
    alertZobraz("Menu bylo přidáno do košíku");
}

// odebere z kosiku polozku
// propise do page-vybratSvacu a cislo v kolecku
// refreshne zobrazeni v kosiku (take polozka celkem ...)
function kosikRemove(kosikIndex) {
    var zboziID = kosik[kosikIndex];
    kosik.splice(kosikIndex,1);
    kosikRefresh();
    vybratSvacuKosikPocetRemove(zboziID);
}

// podle aktualni stranky v ktere se to klikne to:
// v kosiku odebere zbozi
// v kosiku pri objednavce prida do oblibenych
function kosikRemoveNeboOblibene(kosikIndex) {
    var myClass = $('#page-kosik').attr("class");
    if(myClass.indexOf("objednavka") != -1) {

        // dava se id
        zboziOblibeneAdd(kosik[kosikIndex]);
    } else
    {
        kosikRemove(kosikIndex);
    }
}

// odebere z kosiku 5 kusu zbozi jednoho typu id
function kosikOdebrat5kusu(odebratID)
{
    console.log("odebiram z kosiku: " + odebratID);
    pocet = 5;
    for(var i= kosik.length; i>-1; i--)
    {
        if(kosik[i]==odebratID && pocet >0)
        {
            kosik.splice(i,1);
            pocet --;
        }
    }
}

// v page vybrat svacu propise zmenu ktera se deje v kosiku
// zmensi cislo na kosiku a updatuje cislo v kolecku
function vybratSvacuKosikPocetRemove(zboziID)
{
    var li = $('#ulVybratSvacu li').find("[data-id='" + zboziID + "']");
    var produkt =  $('#ulVybratSvacu').find("[data-id='" + zboziID + "']").find('.produkt2KosikCislo');
    var kosikPocet = $(produkt).find('div').text()-1;
    if(kosikPocet==0)
    {
        $(produkt).find('div').html("Přidat do<br>košíku");
        $(produkt).attr('class', 'produkt2KosikObr');
        kosikZobrazCisloVkolecku();
    } else
    {
        $(produkt).find('div').text(kosikPocet);
        kosikZobrazCisloVkolecku();
    }

}





function ajaxError(xhr, textStatus, error){
    console.log(xhr.statusText);
    console.log(textStatus);
    console.log(error);
}
function ajaxError2(data,zobrazUzivateli){
    console.log("ajaxError2");
    console.log(data);

    if( data.status == "error" && data.code == "not logged")
    {
        console.log(data.msg);
        console.log("ajaxError2 data.msg:" + data.msg);
        prihlaseniZobrazDialog();
        alertZobraz(data.msg);
        return;
    }


    //alert("Nelze se připojit k serveru!");
    if($("#testAlertyCheckBox").is(":checked"))
    {
        alertZobraz(JSON.stringify(data));
    }

    if(zobrazUzivateli)
    {
        alertZobraz("Nelze se připojit k serveru!")
    }

}



function profilNactiAjax()
{
    console.log("profilNactiAjax");
    $.ajax({ url:'http://demo.livecycle.cz/fajnsvaca/api/getUserInfo',
        success: function(data) {
            console.log("profilNactiAjax success");
			dataProfil = data;
            profil = data;
            if(data.status == "ok")
            {
                profilNastavPole(data);
                storage("setItem","dataProfil","jSON");
            }
            if(data.status == "error" && data.code == "not logged")
            {
                prihlaseniZobrazDialog();
                //alertZobraz(data.msg);
            }
        },
        error: function(data)
        {
            ajaxError2(data);
            storage("getItem","dataProfil","jSON");
            if(!jQuery.isEmptyObject(dataProfil))
            {
                profilNastavPole(dataProfil);
            }
        }


    });
}

function profilNastavPole(data)
{
    $('#koupitUserName').text(data.fullName==null?"":data.fullName);
	console.log("dnastavuji kredit:" + data.balance);
    $('#vybratSvacuKredit').text(data.balance==null?"0 Kč":("Kredit: " + data.balance + " Kč"));
	
    $('#potvrzeniPlatbyKredit').text(data.balance==null?"0 Kč":("Kredit: " + data.balance + " Kč"));
    $('#koupitSvacuZaplatitKredit').text(data.balance==null?"0 Kč":("Kredit: " + data.balance + " Kč"));
    $('#dokoncitPlatbuKredit').text(data.balance==null?"0 Kč":("Kredit: " + data.balance + " Kč"));


    $( "#profilUsernameH" ).text(data.username==null?"":data.username);
    $( "#profilFullNameH" ).text(data.fullName==null?"":data.fullName);
    $( "#profilEmailH" ).text(data.email==null?"":data.email);
    $( "#profilTridaH" ).text(data.trida_name==null?"":data.trida_name);
    $( "#profilSkolaH" ).text(data.school_name==null?"":data.school_name);
    $( "#profilTelefonH" ).text(data.telefon==null?"":data.telefon);
    //if(data.jmeno ==null) console.log("prazdne");
}

function nacistDataPoPrihlaseni()
{
    kosikPocetPolozek = 0;
    kosik =[];
    kosikSoucetCeny = 0;
    kosikZobrazCisloVkolecku();
    profilNactiAjax();
    kosikRefresh();
    nastavZpetProdukKosikCislo();
    zboziNactiAjax();
    $( "#checkBoxVyzvednout").prop('checked', true);
    $( "#mistoDoruceniInput").val("");
}

function nastavZpetProdukKosikCislo()
{
    console.log("nastavZpetProdukKosikCislo");
    $('#ulVybratSvacu').find('.produktKosikCislo').html("Přidat do<br>košíku");
    $('#ulVybratSvacu').find('.produktKosikCislo').attr('class', 'produktKosik produktKosikObr');
}

function prihlaseniZobrazDialog()
{
    //prihlaseniAjax();
    transition("#page-prihlaseni","fade");

}

function prihlaseniAjax(type)
{
    if($('#prihlaseniJmeno').val()=="" && $('#prihlaseniHeslo').val() =="")
    {
        alertZobraz("Vyplňte jméno a heslo.");
        return;
    }
    console.log("prihlaseniAjax");
// TODO vymazat heslo z input field
    //$.ajax({ url:'http://demo.livecycle.cz/fajnsvaca/api/login?username=' + $('#prihlaseniJmeno').val() + '&password='+$('#prihlaseniHeslo').val(),
    $.ajax({ url:'http://demo.livecycle.cz/fajnsvaca/api/login',
        data: {
            username: $('#prihlaseniJmeno').val(),
            password: $('#prihlaseniHeslo').val()
        },
        success : function (data) {
            console.log("prihlaseniAjax succes");
            if( data.status == "ok")
            {
                console.log("prihlaseni okk");
                //alert("přihlášen ok");
                //transition("#page-dokoncitPlatbu","fade");
                transition("#page-registracePrihlaseniOK","fade");
                if(type!="silent")
                {
                    $("#registracePrihlaseniOKdiv").text("Přihlášení proběhlo úspěšně");
                    $("#page-registracePrihlaseniOK a").css("display","block");
                } else
                {
                    $("#registracePrihlaseniOKdiv").text("Načítám data");
                    $("#page-registracePrihlaseniOK a").css("display","none");
                }
                nacistDataPoPrihlaseni();

                userInfo.name = $('#prihlaseniJmeno').val();
                userInfo.pass = $('#prihlaseniHeslo').val();
                storage("setItem","userInfo","jSON");
               pageNext = "";

            }
            else
            {
                alertZobraz(data.msg);
            }
        },
        complete: function() {
            $('#prihlaseniHeslo').val('');
        },
        error: ajaxError2
    });


}

function logout()
{
    userInfo.name = "";
    userInfo.pass = "";
    storage("setItem","userInfo","jSON");

    $.ajax({
        url:'http://demo.livecycle.cz/fajnsvaca/api/logout',
        complete: function() {
            alert("Odhlášen!");
        },
        error: function() {
            alert("Error!");
            console.log(data);
        }});
}

function registraceSkolaNext()
{

    if($("#registraceSelectTrida option:selected").text()=="NEJPRVE VYBERTE ŠKOLU")
    {
       alertZobraz("Pro pokračování je třeba vyplnit školu a třídu");
    }
    else
    {
        transition('#page-registrace2','fade')
    }
}

function registraceSelectSkolaChange()
{
    $('#registraceSelectedSkola').text($('#registraceSelectSkola option:selected').text());
    selectDataAjax("listClasses","registraceSelectTrida",$('#registraceSelectSkola option:selected').val());
    if($('#registraceSelectSkola').find("option[value='0']").text()=="VYBERTE ŠKOLU")
    {
        $('#registraceSelectSkola').find("option[value='0']").remove();
    }
}
function registraceSelectTridaChange()
{
    $('#registraceSelectedTrida').text($('#registraceSelectTrida option:selected').text());
}

// nakrmi select polozkama
function selectNakrm(idSelectu, data)
{

    console.log("selectNakrm" + data);
    newOptions = data.list;

    var select = $('#'+idSelectu);
    var options = select.prop('options');

    $('option', select).remove();

    if(idSelectu=="registraceSelectSkola") options[options.length] = new Option("VYBERTE ŠKOLU", 0);

    $.each(newOptions, function() {
        options[options.length] = new Option(this.name, this.id);
        console.log(this.name);
    });

    if(idSelectu=="registraceSelectTrida")
    {
        select.val(1);
        $('#registraceSelectedTrida').text($('#registraceSelectTrida option:selected').text());
    }
    console.log("nakrmeno");
}

//nacte skoly a nastavi select podle dataProfil http://demo.livecycle.cz/fajnsvaca/api/listSchools
//nacte tridu kdyz se zavola s parametrem skoly http://demo.livecycle.cz/fajnsvaca/api/listClasses?school_id=1
function selectDataAjax(listType,idSelectu,param) {
    console.log("selectDataAjax");
    if(param.length>0)
    {
        param = "?school_id=" + param;
    }
    var url = 'http://demo.livecycle.cz/fajnsvaca/api/' + listType + param;
    console.log("url:" + url);
    $.ajax({ url:url,
        success: function(data) {
            if( data.status == "error" && data.code == "not logged")
            {
                console.log(data.msg);
                console.log("neprihlasen");
                prihlaseniZobrazDialog();
                return;
            }
            if( data.status == "ok")
            {
                selectNakrm(idSelectu,data);
            }
        },
        error: ajaxError2
    });
}

function registraceAjax() {
    if(validateRegistrace())
    {
        var sex = "female";
        if($( "#checkBoxRegistracekluk").is(':checked'))
        {
            sex = "male";
        }

        console.log("registraceAjax sex:" + sex);
        //$.ajax({ url:'http://demo.livecycle.cz/fajnsvaca/api/registerUser?username=' + $('#registraceUsername').val() + '&firstName='+$('#registraceJmeno').val()+ '&lastName='+$('#registracePrijmeni').val()+ '&password='+$('#registraceHeslo').val()+ '&email='+$('#registraceEmail').val(),
        console.log("skola:"+$('#registraceSelectSkola').val());
        console.log("trida:"+$('#registraceSelectTrida').val());
        $.ajax({ url:'http://demo.livecycle.cz/fajnsvaca/api/registerUser',
            data: {
                username: $('#registraceUsername').val(),
                fullName: $('#registracePrijmeni').val(),
                sex: sex,
                password: $('#registraceHeslo').val(),
                email: $('#registraceEmail').val(),
                class_id: $('#registraceSelectTrida').val(),
                school_id: $('#registraceSelectSkola').val()
            },
            success: function(data) {
                if( data.status == "error")
                {
                    console.log("registraceAjax data.status == error");
                    if( data.code == "usernameExists")
                    {
                        $('#registraceUsername').next().text(data.msg);
                        return;
                    }
                    //$('#registraceEmail').next().text("Email je v nesprávném");


                    alertZobraz(data.msg);
                    return;
                }
                if( data.status == "ok")
                {
                    registraceDoplnitFB = false;
                    registraceVymazatForm(); //vymaze vyplnena pole

                    console.log("registraceAjax data.status == ok");
                    //alert("Zaregistrováno!");
                    nacistDataPoPrihlaseni();
                    //transition("#page-vybratSvacu","fade");
                    pageNext = "#page-registracePrihlaseniOK";
                    // TODO vlozit az za registracePrihlaseniOK
                }
            },
            error: ajaxError2
        });
    }
}

function zboziNactiAjax() {
    console.log("zboziNactiAjax");
    $.ajax({ url:'http://demo.livecycle.cz/fajnsvaca/api/listProducts',
        success: function(data) {
            console.log("zboziNactiAjax success");
            dataZbozi = data;
            if( data.status == "error" && data.code == "not logged")
            {
                console.log(data.msg);
                console.log("neprihlasen");
                prihlaseniZobrazDialog();
                return;
            }
            if( data.status == "error")
            {
                ajaxError2(data);
                return;
            }
            if( data.status == "ok")
            {
                zboziNacti(data);
                storage("setItem","dataZbozi","jSON");
                if(pageNext!="")
                {
                    transition(pageNext,"fade");
                }

            }
        },
        error: function(data) {
            ajaxError2(data);
            storage("getItem","dataZbozi","jSON");
            if(!jQuery.isEmptyObject(dataZbozi))
            {
                zboziNacti(dataZbozi);
                if(pageNext!="")
                {
                    transition(pageNext,"fade");
                }
            }
        }
    });
}

function checkBoxProduktTyp(cb)
{
    var currentId = $(cb).attr('id');
    currentId = currentId.replace("CheckboxInput","")
    console.log(currentId);
    if(cb.checked) $('.'+currentId).css('display','block');
    else $('.'+currentId).css('display','none');
    //$('.'+currentId).toggle();
}

function checkBoxProduktTyp_old(cb)
{
    var currentId = $(cb).attr('id');
    currentId = currentId.replace("CheckboxInput","")
    console.log(currentId);
    if(cb.checked) $('.'+currentId).css('display','block');
    else $('.'+currentId).css('display','none');
    //$('.'+currentId).toggle();
}

function zboziNacti(data) {
    // priprava dat
    var imgUrl = "";
    var kategorieIndexMinula = 0;
    var kategorieIndexBudouci = 0;
    //var data2 = jQuery.parseJSON({"status":"ok","categories":[{"id":"1","icon":"products/productsHousky.png","name":"Housky"},{"id":"2","icon":"products/productsBagety.png","name":"Bagety"}],"products":[{"id":"1","icon":"products/productsSekanaVHousce.png","price":"29","name":"Sekaná v housce","category_id":"0"},{"id":"2","icon":"products/productsRyzekVHousce.png","price":"33","name":"Řízek v housce","category_id":"0"},{"id":"3","icon":"products/productsSyrVHousce.png","price":"30","name":"Smažený sýr v housce","category_id":"0"},{"id":"4","icon":"products/productsVegetBageta.png","price":"35","name":"Klobásky v housce","category_id":"0"},{"id":"5","icon":"products/productsOblozenaBageta.png","price":"43","name":"Obložená bageta","category_id":"0"},{"id":"6","icon":"products/productsVegetBageta.png","price":"38","name":"Vegetariánská bageta","category_id":"0"}]}');
    zbozi = data.products;
    kategorie = data.categories;
    //kategorie = jQuery.parseJSON('[{"id":"0","icon":"products/productsHousky.png","name":"Housky"},{"id":"2","icon":"products/productsBagety.png","name":"Bagetyy"}]');
    var kategorieIndex = 0;
    console.log("zbozi");
    //zbozi = jQuery.parseJSON( '[{"id":"1","icon":"bageta.jpg","price":"47","name":"Bageta","category_id":"0"},{"id":"2","icon":"chleba.jpg","price":"21","name":"Chleba","category_id":"0"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"}]' );
    //zbozi = jQuery.parseJSON( '[{"id":"1","icon":"bageta.jpg","price":"47","name":"Bageta","category_id":"0"},{"id":"2","icon":"chleba.jpg","price":"21","name":"Chleba","category_id":"0"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"}]' );
    console.log(kategorie);

    // vymazani kontejneru
    $("#ulVybratSvacu").empty();

    $( "#ulVybratSvacu" ).append( '<img class="fajnSvacaText"  >');


    var poradiZbozi = 0;
    $.each(zbozi, function()
    {



        // vlozeni kategorie
        // vloz kategorii jestli: kategorie zbozi je jina nez doposud || prvni zbozi
        if(kategorie[kategorieIndex].id!=this.category_id || poradiZbozi==0)
        {
            // najdi kategorii pro novou kategorii zbozi
            while(kategorie[kategorieIndex].id!=this.category_id && kategorieIndex<kategorie.length-1)
            {
                kategorieIndex ++;
            }

            // vloz ukonceni predchozi kategorie
            // vlozi zakonceni predchozi kategorie
            if(poradiZbozi>0)
            {
                $( "#ulVybratSvacu" ).append( '<li style="height: 3em;background-color:'+ kategorie[kategorieIndexMinula].color +'"></li>');
            }
            kategorieIndexMinula = kategorieIndex;
            // vloz novou kategorii
            if(kategorie[kategorieIndex].id==this.category_id)
            {
                imgUrl = cacheGetImgUrl(kategorie[kategorieIndex].icon);
                $( "#ulVybratSvacu" ).append( '<li class="produktTyp" style="background-color:'+ kategorie[kategorieIndex].color +'"><img class="produktTypImg" src="'+imgUrl+'"  ><a href=""><h2>'+kategorie[kategorieIndex].name+'</h2></a><div class="produktChceckBox checkBoxProduktTyp"><input type="checkbox" onclick="checkBoxProduktTyp(this)" checked="checked" value="1" id="kategorie'+kategorie[kategorieIndex].id+'CheckboxInput" name="" /><label for="kategorie'+kategorie[kategorieIndex].id+'CheckboxInput"></label></div></li>' );
                console.log("davam");
            }
        }

        // zjisteni jestli jde o posledni produkt v kategorii
        var posledniVkategorii = false;
        if(poradiZbozi == zbozi.length-1)
        {
            posledniVkategorii = true;
            console.log("hledam: je posledni");
        } else
        {
            console.log(poradiZbozi + "kategorie" + zbozi[poradiZbozi].category_id);
            if(kategorie[kategorieIndex].id!=zbozi[poradiZbozi+1].category_id)
            {
                posledniVkategorii = true;
            }
        }


        // vloz produkt
       // TODO vynechat zbozi ktere neni k zobrazeni
        if( this.name!="Doručení kurýrem")
        {
            imgUrl = cacheGetImgUrl(this.icon);

            var produktLi='<li class="produkt2 kategorie'+kategorie[kategorieIndex].id+'" data-id="'+this.id+'"> <div> <div class="produkt2Leva bila produkt2Popis"><img src="'+imgUrl+'"  ><h3>' + this.name + '</h3>  <span>'+ this.description+'</span><span class="cena">'+ this.price+' Kč</span>  </div>  <div class="produkt2Prava zelena">  <div class="produkt2KosikObr" onclick="kosikAdd(this,'+this.id+')"><div>Přidat do<br>košíku</div></div></div></div>';

            // oddelovaci line, (slaba carka u kazedeho produktu)
            if(!posledniVkategorii) {
                //prvni verze $( "#ulVybratSvacu" ).append( '<li class="produkt '+kategorie[kategorieIndex].name+'" data-id="'+this.id+'"><div class="produktKosik produktKosikObr" onclick="kosikAdd(this,'+this.id+')">Přidat do<br>košíku</div>  <div class="produktPopis" href="">  <img src="'+appPreffix+this.icon+'"  >  <span class="cena">'+ this.price +' Kč</span>  <h3>' + this.name + '</h3>  <span>'+ this.description+'</span>  </div>  <div class="produktLine"></div>  </li>' );

                produktLi += '<div class="produkt2Line">  <div ></div>  </div>  </li>';
            } else
            // posledni polozka specialni format
            {
                //prvni verze $( "#ulVybratSvacu" ).append( '<li class="produkt '+kategorie[kategorieIndex].name+'"><div class="produktKosik produktKosikObr" onclick="kosikAdd(this,'+this.id+')">Přidat do<br>košíku</div>  <div class="produktPopis" href="">  <img src="'+appPreffix+this.icon+'"  >  <span class="cena">'+ this.price +' Kč</span>  <h3>' + this.name + '</h3>  <span>'+ this.description+'</span>  </div>  <div style="clear:both"></div>  </li>' );
                produktLi += ' <div class="">  <div ></div>  </div>  </li>';
            }
            $( "#ulVybratSvacu" ).append(produktLi);
        }

        // posledni zakoncovaci linka kategorie zbozi
        if(poradiZbozi == zbozi.length-1)
        {
            $( "#ulVybratSvacu" ).append( '<li style="height: 3em;background-color:'+ kategorie[kategorieIndexMinula].color +'"></li>');
        }

        //cacheObr(imgUrl,this.id);
        //ImgCache.clearCache();
        //imgCach();
        poradiZbozi ++;
    });
}


function kosikRefresh() {
    kosikSoucetCeny= 0;
    kosik.sort();
    $("#ulKosik").empty();
    $( "#ulKosik" ).append( '<img class="fajnSvacaText"  >');
    $( "#ulKosik" ).append( '<ul id="ulKosikHeader" class="produtkSeznam ulKosikHeader"><li class="listHeader kosikHeader fialova kosikShow f250">  <h2 class="kosikHeaderText">Košík</h2>  </li>  <li class="listHeader kosikHeader zelena objShow f250">  <h3 class="kosikHeaderText">Objednávka</h3>  </li>  </ul>');
    //$( "#ulKosik" ).append( '<li class="produktTyp produktHeaderSpace"><div style="height: 20px"></div></li>' );
    //$( "#ulKosik" ).append( '<li class="listHeader zelena"><h3>Zaplatit sváču</h3></li>' );
    //$.each(kosik, function() {
    for(var i = 0; i< kosik.length; i++)
    {
        // najdi index pole
        var zboziIndex = 0;
        for(var j = 0; j< zbozi.length; j++)
        {
            if(zbozi[j].id == kosik[i]) {
                zboziIndex = j;
            }

        }

        var oblibeneClass = "starOff";
        // zjisti jestli je v oblibenych a ma se zobrazit hvezda
        for(var j = 0; j< zboziOblibene.length; j++)
        {
            if(zboziOblibene[j] == kosik[i]) {
                oblibeneClass = "starOn";
            }

        }

        kosikSoucetCeny += Number(zbozi[zboziIndex].price);
        /*
         var produkt = '<li class="produkt"><div class="produktKosik produktKosikObrObbOdebrat modra" onclick="kosikRemoveNeboOblibene('+i+')"><div class="kosikShow">Odebrat<br>z košíku</div><div class="objShow">Přidat do<br>oblíbených</div></div><div class="produktPopis" href="">  <img src="'+appPreffix+zbozi[zboziIndex].icon+'"  >  <span class="cena">'+ zbozi[zboziIndex].price +' Kč</span>  <h3>' +zbozi[zboziIndex].name + '</h3>  <span>'+ zbozi[zboziIndex].description+'</span></div>'
         if(i<kosik.length-1) produkt += '<div class="produktLine"></div></li>'
         else produkt += '<div class="produktLineNO"></div></li>'
         $( "#ulKosik" ).append(produkt);
         // old $( "#ulKosik" ).append( '<li class="produkt"><div class="produktKosik produktKosikObr modra" onclick="zboziOblibeneAdd('+this+')">Přidat do<br>oblíbených</div><div class="produktPopis" href="">  <img src="'+appPreffix+zbozi[zboziIndex].icon+'"  >  <span class="cena">'+ zbozi[zboziIndex].price +' Kč</span>  <h3>' +zbozi[zboziIndex].name + '</h3>  <span>'+ zbozi[zboziIndex].description+'</span>  </div>  <div class="produktLine"></div>  </li>' );

         // old $( "#ulKosik" ).append( '<li class="produkt"><a class="produktKosik produktKosikObr blueOblibene" onclick="zboziOblibeneAdd('+this+')">Přidat do<br>oblíbených</a><a class="produktPopis" href="#">  <img src="'+appPreffix+zbozi[zboziIndex].icon+'"  >  <span class="cena">'+zbozi[zboziIndex].price+' Kč</span>  <h3>'+zbozi[zboziIndex].name+'</h3>  <span>'+zbozi[zboziIndex].description+'</span>  </a>  <div class="produktLine"></div>  </li>' );
         */
        var imgUrl = cacheGetImgUrl(zbozi[zboziIndex].icon);
        var produkt = '<li class="produkt2" data-id="'+kosik[i]+'"> <div> <div class="produkt2Leva bila produkt2Popis"><img src="'+imgUrl+'"  ><h3>' + zbozi[zboziIndex].name + '</h3>  <span>'+ zbozi[zboziIndex].description+'</span><span class="cena">'+ zbozi[zboziIndex].price+' Kč</span> <div class="cena star '+oblibeneClass+'" onclick="zboziOblibeneAddRem('+kosik[i]+', this)" ></div>  </div>  <div class="produkt2Prava colorObjednatOdebrat">  <div class="produkt2KosikObr" onclick="kosikRemoveNeboOblibene('+i+')"><div class="produkt2KosikObrOdebrat kosikShow">Odebrat<br>z košíku</div><div class="produkt2KosikObrOblibene objShow">Přidat do<br>oblíbenych</div></div>  </div>  </div>';

        if(i<kosik.length-1) produkt += '<div class="produkt2Line">  <div ></div>  </div>  </li>';
        else produkt += '<div class="produkt2LineNO">  <div ></div>  </div>  </li>';
        $( "#ulKosik" ).append(produkt);

    }

    $( "#kosikSoucetCenyH" ).text("Celkem " + kosikSoucetCeny + " Kč");
    $( "#dokoncitPlatbuSoucetCenyH" ).text("Celkem " + kosikSoucetCeny + " Kč");
}


// zapne/vypne hvezdu oblibeni u shodnych produktu
function kosikRefreshStars(kosikID,classa)
{
    $("#ulKosik").find("li").each(function(index){
        if($(this).attr("data-id")==kosikID)
        {
            console.log(index);
            var divStar = $(this).find('div[class*="star"]');
            //$(divStar).attr("class","cena star starOff ");
            $(divStar).attr("class","cena star " + classa);

        }
});
}

function zboziOblibneRefresh() {
    zboziOblibene.sort();
    $("#ulMojeOblibene").empty();

    for(var j = 0; j< zboziOblibene.length; j++)
    {
        //$.each(zboziOblibene, function() {
        var zboziIndex = 0;
        for(var i = 0; i< zbozi.length; i++)
        {
            if(zbozi[i].id == zboziOblibene[j]) {
                zboziIndex = i;
            }
        }

        imgUrl = cacheGetImgUrl(zbozi[zboziIndex].icon);

            //$( "#ulMojeOblibene" ).append( '<li class="produkt"><div class="produktKosik produktKosikObr" onclick="kosikAdd(this,'+this.id+')">Přidat do<br>košíku</div>  <div class="produktPopis" href="">  <img src="'+appPreffix+zbozi[zboziIndex].icon+'"  >  <span class="cena">'+ zbozi[zboziIndex].price +' Kč</span>  <h3>' + zbozi[zboziIndex].name + '</h3>  <span>'+ zbozi[zboziIndex].description+'</span>  </div>  <div class="produktLine"></div>  </li>' );
        var produktLi='<li class="produkt2" data-id="'+zbozi[zboziIndex].id+'"> <div> <div class="produkt2Leva bila produkt2Popis"><img src="'+imgUrl+'"  ><h3>' + zbozi[zboziIndex].name + '</h3>  <span>'+ zbozi[zboziIndex].description+'</span><span class="cena">'+ zbozi[zboziIndex].price+' Kč</span>  </div>  <div class="produkt2Prava zelena">  <div class="produkt2KosikObr" onclick="kosikAdd(this,'+zbozi[zboziIndex].id+')"><div>Přidat do<br>košíku</div></div></div></div>';

        // posledni polozka bez line
        if(j==zboziOblibene.length-1 && zboziOblibenaMena.length ==0)
        {
            produktLi += ' <div class="">  <div ></div>  </div>  </li>';
        } else
        {
            produktLi += '<div class="produkt2Line">  <div ></div>  </div>  </li>';
        }

        $( "#ulMojeOblibene" ).append(produktLi);
    }

    // --------------------------------------------------- oblibena mana zvlast zde

    for(var j = 0; j< zboziOblibenaMena.length; j++)
    {
        var zboziIndex = 0;
        for(var i = 0; i< zbozi.length; i++)
        {
            if(zbozi[i].id == zboziOblibene[j]) {
                zboziIndex = i;
            }
        }



        var celkovaCena = 0;
        var produktIn = "";
        for(var p = 0; p< zboziOblibenaMena[j][0].length; p++)
        {
            var zboziIndex = zboziOblibenaMena[j][0][p];
            var imgUrl = cacheGetImgUrl(zbozi[zboziIndex].icon);
            produktIn += '<img src="'+imgUrl+'"  >';
            celkovaCena += parseInt(zbozi[zboziIndex].price);
        }
        var produktSu = '<div class="cena star trash" onclick="zboziOblibenaMenaRem('+j+')"></div> </div>  <div class="produkt2Prava zelena">  <div class="produkt2KosikObr" onclick="kosikAddMenu('+j+')"><div>Přidat do<br>košíku</div></div></div></div>';

        // oddelovaci line
        if(j!=zboziOblibenaMena.length-1) {
            //prvni verze $( "#ulVybratSvacu" ).append( '<li class="produkt '+kategorie[kategorieIndex].name+'" data-id="'+this.id+'"><div class="produktKosik produktKosikObr" onclick="kosikAdd(this,'+this.id+')">Přidat do<br>košíku</div>  <div class="produktPopis" href="">  <img src="'+appPreffix+this.icon+'"  >  <span class="cena">'+ this.price +' Kč</span>  <h3>' + this.name + '</h3>  <span>'+ this.description+'</span>  </div>  <div class="produktLine"></div>  </li>' );

            produktSu += '<div class="produkt2Line">  <div ></div>  </div>  </li>';
        } else
        // posledni polozka specialni format
        {
            //prvni verze $( "#ulVybratSvacu" ).append( '<li class="produkt '+kategorie[kategorieIndex].name+'"><div class="produktKosik produktKosikObr" onclick="kosikAdd(this,'+this.id+')">Přidat do<br>košíku</div>  <div class="produktPopis" href="">  <img src="'+appPreffix+this.icon+'"  >  <span class="cena">'+ this.price +' Kč</span>  <h3>' + this.name + '</h3>  <span>'+ this.description+'</span>  </div>  <div style="clear:both"></div>  </li>' );
            produktSu += ' <div class="">  <div ></div>  </div>  </li>';
        }

        //$( "#ulMojeOblibene" ).append( '<li class="produkt"><div class="produktKosik produktKosikObr" onclick="kosikAdd(this,'+this.id+')">Přidat do<br>košíku</div>  <div class="produktPopis" href="">  <img src="'+appPreffix+zbozi[zboziIndex].icon+'"  >  <span class="cena">'+ zbozi[zboziIndex].price +' Kč</span>  <h3>' + zbozi[zboziIndex].name + '</h3>  <span>'+ zbozi[zboziIndex].description+'</span>  </div>  <div class="produktLine"></div>  </li>' );
        var produktPre='<li class="produkt2" data-id="'+zbozi[zboziIndex].id+'"> <div> <div class="produkt2Leva bila produkt2Menu"><h3>' + zboziOblibenaMena[j][1] + '</h3> <span class="cena">'+celkovaCena+' Kč</span>';

        $( "#ulMojeOblibene" ).append(produktPre+produktIn+produktSu);


        // old $( "#ulKosik" ).append( '<li class="produkt"><a class="produktKosik produktKosikObr blueOblibene" onclick="zboziOblibeneAdd('+this+')">Přidat do<br>oblíbených</a><a class="produktPopis" href="#">  <img src="'+appPreffix+zbozi[zboziIndex].icon+'"  >  <span class="cena">'+zbozi[zboziIndex].price+' Kč</span>  <h3>'+zbozi[zboziIndex].name+'</h3>  <span>'+zbozi[zboziIndex].description+'</span>  </a>  <div class="produktLine"></div>  </li>' );
    }
}

function objednavkaOdelsatAjax(objednavka, typ) {

    console.log("objednavkaOdelsatAjax typ:" + typ);

    var delivery = "bufet";
    var mistoDoruceni = "";
    if( $('#checkBoxDonaskaKuryrem').is(':checked')==true)
    {
        mistoDoruceni = $('#mistoDoruceniInput').val();

        if(mistoDoruceni=="" && typ == 1)
        {
            alertZobraz("Zadej místo doručení");
            return;
        }

        delivery = "kuryr";
        console.log("objednavkaOdelsatAjax mistoDoruceni:" + mistoDoruceni);
    }
    console.log("objednavkaOdelsatAjax delivery:" + delivery);

    $.ajax({
        type: 'POST',
        url: 'http://demo.livecycle.cz/fajnsvaca/api/createOrder',
        data : {
            proceed: typ,
            basket: objednavka,
            delivery: delivery,
            deliveryPlace: mistoDoruceni
        },
        success : function(data) {
            console.log("objednavkaOdelsatAjax typ:" + typ + " success");

            if( data.status == "error" && data.code == "not logged")
            {
                console.log("objednavkaOdelsatAjax data.msg:" + data.msg);
                alertZobraz(data.msg);
                prihlaseniZobrazDialog();
                return;
            }
            if( data.status == "error" && data.code == "notBalance")
            {
                console.log("objednavkaOdelsatAjax data.msg:" + data.msg);
                $('#dokoncitObjednavkuVyse').text(kosikSoucetCeny + " Kč");
                $('#okoncitObjednavkuKredit').text(data.balanceBefore==null?(profil.balance + " Kč"):(data.balanceBefore+" Kč"));
                $('#okoncitObjednavkuZustatek').text(data.balanceAfter==null?"0 Kč":(data.balanceAfter+" Kč"));
                /*
                 $('#dokoncitPlatbuNegativniText').css("display","block");
                 $('#dokoncitPlatbuDobitButton').css("display","block");
                 $('#dokoncitPlatbuPozitivniText').css("display","none");
                 $('#dokoncitPlatbuPotvrditButton').css("display","none");
                 */
                $('#page-dokoncitPlatbu').attr('class', 'page-dokoncitPlatbu negativni');
                transition("#page-dokoncitPlatbu","fade");
                return;
            }

            if(typ==0) {
                // TODO zjistit jeslti je ok
                if(data.status=="ok")
                {
                    $('#dokoncitObjednavkuVyse').text(kosikSoucetCeny + " Kč");
                    $('#okoncitObjednavkuKredit').text(data.balanceBefore==null?(profil.balance + " Kč"):(data.balanceBefore+" Kč"));
                    $('#okoncitObjednavkuZustatek').text(data.balanceAfter==null?"0 Kč":(data.balanceAfter+" Kč"));
                    /*
                     $('#dokoncitPlatbuPozitivniText').css("display","block");
                     $('#dokoncitPlatbuPotvrditButton').css("display","block");
                     $('#dokoncitPlatbuNegativniText').css("display","none");
                     $('#dokoncitPlatbuDobitButton').css("display","none");
                     */
                    $('#page-dokoncitPlatbu').attr('class', 'page-dokoncitPlatbu pozitivni');
                    transition("#page-dokoncitPlatbu","fade");
                } else
                {
                    // TODO dodelat negativni stranku
                    //transition("#page-dokoncitNegativnii","fade");
                }

            }
            if(typ==1) {
                // TODO dokoncit negativni cast
                if(data.status=="ok")
                {
                    $('#potvrzeniPlatbyKredit').text(data.balanceAfter==null?"0 Kč":("Kredit: " + data.balanceAfter + " Kč"));
                    transition("#page-potvrzeniPlatby","fade");
                    /*
                     kosik = [];
                     kosikRefresh();
                     kosikPocetPolozek = 0;
                     kosikZobrazCisloVkolecku();
                     */
                    pageNext = "";
                    nacistDataPoPrihlaseni();
                }

            }
            if(data.status=="error")
            {
                //alertZobraz(data.msg);
                console.log(data);
                console.log(data.msg);
            }
        },
        error: function(data)
        {
            ajaxError2(data,true);
        }
    });



    return;
}

function pageObjednat()
{
    $('#page-kosik').attr('class', 'page-kosik objednavka current');
    //$('#kosikZaplatitButton').attr('onClick', "javascript:objednavkaProceed()");
}
function pageKosik()
{
    $('#page-kosik').removeClass('objednavka');
    //$('#page-kosik').attr('class', 'page-kosik current');
    //$('#kosikZaplatitButton').attr('onClick', "javascript:objednavkaProceed()");
}


function objednavkaProceed() {
    if(kosik.length == 0)
    {
        alertZobraz("Košík je prázdný, nelze objednat.");
        return;
    }
    console.log("vytvarim objednavku");
    objednavka = "";
    kosik.sort();
    var pocet = 1;
    for(var i = 0; i< kosik.length; i++)
    {
        if(kosik[i] == kosik[i+ 1]){
            pocet ++;
        }
        else
        {
            if(objednavka.length > 0) {
                objednavka += ",";
            }
            objednavka += + String(kosik[i]) + ":" + String(pocet);
            pocet = 1;
        }

    }
    console.log(objednavka);
    //transition("#page-dokoncitPlatbu","fade");
    objednavkaOdelsatAjax(objednavka,0);

}


function alertZobraz(msg) {
    alert(msg);
}


// =============================================================================== validace poli
var nepovoleneZnaky = "";

function validateDo(keyCode, rule) {
    var k = keyCode;
    if(rule==null)
    {
        return true;
    }
    // TODO regularni vyraz
    // 63 = @

    if(rule=="username")
    {
        // pismena mala velka, cisla, backpsace, mezera, enter
        return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 13 || k == 32 || (k >= 48 && k <= 57));
    }
    if(rule=="email")
    {
        //k = String.fromCharCode(k);
        //var isEmail_re = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
        //if(String(k).search (isEmail_re) != -1) return true;

        //var reg = new RegExp("^[0-9a-zA-Z]+@[0-9a-zA-Z]+[\.]{1}[0-9a-zA-Z]+[\.]?[0-9a-zA-Z]+$");
        //return reg.test(k);

        return true;
    }
}

// validace znaku
function validateKeyCharacters(e,rule) {
    var k;
    document.all ? k = e.keyCode : k = e.which;
    return validateDo(k,rule)
}

// validace vlozeneho textu
function validateCharacters(e,input,rule) {
    if(!validateCharactersDo(e,rule))
    {
        // resi se vypsanim textu pod input
        //alert("Text obsahuje nepovolené znaky: " + nepovoleneZnaky);
    } else
    {
        $(input).next().text("");
    }
}

function validateCharactersDo(e,rule) {
    console.log("validateCharactersDo e=" + e);
    nepovoleneZnaky = "";

    if(rule=="email")
    {
        var isEmail_re = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
        if(String(e).search (isEmail_re) != -1)
        {
            console.log("email true");
            return true;
        }
        else
        {
            console.log("email false");
            return false;
        }
    }


    var validnost = true;
    if(e==null || e=="")
    {
        console.log("validateCharactersDo e je prazdne");
        nepovoleneZnaky = "prazdne";
        return false;
    }
    for(var i=0; i<e.length;i++)
    {
        //alert("kontroluji:" + e.substring(i,i+1));
        //alert(validateKeyCharacters(e.substring(i,i+1)));
        var k = e.substring(i,i+1).charCodeAt(0);
        if(!validateDo(k,rule))
        {
            nepovoleneZnaky += e.substring(i,i+1);
        }
    }
    //alert(e);
    if(nepovoleneZnaky!="")
    {
        //alert("Text obsahuje nepovolené znaky: " + nepovoleneZnaky);
        validnost = false;
    }
    return validnost;
}



// validace password poli po vlozeni
function validatePassword(e, input) {
    if(!validatePasswordDo(e))
    {
        //alert("Hesla se neshoduji!");
        //$('#registraceHeslo2').next().text("Zadaná hesla se neshodují");
    }
    else
    {
        $(input).next().text("");
    }
}

function validatePasswordDo(e) {
    console.log("validatePasswordDo");
    var validnost = true;
    // validnost textu
    if(e==null) return true;
    if(validateCharactersDo(e))
    {
        $('#registraceHeslo').next().text("");
        $('#registraceHeslo2').next().text("");

        // reseni delky hesel
        if($("#registraceHeslo").val().length<4)
        {
            validnost = false;
            $('#registraceHeslo').next().text("Heslo musí dlouhé alespoň 4 znaky");
        }
        if($("#registraceHeslo2").val().length<4)
        {
            validnost = false;
            $('#registraceHeslo2').next().text("Heslo musí dlouhé alespoň 4 znaky");
        }


        // reseni shody hesel
        if(validnost)
        {
            if($("#registraceHeslo").val() != $("#registraceHeslo2").val())
            {
                validnost = false;
                console.log("validatePasswordDo hesla nejou shodna");
                $('#registraceHeslo2').next().text("Zadaná hesla se neshodují");
            } else
            {
                console.log("validatePasswordDo hesla jsou shodna");
                $('#registraceHeslo2').next().text("");
            }
        }




    } else
    {
        validnost = false;
    }
    return validnost;

}

function validatePasswordDo_old(e) {
    console.log("validatePasswordDo");
    var validnost = true;
    // validnost textu
    if(e==null) return true;
    if(validateCharactersDo(e))
    {
        console.log("validatePasswordDo reseni shody");
        // reseni shody hesel
        if($( "#registraceHeslo2" ).val() !="")
        {
            if($("#registraceHeslo").val() != $("#registraceHeslo2").val())
            {
                validnost = false;
                console.log("validatePasswordDo hesla nejou shodna");
                $('#registraceHeslo2').next().text("Zadaná hesla se neshodují");
            }
            else if($("#registraceHeslo").val().length<5)
            {
                validnost = false;
                console.log("validatePasswordDo hesla nejou shodna");
                $('#registraceHeslo').next().text("Heslo musí dlouhé alespoň 4 znaky");
            }
            else if($("#registraceHeslo2").val().length<5)
            {
                validnost = false;
                console.log("validatePasswordDo hesla nejou shodna");
                $('#registraceHeslo2').next().text("Heslo musí dlouhé alespoň 4 znaky");
            } else
            {
                console.log("validatePasswordDo hesla jsou shodna");
                $('#registraceHeslo').next().text("");
                $('#registraceHeslo2').next().text("");
            }
        }
    } else
    {
        validnost = false;
    }
    return validnost;

}

// validace polí registrace
function validateRegistrace() {
    //console.log("aaaaccc" + );
    var validnost = true;
    if(!validateCharactersDo($("#registraceUsername").val(),"username"))
    {
        validnost = false;
        if(nepovoleneZnaky=="prazdne")
        {
            $('#registraceUsername').next().text("Přihlašovací jméno nemůže být prázdné");

        } else
            $('#registraceUsername').next().text("Přihlašovací jméno obsahuje nepovolené znaky: " + nepovoleneZnaky);
        //alertZobraz("Přihlašovací jméno obsahuje nepovolené znaky: " + nepovoleneZnaky);
    }
    /*    if(!validateCharactersDo($("#registraceJmeno").val()) && validnost)
     {
     validnost = false;
     alertZobraz("Jméno obsahuje nepovolené znaky: " + nepovoleneZnaky);
     }
     */

    if(!validateCharactersDo($("#registracePrijmeni").val().indexOf(" ") != -1))
    {

        $('#registracePrijmeni').next().text("Vložte jméno a příjmení");

    }

    if(!validateCharactersDo($("#registracePrijmeni").val()))
    {
        validnost = false;
        if(nepovoleneZnaky=="prazdne")
        {
            $('#registracePrijmeni').next().text("Jméno a příjmení nemůže být prázdné");

        } else
        {
            $('#registracePrijmeni').next().text("Jméno a příjmení obsahuje nepovolené znaky: " + nepovoleneZnaky);
            //alertZobraz("Jméno a příjmení obsahují nepovolené znaky: " + nepovoleneZnaky);
        }

    }

    if(!validateCharactersDo($("#registraceHeslo").val()) && !registraceDoplnitFB)
    {
        validnost = false;
        if(nepovoleneZnaky=="prazdne")
        {
            $('#registraceHeslo').next().text("Heslo nemůže být prázdné");

        } else
        {
            //alertZobraz("Heslo obsahuje nepovolené znaky: " + nepovoleneZnaky);
            $('#registraceHeslo').next().text("Heslo obsahuje nepovolené znaky: " + nepovoleneZnaky);
        }

    }
    if(!validateCharactersDo($("#registraceHeslo2").val())  && !registraceDoplnitFB)
    {
        validnost = false;
        if(nepovoleneZnaky=="prazdne")
        {
            $('#registraceHeslo2').next().text("Potvrzení hesla nemůže být prázdné");

        } else
        {
            //alertZobraz("Potvrzení hesla obsahuje nepovolené znaky: " + nepovoleneZnaky);
            $('#registraceHeslo2').next().text("Potvrzení hesla obsahuje nepovolené znaky: " + nepovoleneZnaky);
        }
    }
    if(!validatePasswordDo("nutne"))
    {
        console.log("validatePasswordDo false");
        validnost = false;
        //alertZobraz("Hesla se neshodují");
        //$('#registraceHeslo2').next().text("Zadaná hesla se neshodují kk");
    }
    if(!validateCharactersDo($("#registraceEmail").val(),"email"))
    {
        validnost = false;
        $('#registraceEmail').next().text("Zadaný email není platný");
     /*
        //alertZobraz("E-mail obsahuje nepovolené znaky: " + nepovoleneZnaky);
        if(nepovoleneZnaky=="prazdne")
        {
            $('#registraceEmail').next().text("Email nemůže být prázdný");

        } else
        {
            $('#registraceEmail').next().text("Email obsahuje nepovolené znaky: " + nepovoleneZnaky);
        }
        */
    }
    return validnost;

}
// =============================================================================== ruzne funkce
function centreSelect(box)
{
    for(var data={longest:0}, i=0, opts=box.options, len=opts.length; i<len; i++)
        if(opts[i].text.length>data.longest)
        {
            data.longest=opts[i].text.length;
            data.idx=i;
        }

    for(i=0,h=data.longest/2,pad=''; i<h; i++)
        pad+='\xa0';

    for(var i=0, space; i<len; i++)
        if( i!=data.idx )
            opts[i].text=(space=pad.substring(0,(data.longest-opts[i].text.length)/2))+opts[i].text+space;
}

function testMinObsahu(nextPage)
{
    if(kosik.length<1)
    {
        alertZobraz("Nejrpve si vyber dnešní sváču");
        return;
    }
    transition(nextPage,"fade");
}

function doruceniChange()
{
    // aktualni hodnoty
    var dokoncitObjednavkuVyse = $('#dokoncitObjednavkuVyse').text().split(" ");
    var okoncitObjednavkuZustatek = $('#okoncitObjednavkuZustatek').text().split(" ");
    var dokoncitPlatbuSoucetCenyH = $('#dokoncitPlatbuSoucetCenyH').text().split(" ");

    // pricteni odecteni
    if($('#checkBoxVyzvednout').is(':checked')==true)
    {
        $('#mistoDoruceniDiv').css('display','none');
        dokoncitObjednavkuVyse = Number(dokoncitObjednavkuVyse[0]) - donaskaKuryremCena;
        okoncitObjednavkuZustatek = Number(okoncitObjednavkuZustatek[0]) + donaskaKuryremCena;
        dokoncitPlatbuSoucetCenyH = Number(dokoncitPlatbuSoucetCenyH[1]) - donaskaKuryremCena;
    } else
    {
        $('#mistoDoruceniDiv').css('display','block');
        dokoncitObjednavkuVyse = Number(dokoncitObjednavkuVyse[0]) + donaskaKuryremCena;
        okoncitObjednavkuZustatek = Number(okoncitObjednavkuZustatek[0]) - donaskaKuryremCena;
        dokoncitPlatbuSoucetCenyH = Number(dokoncitPlatbuSoucetCenyH[1]) + donaskaKuryremCena;
    }

    // zapsani hodnot
    $('#dokoncitObjednavkuVyse').text(dokoncitObjednavkuVyse + " Kč");
    $('#okoncitObjednavkuZustatek').text(okoncitObjednavkuZustatek + " Kč");
    $('#dokoncitPlatbuSoucetCenyH').text("Celkem " + dokoncitPlatbuSoucetCenyH + " Kč");

}

function nactiObr()
{

    $('#testImg').attr('src',$('#testInput').val());
}

function firstProductUrl()
{
    alert( $("#ulVybratSvacu").find("li[data-id=1]").find("img").attr("src") );
}
function firstKosikUrl()
{
    alert( $("#ulKosik").find("li").find("img").attr("src") );
}
function log(msg)
{
    $("#log").html($('#log').html() + "<br>" + msg);
    $("#logContainer").scrollTop( $("#log").height() );
    console.log(msg);

}
function registraceVymazatForm()
{
    $("#registraceSelectSkola").val("0");
    $("#registraceSelectedSkola").html("VYBERTE ŠKOLU");
    $("#registraceSelectTrida").val("0");
    $("#registraceSelectedTrida").html("VYBERTE TŘÍDU");

    $("#registraceUsername").val("");
    $('#registraceUsername').prop("disabled", false);
    $("#registraceEmail").val("");
    $("#registracePrijmeni").val("");
    $("#checkBoxRegistraceHolka").prop("checked","true");
    $("#registraceHeslo").val("");
    $("#registraceHeslo").css("display","block");
    $("#registraceHeslo2").val("");
    $("#registraceHeslo2").css("display","block");
    $("#page-registrace2").find(".prihlaseniPrihlasitButns").text("Zaregistrovat");
}
function registraceDoplnit(response)
{
    /*

    $("#page-registrace1").find(".registrace1horni").find("h3").text("Doplnění registrace");
    $("#page-registrace1").find(".registrace1horni").find("span").css("display","none");
    $("#page-registrace1").find(".prihlaseniPrihlasitButns").text("Uložit");
    $("#page-registrace1").find(".prihlaseniPrihlasitButns").on('click', function(e){

    });
    transition("#page-registrace1","fade");

     response = new Object();
     response.first_name = "Zdenek";
     response.gender = "male";
     response.id = "1509071250";
     response.last_name = "Pavlicek";
    */
    registraceDoplnitFB = true;
    transition("#page-registrace1","fade");
    alertZobraz("Doplň prosím registraci");
    $("#registraceUsername").val(response.id);
    $('#registraceUsername').prop("disabled", true);
    $("#registraceEmail").val("");
    $("#registracePrijmeni").val(response.first_name==null?"":response.first_name + " " + response.last_name==null?"":response.last_name);
    if(response.gender == "male")
    {
        $("#checkBoxRegistracekluk").prop("checked","true");
    } else
    {
        $("#checkBoxRegistraceHolka").prop("checked","true");
    }
    $("#registraceHeslo").val("");
    $("#registraceHeslo").css("display","none");
    $("#registraceHeslo2").val("");
    $("#registraceHeslo2").css("display","none");
    $("#page-registrace2").find(".prihlaseniPrihlasitButns").text("Uložit");


}
