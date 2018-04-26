var jsonPath = "parameters.json";
var api_key = "";
var imageUrlPrefix = "https://image.tmdb.org/t/p/w500/";

loadPageContent();

/*
Fonction permettant le chargement des élements de l'API sur la page
 */
function loadPageContent(){
    loadJSON(
        function(response) {
            //CHARGEMENT DE LA CONFIG
            var jsonContent = JSON.parse(response);
            api_key = jsonContent.parameters.api_key;
            theMovieDb.common.api_key = api_key;

            //FEATURE : AUTO-COMPLETION DE LA BARRE DE RECHERCHE
            // $(document).ready(function(){
            //     $(function(){
                    $('#recherche').autocomplete({
                        source : function(requete, reponse){ // les deux arguments représentent les données nécessaires au plugin
                            $.ajax({
                                url : "http://api.themoviedb.org/3/search/movie?api_key=" + api_key + "&query=" + getConvertedName($('#recherche').val(), true), // on appelle le script JSON
                                dataType : 'json',
                                success : function(donnee){
                                    reponse($.map(donnee.results, function(objet){
                                        return objet.title;
                                    }));
                                }
                            });
                        }
                    });
                // });

            // });


            theMovieDb.movies.getUpcoming({}, getUpcomingOK, getUpcomingNOK);

            $( "#formRecherche" ).submit(function( e) {
                e.preventDefault();

                $(location).attr('href', "movieDetail.html?movieName=" + getConvertedName($('#recherche').val(), false));
            });
        }, jsonPath);
}

function loadJSON(callback, jsonFile) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', jsonFile, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function displaySuccessOrErrorCallback(callbackName, success){
    console.log("Succès du callback " + callbackName + " : " + success + ".");
}

function displayJSON(jsonString){
    console.log(JSON.parse(jsonString));
}

function getConvertedName(name, forAjax){
    var replacement = "";

    if(forAjax){
        replacement = "+";
    }else{
        replacement = "%20";
    }

    return name.replace(" ", replacement);
}

/*
    Méthode avec ajax

    var url = "https://api.themoviedb.org/3/movie/latest?api_key=" + api_key + "&language=fr-FR";
    return callAjax(url);
 */
function callAjax(url){
    $.ajax({
        async: true,
        crossDomain: true,
        url: url,
        method: "GET",
        headers: {},
        url: url,
        success: function(result){
            return result;
        },
        error: function(){
            return false;
        }
    });
}

//--------------------------------------------------------
//CALLBACKS
//--------------------------------------------------------
//Callback = exécuté de manière asynchrone
function getUpcomingOK(data) {
    displaySuccessOrErrorCallback("getUpcoming", true);

    var parsedJson = JSON.parse(data);

    $.each(parsedJson.results, function( index, value ) {

        $( "#movie-container" ).append("<div class='box movie-block'>" +
            "<a href='movieDetail.html?movieName=" + getConvertedName(value.title, false) + "'>" +
            "<img src='" + imageUrlPrefix + value.poster_path +
            "' /></a></div>");
    });
}

function getUpcomingNOK(data) {
    displaySuccessOrErrorCallback("getUpcoming", false);
}