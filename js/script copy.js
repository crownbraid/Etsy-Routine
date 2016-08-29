$(document).ready(function(){
    getHistory();
    
    $('#etsy-search').on('submit', runSearch('#etsy-terms'));
    $('#term1').on('click', runSearch('#term1'));
    $('#term2').on('click', runSearch('#term2'));
    $('#term3').on('click', runSearch('#term3'));
    $('#term4').on('click', runSearch('#term4'));
    $('#term5').on('click', runSearch('#term5'));
});



// Management of Search History
var storage = localStorage;
var searchHist;
storage.clear();
function getHistory() {
    if (storage.hasOwnProperty('searchHistory')) {
        searchHist = JSON.parse(storage['searchHistory']);
        searchHist = searchHist.terms;
    } else {
        searchHist = ["", "", "", "", ""];
        backupHistory();
    }
    updateSearchHistory();
}
function backupHistory() {
    storage.setItem('searchHistory', JSON.stringify({terms: searchHist}));
    console.log(searchHist);
}
function updateSearchHistory() {
    var items = searchHist.splice();
    searchHist.forEach(function(term, i) {
       $('#term' + (i + 1)).html(term); 
    });
}
function addToHistory(item) {
    var index = searchHist.findIndex(function(term) {
        return term === "";
    });
    if (index == -1) return;
    searchHist[index] = item;
    updateSearchHistory();
    backupHistory();
}
function removeFromHistory(position) {
    searchHist[position] = "";
    updateSearchHistory();
}


function runSearch(term) {
    return function(e) {
        e.preventDefault();
        var terms = $(term).val();
        var api_key = "b6eg9u7ffbpn8g8m8hvojpxa";
        var etsyURL = "https://openapi.etsy.com/v2/listings/active.js?keywords="+
            terms+"&limit=100&includes=Images:1&api_key="+api_key;

        $('#etsy-images').empty();
        $('<p></p>').text('Searching for '+terms).appendTo('#etsy-images');

        $.ajax({
            url: etsyURL,
            dataType: 'jsonp',
            success: function(data) {
                console.log(data);
                if (data.ok) {
                    addToHistory(terms);
                    $('#etsy-images').empty();
                    if (data.count > 0) {
                        $.each(data.results, function(i,item) {
                            $("<img/>").attr("src", item.Images[0].url_75x75).appendTo("#etsy-images").wrap(
                                "<a href='" + item.url + "'></a>"
                            );
                            if (i%4 == 3) {
                                $('<br/>').appendTo('#etsy-images');
                            }
                        });
                    } else {
                        $('<p>No results.</p>').appendTo('#etsy-images');
                    }
                } else {
                    $('#etsy-images').empty();
                    alert(data.error);
                }
            }
        });
        return false;
    };
}