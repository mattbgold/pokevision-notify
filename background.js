var ioService = new ChromeService();
var pokemonService = new PokevisionService();

window.App = new App(pokemonService, ioService);