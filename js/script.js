$(document).ready(function(){

    // <<< searchbar >>>
    $('#search').on('submit', runSearchjQuery('newTerm'));

    // <<< load search history from localStorage >>>
    getHistory();

    // <<< run old Search >>>
    var cancelClick, click = true, termSlot = NaN, termChange = false, termID;

    $('#search-history').on('mousedown', function(event) {
        if (click) {
            termSlot = parseInt($(event.target).closest('button').data('name'));
            if (!termChange) {
                cancelClick = setTimeout(function() {setTerm(termSlot);}, 500);
            }
        }
    }).bind('mouseup', function() {
        if (click) {
            clearTimeout(cancelClick);
            if (termSlot > -1) { runSearch('oldTerm', parseInt(termSlot)); }
        }
    }).keypress(function (e) {
        if (e.which == 13 && termChange == true) {
            var newValue = $('#' + termID).val();
            searchHist[termSlot] = newValue;
            backupHistory();
            $('#' + termID).replaceWith("<button class='searchterm' id='" + termID + "' data-name='" + termSlot + "'>" + newValue + "</button>");
            termChange = false;
            click = true;
            paginate = true;
            return;
        }
    });

    // <<< paginate >>>
    var paginate = false;

    if (paginate) {
        $('#backward').on('click', runSearchjQuery('paginate', -1));
        $('#forward').on('click', runSearchjQuery('paginate', 1));
    }

    function setTerm(termSlot) {
        termChange = true;
        click = false;
        paginate = false;
        termID = 'term' + (termSlot + 1);
        $('#' + termID).replaceWith("<input class='searchterm-change' id='" + termID + "' maxlength='29'></input>");
        $('#' + termID).focus(); 
    }

    //<<< run the search >>>
    var offset, terms;

    function runSearchjQuery(action, value) {
        return function(e) {
            e.preventDefault();
            runSearch(action, value);
        }
    }

    function runSearch(action, value) {
        searchtermSet(action, value);
        if (terms == "") return;

        var api_key = "b6eg9u7ffbpn8g8m8hvojpxa";
        var etsyURL = "https://openapi.etsy.com/v2/listings/active.js?keywords="+
            terms+"&limit=100&offset=" + offset + "&includes=Images:1&api_key="+api_key;

        $('#etsy-images').empty().html('</br>searching for <em>"'+ terms + '"</em>');
        
        $.ajax({
            url: etsyURL,
            dataType: 'jsonp',
            success: function(data) {
                if (data.ok) {
                    paginate = true;
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

    function searchtermSet(action, value) {
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
    }

    $('#clear-history').on('click', function() {
        if (confirm("Are you sure you want to delete your history?")) {
            localStorage.clear();
            getHistory();
            $('#etsy-terms').val('').focus();
        }            
    });

});

// <<< Management of Search History >>>

var storage = localStorage;
var searchHist;

function getHistory() {
    if (storage.hasOwnProperty('searchHistory')) {
        searchHist = JSON.parse(storage['searchHistory']);
        searchHist = searchHist.terms;
    } else {
        searchHist = ["", "", "", "", "", "", "", "", "", ""];
        backupHistory();
    }
    updateSearchHistoryInterface();
}
function backupHistory() {
    storage.setItem('searchHistory', JSON.stringify({terms: searchHist}));
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