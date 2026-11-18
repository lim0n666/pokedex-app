import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  LoadingController,
  IonGrid,
  IonCol,
  IonRow,
  IonImg,
  IonText,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
} from '@ionic/angular';
import { Pokemon } from '../../../services/pokemon';
import { IPokemon } from '../../../models/pokemon.model';

@Component({
  selector: 'app-list-pokemon',
  templateUrl: './list-pokemon.page.html',
  styleUrls: ['./list-pokemon.page.scss'],
  imports: [
    IonContent,
    IonGrid,
    IonCol,
    IonRow,
    IonImg,
    IonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
  ],
})
export class ListPokemonPage {
  private pokemonService = inject(Pokemon);
  private loadingController = inject(LoadingController);
  private router = inject(Router);

  public pokemons = signal<IPokemon[]>([]);

  ionViewWillEnter() {
    this.morePokemon();
  }

  async morePokemon(event?: InfiniteScrollCustomEvent) {
    const promisePokemons = this.pokemonService.getPokemons();

    if (promisePokemons) {
      let loading: HTMLIonLoadingElement | undefined;
      if (!event) {
        loading = await this.loadingController.create({
          message: 'Cargando Pokémons...',
        });
        await loading.present();
      }

      promisePokemons
        .then((pokemons: IPokemon[]) => {
          this.pokemons.update((actuales) => actuales.concat(pokemons));
        })
        .catch((error) => {
          console.error('Error al obtener los pokémon:', error);
        })
        .finally(() => {
          loading?.dismiss();
          event?.target.complete();
        });
    } else {
      event?.target.complete();
    }
  }

  goToDetail(pokemon: IPokemon) {
    this.router.navigate(['detail-pokemon', pokemon.id]);
  }
}