/**
 * Created by Zdenda on 23.1.14.
 */

/* =================================================== storage =========================================================
uklada data (jSON)

mobil -
- app se pusti nove
	- nacte se 			


synchro aplikace
- zkusi se nacist on-line zbozi
    - ok
        - nacte se zbozi
        - nacte se profil
        - ulozi se
    - ko
        - nacte se storage zbozi
        - i profil

- nacteni zbozi
    - nacte json
    - kontrola obrazku, dostazeni novych obrazku

*/




function testsave()
{
    var neco = $('#testInput').val();
    console.log(neco);
    window.localStorage.setItem("key", neco );
}
function testload()
{
    var neco = window.localStorage.getItem("key");
    //var neco = window.localStorage.getItem("uu");
    //if(window.localStorage.getItem("uu")==null) alert("null");
    console.log(neco);
    $('#testInput').val(neco);
}

// nacte podle nazvu promene a jeho typu pr: storageLoad("dataZbozi",false);
// getItemSetItem:  "getItem" nebo "setItem"
// variableNames:   "dataZbozi,dataProfil"
// typ:             jSON,string
function storage(getItemSetItem,variableNames,typ)
{
	//console.log("zobbrazuji:" + (window.localStorage.getItem("dataProfil")));
    var arr = variableNames.split(",");
    for(var i=0;i<arr.length;i++)
    {
        console.log("storage: "+ arr[i]);

        // pro getItem kontrola na null
        if(getItemSetItem=="getItem" && window.localStorage.getItem(arr[i])!=null)
        {
            //dataZbozi = JSON.parse(window.localStorage.getItem("dataZbozi"));
            if(typ=="string")
            {
                eval(arr[i] + ' = window.localStorage.getItem("'+arr[i]+'")');
            }
            if(typ=="jSON")
            {
                eval(arr[i] + ' = JSON.parse(window.localStorage.getItem("'+arr[i]+'"))');
            }
        }
        if(getItemSetItem=="setItem")
        {
            //dataZbozi = JSON.parse(window.localStorage.getItem("dataZbozi"));
            if(typ=="string")
            {
                eval(arr[i] + ' = window.localStorage.setItem("'+arr[i]+'"'+arr[i]+')');
            }
            if(typ=="jSON")
            {
                eval('window.localStorage.setItem("'+arr[i]+'",JSON.stringify('+arr[i]+'))');
            }
        }
    }
}
/*
function storageSave(type)
{
    console.log("storageSave:" + type);
    if(type.indexOf("dataZbozi") != -1)
    {
        window.localStorage.setItem("dataZbozi", JSON.stringify(dataZbozi) );
        console.log("dataZbozi");
    }
    //console.log(JSON.stringify(dataZbozi));
    //console.log(dataZbozi);
    if(type.indexOf("dataKategorie") != -1) window.localStorage.setItem("dataKategorie", JSON.stringify(dataKategorie) );
    if(type.indexOf("dataProfil") != -1) window.localStorage.setItem("dataProfil", JSON.stringify(dataProfil) );
}
*/
//==================================================== image cache =====================================================
//==================================================== pure phoneGap API File a FileTransfer
// nepouzivam
function storeIntelligrapeLogo(){
    alert("jdu na vec!")
    var url = "http://www.intelligrape.com/images/logo.png"; // image url
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        alert("LocalFileSystem");
        var imagePath = fs.root.fullPath + "/logo.png"; // full file path
        var fileTransfer = new FileTransfer();
        fileTransfer.download(url, imagePath, function (entry) {
            alert("hotovo");
            alert(entry.fullPath); // entry is fileEntry object
        }, function (error) {
            alert.log("Some error");
        });
    })
}
//===================================================== https://github.com/chrisben/imgcache.js
/*
- vyzaduje phoneGap API File a FileTransfer
- funguje v browseru chrome
*/

var cacheListShaFileName = [];

/*
    if (typeof(cordova) !== 'undefined') {
        // cordova test
        document.addEventListener('deviceready', deviceready, false);
    } else {
        // normal browser test
        $(document).ready(docReady);
    }
*/




function cacheInit()
{

    ImgCache.options.debug = true;
    ImgCache.options.usePersistentCache = true;
    ImgCache.options.chromeQuota = 50*1024*1024;

    console.log("cacheInit");
        ImgCache.init(function(){
            console.log('cache space ready');
            //cacheListShaFileNameGet();
            cachePreffix=ImgCache.getCacheFolderURI();
            //init();
        }, function(){
            alert('cache problem');
            console.log('cache space problem!');
            //init();
        });
    init();
}

function cacheInit2()
{
        //alert("cacheListShaFileNameGet");
        //cacheListShaFileNameGet();
        init();
}

// vyhleda obr v cache, jestli neni vrati puvodni url
// ulozi do cache?
function cacheGetImgUrl(filePath)
{
    var cacheImgName = cacheFileIsCachedReturnName(appServerUrlPreffix+"/"+filePath);
    //console.log("cacheImgName" + cacheImgName);
    if(cacheImgName!="")
    {
        return cachePreffix + "/" + cacheImgName;
    }
    else
    {

        // zalohuj
        ImgCache.cacheFile(appServerUrlPreffix+"/"+filePath,
            function(){
                //console.log("ukladam do cache: " +filePath);
            },
            function(){
                console.log("error ulozeni obr do cache!")
            }
        );

        return appServerUrlPreffix+"/"+filePath;
    }
}

function cacheObr2(filePath)
{
    var images = $("#ulVybratSvacu").find("img");
    console.log("pocet obr:"+ images.length);

    var aa=[];
    var pocet =0;
    $("#ulVybratSvacu").find("img").each(function() {
        aa[pocet] = this;
        pocet ++;
        console.log("pocet"+ pocet);
    });

    target = $(aa[2]);
    console.log("path"+ target.attr('src'));

        //target=  $( this );
        if(target.attr('src')== undefined) return;
        console.log("for cache:" + target.attr('src'));
        //target = $("img[src='"+filePath+"']");
        ImgCache.isCached(target.attr('src'), function(path, success){
            if(success){
                // already cached
                console.log("already cached");
                ImgCache.useCachedFile(target);
            } else {
                // not there, need to cache the image
                ImgCache.cacheFile(target.attr('src'), function(){
                    ImgCache.useCachedFile(target);
                    console.log("cached");
                });
            }
        });


    //target = $("li").find("[data-id='" + dataId + "']").children(":first").children(":first");

}

// each(function()
function cacheObr3(filePath)
{
    var images = $("#ulVybratSvacu").find("img");
    console.log("pocet obr:"+ images.length);

    var aa=[];
    var pocet =0;
    $("#ulVybratSvacu").find("img").each(function() {



    target = $( this );
    console.log("path"+ target.attr('src'));

    //target=  $( this );
    if(target.attr('src')== undefined) return;
    console.log("for cache:" + target.attr('src'));
    //target = $("img[src='"+filePath+"']");
    ImgCache.isCached(target.attr('src'), function(path, success){
        if(success){
            // already cached
            console.log("already cached");
            ImgCache.useCachedFile(target);
        } else {
            // not there, need to cache the image
            ImgCache.cacheFile(target.attr('src'), function(){
                ImgCache.useCachedFile(target);
                console.log("cached");
            });
        }
    });
    });

    //target = $("li").find("[data-id='" + dataId + "']").children(":first").children(":first");

}

function cacheListShaFileNameGet()
{

    //console.log(ImgCache.getCacheFolderURI());  // filesystem:http://localhost:63342/temporary/imgcache
    //console.log("Root = " + ImgCache.filesystem.root.fullPath);
    //console.log("sha:" + SHA1("http://www.coca-cola.cz/download/007/106/portfolio_COLA_ZERO_07.png"));

    //alert("start cacheListShaFileNameGet");
    ImgCache.filesystem.root.getDirectory("imgcache", {create: true, exclusive: false},
        function(dirEntry)
        {
            var directoryReader = dirEntry.createReader();
            directoryReader.readEntries(function(entries) {
                var i;
                var str ="";
                for (i=0; i<entries.length; i++) {
                    console.log("cacheListShaFileNameGet: "+entries[i].name);
                    cacheListShaFileName[i] = entries[i].name;
                    str += entries[i].name + "\n";
                }
                alert(str);
            }, function (error) {
                alert("cacheListShaFileNameGet " + error.code);
            })

        }
        ,
        function(dirEntry)
        {
            console.log("cacheListShaFileNameGet dirEntry problem");
        }
    );
    //alert("end cacheListShaFileNameGet");
}

/***********************************************
 tiny-sha1 r4
 MIT License
 http://code.google.com/p/tiny-sha1/
 ***********************************************/
function SHA1(s){function U(a,b,c){while(0<c--)a.push(b)}function L(a,b){return(a<<b)|(a>>>(32-b))}function P(a,b,c){return a^b^c}function A(a,b){var c=(b&0xFFFF)+(a&0xFFFF),d=(b>>>16)+(a>>>16)+(c>>>16);return((d&0xFFFF)<<16)|(c&0xFFFF)}var B="0123456789abcdef";return(function(a){var c=[],d=a.length*4,e;for(var i=0;i<d;i++){e=a[i>>2]>>((3-(i%4))*8);c.push(B.charAt((e>>4)&0xF)+B.charAt(e&0xF))}return c.join('')}((function(a,b){var c,d,e,f,g,h=a.length,v=0x67452301,w=0xefcdab89,x=0x98badcfe,y=0x10325476,z=0xc3d2e1f0,M=[];U(M,0x5a827999,20);U(M,0x6ed9eba1,20);U(M,0x8f1bbcdc,20);U(M,0xca62c1d6,20);a[b>>5]|=0x80<<(24-(b%32));a[(((b+65)>>9)<<4)+15]=b;for(var i=0;i<h;i+=16){c=v;d=w;e=x;f=y;g=z;for(var j=0,O=[];j<80;j++){O[j]=j<16?a[j+i]:L(O[j-3]^O[j-8]^O[j-14]^O[j-16],1);var k=(function(a,b,c,d,e){var f=(e&0xFFFF)+(a&0xFFFF)+(b&0xFFFF)+(c&0xFFFF)+(d&0xFFFF),g=(e>>>16)+(a>>>16)+(b>>>16)+(c>>>16)+(d>>>16)+(f>>>16);return((g&0xFFFF)<<16)|(f&0xFFFF)})(j<20?(function(t,a,b){return(t&a)^(~t&b)}(d,e,f)):j<40?P(d,e,f):j<60?(function(t,a,b){return(t&a)^(t&b)^(a&b)}(d,e,f)):P(d,e,f),g,M[j],O[j],L(c,5));g=f;f=e;e=L(d,30);d=c;c=k}v=A(v,c);w=A(w,d);x=A(x,e);y=A(y,f);z=A(z,g)}return[v,w,x,y,z]}((function(t){var a=[],b=255,c=t.length*8;for(var i=0;i<c;i+=8){a[i>>5]|=(t.charCodeAt(i/8)&b)<<(24-(i%32))}return a}(s)).slice(),s.length*8))))}
/***********************************************/


function cacheTest()
{
    target = $('#testImg1');
    ImgCache.isCached(target.attr('src'), function(path, success){
        if(success){
            // already cached
            ImgCache.useCachedFile(target);
        } else {
            // not there, need to cache the image
            ImgCache.cacheFile(target.attr('src'), function(){
                ImgCache.useCachedFile(target);
            });
        }
    });
}

function cacheObr(filePath)
{

    //target = $("li").find("[data-id='" + dataId + "']").children(":first").children(":first");
    console.log("for cache:" + filePath);
    target = $("img[src='"+filePath+"']");
    ImgCache.isCached(target.attr('src'), function(path, success){
        if(success){
            // already cached
            console.log("already cached" + filePath);
            ImgCache.useCachedFile(target);
        } else {
            // not there, need to cache the image
            ImgCache.cacheFile(target.attr('src'), function(){
                ImgCache.useCachedFile(target);
                console.log("cached" + filePath);
            });
        }
    });
}

function cacheClear()
{
    ImgCache.clearCache(
        function(){
            alert("succes");
        },
        function(){
            alert("error")
        }
    );
}


function cacheSaveImages(containerID)
{
    $("#"+containerID).find("img").each(function() {
        if($(this).attr("src")==null) return;
        //console.log("uu"+$(this).attr("src"));
        if(!cacheFileIsCached($(this).attr("src")))
        {
            console.log("ukladam do cache: " + $(this).attr("src"));
            ImgCache.cacheFile($(this).attr("src"));
        }
    });
    alert("hotovo");
}

//var imagess;


function cacheLoadImages(containerID)
{

    var imagess=$("#"+containerID).find("img");
    p = imagess.length;
    console.log(p);
    cacheLoadImage(p,imagess)

}

function cacheLoadImage(p, imagess)
{
    target = imagess.eq(p);
    if(target.attr("src")==null)
    {
        if(p>1)
        {
            p--;
            cacheLoadImage(p, imagess);
            return;
        }
        else
        {
            return;
        }
    }
    ImgCache.useCachedFile(target, function(){
            p--;
            if(p>0)
            {
                cacheLoadImage(p,imagess);
            }

        },
        function(){
            console.log('something bad');
        }

    );


}

function cacheLoadImages_nejde(containerID)
{


    $("#"+containerID).find("img").each(function() {
        if($(this).attr("src")==null) return;
        if(cacheFileIsCached($(this).attr("src")))
        {
            alert("sfd");
            console.log("beru zz cache: " + $(this).attr("src"));
            target = $(this);
            target = $('#testImg1');
            ImgCache.useCachedFile(target, function(){
                alert('now using local copy');
            },
                function(){
                    console.log('something bad');
                }

            );

        }
    });


    alert("hotovo");
}


// existuje img v cache?
function cacheFileIsCached(filePath)
{
    var exist = false;
    var testFileShaName = cacheFileShaName(filePath);
    for(var i=0; i<cacheListShaFileName.length;i++)
    {
        //console.log("cahce file:" + cacheListShaFileName[i]);
        if(testFileShaName==cacheListShaFileName[i])
        {
            exist = true;
        }
    }

    return exist;

}

// existuje img v cache
// ano - vrat jeho hash jmeno
function cacheFileIsCachedReturnName(filePath)
{
    var cacheImgName = "";
    var testFileShaName = cacheFileShaName(filePath);
    //console.log("file path:" + filePath);
    //console.log("hledam:" + testFileShaName);
    for(var i=0; i<cacheListShaFileName.length;i++)
    {
        //console.log("cahce file:" + cacheListShaFileName[i]);
        //console.log("porovnavam s" + cacheListShaFileName[i]);
        if(testFileShaName==cacheListShaFileName[i])
        {
            cacheImgName = cacheListShaFileName[i];
            //console.log("nasel jsem:" + testFileShaName);
        }
    }

    return cacheImgName;

}

// prevod imageSourcePath na cache filename ( z /neco/neco/obr.png na 931c60d74039b7632b736347a1c11399d9868b13.png )
function cacheFileShaName(filePath)
{


    var hash= SHA1(filePath);
    var ext = FileGetExtension(URIGetFileName(filePath));
    var filename = hash + (ext ? ('.' + ext) : '');

    //target = $("li").find("[data-id='" + dataId + "']").children(":first").children(":first");
    return filename;

}

// returns extension from filename (without leading '.')
var FileGetExtension = function(filename) {
    if (!filename)
        return '';
    filename = filename.split('?')[0];
    var ext = filename.split('.').pop();
    // make sure it's a realistic file extension - for images no more than 4 characters long (.jpeg)
    if (!ext || ext.length > 4)
        return '';
    return ext;
};
// returns lower cased filename from full URI
var URIGetFileName = function(fullpath) {
    if (!fullpath)
        return;
    //TODO: there must be a better way here.. (url encoded strings fail)
    var idx = fullpath.lastIndexOf("/");
    if (!idx)
        return;
    return fullpath.substr(idx + 1).toLowerCase();
};








//------------------------------------ test
function cacheIt()
{

    ImgCache.cacheFile('http://www.coca-cola.cz/download/007/106/portfolio_COLA_ZERO_07.png',
        function(){
            alert("succes");
        },
        function(){
            alert("error")
        }
    );

}

function getCache()
{
    target = $('#testImg1');
        ImgCache.useCachedFile(target, function(){
            alert('now using local copy');
        });
}


function cacheTest2()
{
    target = $('#testImg1');
    ImgCache.isCached(target.attr('src'), function(path, success){
        if(success){
            alert("already cached");

        } else {
            alert(" not there, need to cache the image!");
        }
    });
}

var imgCach = function() {
    console.log("imgCach start");
    //return;
    /* Note: this is using version 2.x of the imagesloaded library, use of current version might differ */
    $('#ulVybratSvacu').imagesLoaded(function($images, $proper, $broken ) {

        // see console output for debug info
        ImgCache.options.debug = true;
        ImgCache.options.usePersistentCache = true;

        ImgCache.init(function() {
            // 1. cache images
            for (var i = 0; i < $proper.length; i++) {
                ImgCache.cacheFile($($proper[i]).attr('src'));
            }
            // 2. broken images get replaced
            for (var i = 0; i < $broken.length; i++) {
                ImgCache.useCachedFile($($broken[i]));
            }

        });
    });
};

function special()
{
    var path = ImgCache.filesystem.name + " : " + ImgCache.filesystem.root.fullPath
//alert( ImgCache.filesystem.name + " : " + ImgCache.filesystem.root.fullPath);
    path += "svaca/index.html";
    alert(path);
    ImgCache.filesystem.root.getFile(path + "svaca/index.html", { create: false }, fileExists, fileDoesNotExist);
    function fileExists(fileEntry){
        alert("File " + fileEntry.fullPath + " exists!");
    }
    function fileDoesNotExist(){
        alert("file does not exist");
    }
}



