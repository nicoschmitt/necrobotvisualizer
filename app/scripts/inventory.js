(function() {
    
    var get_traduction = null;

    function load(locale) {
        locale = locale || "en";
        $.ajax({
            url: `assets/translate/.${locale}.json`,
            async: false,
            success: (result) => { 
                get_traduction = JSON.parse(result); 
            }
        });
    }

    var service = {};

    service.init = function(locale) {
        if (get_traduction == null) load(locale);
    }

    service.getPokemonName = function(id) {
        return get_traduction.pokemon[id];
    }

    service.getItemName = function(id) {
        return get_traduction.inventory[id];
    }

    window.inventoryService = service;
}());