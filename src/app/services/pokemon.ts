import { Service } from '@angular/core';

import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { IPokemon } from '../models/pokemon.model';

@Service()
export class Pokemon {
  private readonly URL_BASE = 'https://pokeapi.co/api/v2/pokemon';
  private nextURL = `${this.URL_BASE}?offset=0&limit=20`;
  private readonly URL_SPECIES = 'https://pokeapi.co/api/v2/pokemon-species';

  getPokemons() {
    if (this.nextURL) {
      const options = {
        url: this.nextURL,
        params: {},
      };

      // Petición 1: Solicito la lista de pokemons
      return CapacitorHttp.get(options).then(async (response: HttpResponse) => {
        const pokemons: IPokemon[] = [];

        if (response.data) {
          const results = response.data.results;
          this.nextURL = response.data.next;

          // Petición 2: Solicitar por cada registro su detalle completo
          const promises: Promise<HttpResponse>[] = [];
          for (const result of results) {
            const optionsPokemon = {
              url: result.url,
              params: {},
            };
            promises.push(CapacitorHttp.get(optionsPokemon));
          }

          const responses: HttpResponse[] = await Promise.all(promises);
          for (const res of responses) {
            const pokemon = this.procesPokemon(res.data);
            pokemons.push(pokemon);
          }

          // Petición 3: Solicitar la descripción de cada pokemon
          await this.addDescriptions(pokemons);
        }

        return pokemons;
      });
    }
    return null;
  }

  getPokemon(id: number) {
    const options = {
      url: `${this.URL_BASE}/${id}`,
      params: {},
    };

    return CapacitorHttp.get(options).then(async (response: HttpResponse) => {
      const pokemon = this.procesPokemon(response.data);
      pokemon.description = await this.getDescription(pokemon.id);
      return pokemon;
    });
  }

  private async addDescriptions(pokemons: IPokemon[]) {
    await Promise.all(
      pokemons.map(async (pokemon) => {
        pokemon.description = await this.getDescription(pokemon.id);
      })
    );
  }

  private async getDescription(id: number): Promise<string> {
    try {
      const response = await CapacitorHttp.get({
        url: `${this.URL_SPECIES}/${id}`,
        params: {},
      });
      const entries: any[] = response.data.flavor_text_entries ?? [];
      const entry =
        entries.find((e) => e.language.name === 'es') ??
        entries.find((e) => e.language.name === 'en');

      return entry
        ? entry.flavor_text.replace(/[\n\f\r]/g, ' ')
        : 'Sin descripción disponible.';
    } catch (error) {
      console.error(`No se pudo obtener la descripción del pokemon ${id}`, error);
      return 'Sin descripción disponible.';
    }
  }

  private procesPokemon(pokemonData: any): IPokemon {
    const pokemon: IPokemon = {
      id: pokemonData.id,
      name: pokemonData.name,
      type1: pokemonData.types[0].type.name,
      sprite: pokemonData.sprites.front_default,
      weight: pokemonData.weight / 10,
      height: pokemonData.height / 10,
      stats: pokemonData.stats.map((stat: any) => ({
        base_stat: stat.base_stat,
        name: stat.stat.name,
      })),
      abilities: pokemonData.abilities
        .filter((ability: any) => !ability.is_hidden)
        .map((ability: any) => ability.ability.name),
      hiddenAbility: undefined,
    };

    if (pokemonData.types[1]) {
      pokemon.type2 = pokemonData.types[1].type.name;
    }

    const hiddenAbility = pokemonData.abilities.find(
      (ability: any) => ability.is_hidden
    );
    if (hiddenAbility) {
      pokemon.hiddenAbility = hiddenAbility.ability.name;
    }

    return pokemon;
  }
}