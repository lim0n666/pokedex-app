import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonProgressBar,
  IonFab,
  IonFabButton,
  IonIcon,
  LoadingController,
  NavController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { Pokemon } from '../../services/pokemon';
import { IPokemon } from '../../models/pokemon.model';

@Component({
  selector: 'app-detail-pokemon',
  templateUrl: './detail-pokemon.page.html',
  styleUrls: ['./detail-pokemon.page.scss'],
  imports: [
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonProgressBar,
    IonFab,
    IonFabButton,
    IonIcon,
    CommonModule,
    FormsModule,
  ],
})
export class DetailPokemonPage implements OnInit {
  private route = inject(ActivatedRoute);
  private pokemonService = inject(Pokemon);
  private loadingController = inject(LoadingController);
  private navController = inject(NavController);

  public pokemon = signal<IPokemon | undefined>(undefined);

  private readonly MAX_STAT = 255;

  private readonly statNames: Record<string, string> = {
    hp: 'PS',
    attack: 'Ataque',
    defense: 'Defensa',
    'special-attack': 'At. Esp.',
    'special-defense': 'Def. Esp.',
    speed: 'Velocidad',
  };

  private readonly typeNames: Record<string, string> = {
    normal: 'Normal',
    fire: 'Fuego',
    water: 'Agua',
    electric: 'Eléctrico',
    grass: 'Planta',
    ice: 'Hielo',
    fighting: 'Lucha',
    poison: 'Veneno',
    ground: 'Tierra',
    flying: 'Volador',
    psychic: 'Psíquico',
    bug: 'Bicho',
    rock: 'Roca',
    ghost: 'Fantasma',
    dragon: 'Dragón',
    dark: 'Siniestro',
    steel: 'Acero',
    fairy: 'Hada',
  };

  constructor() {
    addIcons({ close });
  }

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      const loading = await this.loadingController.create({
        message: 'Cargando Pokémon...',
      });
      await loading.present();

      this.pokemonService
        .getPokemon(id)
        .then((pokemon: IPokemon) => this.pokemon.set(pokemon))
        .catch((error) => console.error('Error al obtener el pokémon:', error))
        .finally(() => loading.dismiss());
    }
  }

  close() {
    this.navController.back();
  }

  statLabel(name: string): string {
    return this.statNames[name] ?? name;
  }

  typeLabel(type: string): string {
    return this.typeNames[type] ?? type;
  }

  statProgress(value: number): number {
    return Math.min(value / this.MAX_STAT, 1);
  }

  statColor(value: number): 'danger' | 'warning' | 'success' {
    if (value < 50) return 'danger';
    if (value < 80) return 'warning';
    return 'success';
  }
}