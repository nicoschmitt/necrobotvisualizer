(function() {
    var allPokemon = null;
    var allItems = null;
    var allMoves = null;

    function load(locale) {
        locale = locale || "en";
        $.ajax({
            url: `assets/json/pokemon.${locale}.json`,
            async: false,
            success: (result) => { allPokemon = (typeof result == "string" ? JSON.parse(result) : result); }
        });
        $.ajax({
            url: `assets/json/inventory.${locale}.json`,
            async: false,
            success: (result) => { allItems = (typeof result == "string" ? JSON.parse(result) : result); }
        });
        $.ajax({
            url: `assets/json/pokemon-move.json`,
            async: false,
            success: (result) => { allMoves = JSON.parse(result); }
        });
    }

    var service = {};

    service.init = function(locale) {
        if (allItems == null) load(locale);
    }

    service.getPokemonName = function(id) {
        return allPokemon[id];
    }

    service.getItemName = function(id) {
        return allItems[id];
    }

    service.getMove = function(id) {
      return allMoves[id + ''];
    }

    window.inventoryService = service;
}());
