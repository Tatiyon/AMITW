var jsonPath = "parameters.json";
var api_key = "";
var imageUrlPrefix = "https://image.tmdb.org/t/p/w500/";


var genresId = null;

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

            var movieName = get("movieName");

            //FEATURE : AUTO-COMPLETION DE LA BARRE DE RECHERCHE
            // $(document).ready(function(){
            //     $(function(){
                    $('#recherche').autocomplete({
                        source : function(requete, reponse){ // les deux arguments représentent les données nécessaires au plugin
                            $.ajax({
                                url : "http://api.themoviedb.org/3/search/movie?api_key=" + api_key + "&query=" + getConvertedName($('#recherche').val(), true), // on appelle le script JSON
                                dataType : 'json', // on spécifie bien que le type de données est en JSON
                                success : function(donnee){
                                    reponse($.map(donnee.results, function(objet){
                                        return objet.title; // on retourne cette forme de suggestion
                                    }));
                                }
                            });
                        }
                    });
                // });

            // });

            $( "#formRecherche" ).submit(function( e) {
                e.preventDefault();

                $(location).attr('href', "movieDetail.html?movieName=" + getConvertedName($('#recherche').val(), false));
            });

            theMovieDb.search.getMovie({"query":getConvertedName(movieName, false)}, getMovieOK, getMovieNOK);

        }, jsonPath);
}

function get(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
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
function getMovieOK(data) {
    displaySuccessOrErrorCallback("getMovie", true);

    displayJSON(data);

    var parsedJson = JSON.parse(data);
    var parsedJsonResult = parsedJson.results[0];


    $( "#movieName" ).text(parsedJsonResult.title);
    $( "#movieDescription" ).text(parsedJsonResult.overview);
    $( "#moviePic" ).attr("src", imageUrlPrefix + parsedJsonResult.poster_path);
    $( "#movieVote" ).text(parsedJsonResult.vote_average + " sur " + parsedJsonResult.vote_count + " votants");
    $( "#movieReleaseDate" ).text(parsedJsonResult.release_date);


    genresId = parsedJsonResult.genre_ids;

    theMovieDb.genres.getTvList({}, getGenreListOK, getGenreListNOK);
}

function getMovieNOK(data) {
    displaySuccessOrErrorCallback("getMovie", false);
}

function getGenreListOK(data) {
    displaySuccessOrErrorCallback("getGenreList", true);

    var parsedJson = JSON.parse(data);

    for ( var i in genresId )
    {
        var aGenreId = genresId[i];
        for ( var j in parsedJson.genres ) {
            var aGenreIdFromCollection = parsedJson.genres[j].id;

            if(aGenreId == aGenreIdFromCollection){
                var aGenreNameFromCollection = parsedJson.genres[j].name;

                $( "#genres" ).append(
                    "<li>" + aGenreNameFromCollection +
                    "</li>"
                );
            }
        }
    }
}

function getGenreListNOK(data) {
    displaySuccessOrErrorCallback("getGenreList", false);
}