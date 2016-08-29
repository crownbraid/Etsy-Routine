$(document).ready(function(){

    // <<< searchbar >>>
    $('#search').on('submit', runSearch('newTerm'));

    // <<< load search history from localStorage >>>
    getHistory();
    $('#term1').on('click', runSearch('oldTerm', 0));
    $('#term2').on('click', runSearch('oldTerm', 1));
    $('#term3').on('click', runSearch('oldTerm', 2));
    $('#term4').on('click', runSearch('oldTerm', 3));
    $('#term5').on('click', runSearch('oldTerm', 4));

    // <<< paginate >>>
    $('#backward').on('click', runSearch('paginate', -1));
    $('#forward').on('click', runSearch('paginate', 1));
});

function paginate(direction) {

}

var offset, terms;

// <<< Management of Search History >>>
var storage = localStorage;
var searchHist;

function getHistory() {
    if (storage.hasOwnProperty('searchHistory')) {
        searchHist = JSON.parse(storage['searchHistory']);
        searchHist = searchHist.terms;
    } else {
        searchHist = ["", "", "", "", ""];
        backupHistory();
    }
    updateSearchHistoryInterface();
}
function backupHistory() {
    storage.setItem('searchHistory', JSON.stringify({terms: searchHist}));
    console.log(searchHist);
}
function updateSearchHistoryInterface() {
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
    updateSearchHistoryInterface();
    backupHistory();
}
function removeFromHistory(position) {
    searchHist[position] = "";
    updateSearchHistoryInterface();
}


//<<< run the search >>>

function runSearch(action, value) {
    return function(e) {
        e.preventDefault();
        if (action == 'newTerm') {
            terms = $('#etsy-terms').val();
            offset = 0;
        } else if (action == 'paginate') {
            if (offset == undefined) {return}
            // value ==  directional multiplier
            offset += 50 * value
            if (offset < 0) {offset = 0; return;}
        } else if (action == 'oldTerm') {
            // value = index of term in History
            terms = searchHist[value];
            offset = 0;
        } 
        if (terms == "") return;

        var api_key = "b6eg9u7ffbpn8g8m8hvojpxa";
        var etsyURL = "https://openapi.etsy.com/v2/listings/active.js?keywords="+
            terms+"&limit=100&offset=" + offset + "&includes=Images:1&api_key="+api_key;

        $('#etsy-images').empty().text('Searching for '+ terms);
        
        $.ajax({
            url: etsyURL,
            dataType: 'jsonp',
            success: function(data) {
                console.log(data);
                if (data.ok) {
                    if (action == 'newTerm') addToHistory(terms);
                    $('#etsy-images').empty();
                    if (data.count > 0) {
                        $.each(data.results, function(i,item) {
                            $("<img/>").attr("src", item.Images[0].url_75x75).appendTo("#etsy-images").wrap(
                                "<a href='" + item.url + "' target='_blank'></a>"
                            );
                            if (i%5 == 4) {
                                $('<br/>').appendTo('#etsy-images');
                            }
                        });
                    } else {
                        $('<p>No results.</p>').appendTo('#etsy-images');
                    }
                    $('#page-number').text('page ' + (offset / 50 + 1));
                } else {
                    $('#etsy-images').empty();
                    alert(data.error);
                }
            }
        });
        return false;
    }
}

/* 
switch out span with input temporarily and then invert.
*/