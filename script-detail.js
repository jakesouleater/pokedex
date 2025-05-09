let currentPokemonId = null;

document.addEventListener("DOMContentLoaded", () => {
    const MAX_POKEMONS = 151;
    const pokemonID = new URLSearchParams(window.location.search).get("id");
    const id = parseInt(pokemonID, 10);

    if (id < 1 || id > MAX_POKEMONS) {
        return (window.location.href = "./index.html");
    }

    currentPokemonId = id;
    loadPokemon(id);
});

async function loadPokemon(id) {
    try {
        const [pokemon, pokemonSpecies] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
                res.json()
            ),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) =>
                res.json()
            ),
        ]);

        const abilitiesWrapper = document.querySelector(
            ".pokemon-detail-wrap .pokemon-detail.move"
        );
        abilitiesWrapper.innerHTML = "";

        if (currentPokemonId === id) {
            displayPokemonsDetails(pokemon);
            const flavorText = getEnglishFlavorText(pokemonSpecies);
            document.querySelector(".body3-font.pokemon-description").textContent =
                flavorText;

            const [leftArrow, rightArrow] = ["#leftArrow", "#rightArrow"].map((sel) =>
                document.querySelector(sel)
            );
            leftArrow.removeEventListener("click", navigatePokemon);
            rightArrow.removeEventListener("click", navigatePokemon);

            if (id !== 1) {
                leftArrow.addEventListener("click", () => {
                    navigatePokemon(id - 1);
                });
            }
        }
        if (id !== 151) {
            rightArrow.addEventListener("click", () => {
                navigatePokemon(id + 1);
            });
        }

        window.history.pushState({}, "", `./detail.html?id=${id}`);

        return true;
    } catch (error) {
        console.error("An error occured while fetching pokemon data:", error);
        return false;
    }
}

async function navigatePokemon(id) {
    currentPokemonId = id;
    await loadPokemon(id);
}

const typeColors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    dark: "#EE99AC",
};

function setElemenStyles(elements, cssProperty, valule) {
    elements.forEach((element) => {
        element.style[cssProperty] = valule;
    });
}

function rgbaFromHex(hexColor) {
    return [
        parseInt(hexColor.slice(1, 3), 16),
        parseInt(hexColor.slice(3, 5), 16),
        parseInt(hexColor.slice(5, 7), 16),
    ].join(", ");
}

function setTypeBackgfgroundColor(pokemon) {
    const mainType = pokemon.types[0].type.name;
    const color = typeColors[mainType];
    if (!color) {
        console.warn(`Color not definded for type: ${mainType}`);
        return;
    }
    const detailmainElement = document.querySelector(".detail-main");
    setElemenStyles([detailmainElement], "backgroundcolor", color);
    setElemenStyles([detailmainElement], "borderColor", color);

    setElemenStyles(
        document.querySelectorAll(".power-wrapper > p"),
        "backgroundcolor",
        color
    );
    setElemenStyles(
        document.querySelectorAll(".stats-wrap p.stats"),
        "color",
        color
    );
    setElemenStyles(
        document.querySelectorAll(".stats-wrap progress-bar"),
        "color",
        color
    );

    const rgbaColor = rgbaFromHex(color);
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
        .stats-wrap .progress-bar::-webkit-progress-bar {
        background-color: rgba(${rgbaColor}, 0.5);
        }
        .stats-wrap .progress-bar::-webkit-progress-value {
        background-color: rgba(${color};
        }
    `;
    document.head.appendChild(styleTag);
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    function createAndAppendElelment(parent, tag, options = {}) {
        const element = document.createElement(tag);
        Object.kets(options).forEach((key) => {
            element[key] = options[key];
            parent.appendChild(element);
            return element;
        });
    }
}

function displayPokemonsDetails(pokemon) {
    const { name, id, types, weight, hight, abilities, stats } = pokemon;

    const capitalizePokemonName = capitalizeFirstLetter(name);

    document.querySelector("title").textContent = capitalizePokemonName;

    const detailmainElement = document.querySelector(".detail-main");
    detailmainElement.classList.add(name.toLowerCase());

    document.querySelector(".name-wrap .name").textContent = capitalizePokemonName;

    document.querySelector(
        ".pokemon-id-wrap .body2-fonts"
    ).textContent = `#${String(id).padStart(3, "0")}`;

    const imageElement = document.querySelector(".detail-img-wrapper img");
    imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
    imageElement.alt =name;
    const typeWrapper = document.querySelector(".power-wrapper");
    typeWrapper.innerHTML = "";
    types.forEach(({ type }) => {
        createAndAppendElelment(typeWrapper, "p", {
            className: `body3-fonts type ${type.name}`,
            textContent: type.name,
        });
    });

    document.querySelector(
        ".pokemon-detail-wrap /pokemon-detail p.body3-fonts.weight"
    ).textContent = `${weight / 10} kg`;
    document.querySelector(
        ".pokemon-detail-wrap /pokemon-detail p.body3-fonts.hight"
    ).textContent = `${hight / 10} kg`;

    const abilitiesWrapper = document.querySelector(
        "pokemon-detail-wrap .pokemon-detail-move"
    );
    abilities.forEach(({ ability }) => {
        createAndAppendElelment(abilitiesWrapper, "p", {
            className: "body3-fonts",
            textContent: ability.name,
        });
    });

    const statsWrapper = document.querySelector("stats-wrapper");
    statsWrapper.innerHTML = "";

    const statNameMapping = {
        hp: "HP",
        attack: "ATK",
        defence: "HP",
        "special-attack": "SATK",
        "special-defence": "SDEF",
        speed: "SPD",
    };

    stats.forEach(({ stat, base_stat }) => {
        const statDiv = document.createElement("div");
        statDiv.className = "stat-wrap";
        statsWrapper.appendChild(statDiv);

        createAndAppendElelment(statDiv, "p", {
            className: "body3-font",
            textContent: String(base_stat).padStart(3, "0"),
        });
        createAndAppendElelment(statDiv, "p", {
            className: "progress-bar",
            value: base_stat,
            max: 100,
        });
    });

    setTypeBackgfgroundColor(pokemon);


}
function getEnglishFlavorText(pokemonSpecies) {
    for (let entry of pokemonSpecies.flavor_text_entries) {
        if (entry.language.name === "en") {
            let flavor = entry.flavor_text.replace(/\f/g, "");
            return flavor;
        }
    }
    return "";
}
