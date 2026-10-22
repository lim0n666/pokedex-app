//Definimos una interfaz ya que solo vamos a definir propiedades 

import { IStat } from "./stat.model";

//Al ser un modelo asegura que los datos se 
export interface IPokemon {
    id: number;
    name: string;
    type1: string;
    //?: Indica que es opcional (Puede no existir)
    type2?: string;
    sprite: string;
    height: number;
    weight: number;
    abilities: string[];
    hidenAbility?: string;
    //sats:{
    //base_stat: number;
    //name: string;
    //}
    stats: IStat[];
    
}
