<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AljmasLocation;

class AljmasLocationSeeder extends Seeder
{
    public function run(): void
    {
        AljmasLocation::truncate(); // clears all existing rows

        $locations = [
            [
                'order'          => 1,
                'name'           => 'Svetište Gospe od Utočišta',
                'dialect_name'   => 'Naša Gospa',
                'lat'            => 45.529858,
                'lng'            => 18.949635,
                'radius_meters'  => 40,
                'dialect_story'  => 'Ovo je naše svetište, naša Gospa. Crkva je srušena u ratu, al mi smo je digli iz pepela. Sad izgleda ko Noina arka — i jest, spasila nas je. Svake Velike Gospe dođe sto tisuća ljudi, a mi, mještani, samo gledamo i brinemo se da im je dobro.',
                'historical_note'=> 'The Shrine of Our Lady of Refuge, known as the "Danube Swan" for its ark-like shape, was first built in 1708. Destroyed in the 1991 Croatian War of Independence, it was completely rebuilt and reopened in 2004. It is the most important Marian shrine in Slavonia, drawing over 100,000 pilgrims annually.',
                'clue_text'      => 'Gospa te šalje prema lipama. Nađi di se sjene miješaju i di se moli u tišini, blizu nje al ipak malo sa strane.',
                'audio_url'      => null,
                'image_url'      => null,
                'is_final'       => false,
            ],
            [
                'order'          => 2,
                'name'           => 'Gospa pod Lipom',
                'dialect_name'   => 'Pod lipama',
                'lat'            => 45.54873,
                'lng'            => 18.944936,
                'radius_meters'  => 30,
                'dialect_story'  => 'Ovdi su lipe stare ko i selo. Kažu da je tu bila prva kapelica, još od kad je kip donesен iz Baranje. Naši stari su se tu sakupljali i molili i kad nije bilo crkve — pod ovim lipama.',
                'historical_note'=> 'Gospa pod Lipom is a small outdoor shrine beneath old linden trees, one of the oldest prayer spots in Aljmaš — predating the current church building. Pilgrims visit it alongside the main sanctuary.',
                'clue_text'      => 'Sada idi prema brdu. Čeka te put s postajama — svaka priča svoju priču. S vrha se vidi sve: Dunav, ravnica, nebo.',
                'audio_url'      => null,
                'image_url'      => null,
                'is_final'       => false,
            ],
            [
                'order'          => 3,
                'name'           => 'Kalvarija i Križni put',
                'dialect_name'   => 'Na brdu',
                'lat'            => 45.525577,
                'lng'            => 18.950410,
                'radius_meters'  => 35,
                'dialect_story'  => 'Svaki Veliki petak ide se gore. Ima četrnaest postaja, a svaka te malo umori — al to i jest poenta, vele stari. S vrha se vidi Dunav, Drava, Srbija s one strane. Lijepo je to, i tužno i lijepo.',
                'historical_note'=> 'The Calvary and Stations of the Cross lead up a hill at the village entrance. From the top, there are panoramic views across the Danube plain into Serbia. The path has been walked by pilgrims for generations, especially on Good Friday.',
                'clue_text'      => 'Siđi prema vodi. Traži kip dignut visoko, onaj ko gleda prema Dunavu i prema svima koji prolaze.',
                'audio_url'      => null,
                'image_url'      => null,
                'is_final'       => false,
            ],
            [
                'order'          => 4,
                'name'           => 'Kip Uskrslog Krista',
                'dialect_name'   => 'Veliki kip',
                'lat'            => 45.526342,
                'lng'            => 18.949050,
                'radius_meters'  => 30,
                'dialect_story'  => 'Taj kip dosta ljudi i ne primjeti — prođeš pokraj i ne pogledaš gore. A kad pogledaš, vidiš Dunav iza njega i nebo iznad. Stari kažu da on gleda prema Srbiji i čeka da se sve pomiri.',
                'historical_note'=> 'The statue of the Risen Christ stands on an elevated position near the Danube bank, offering one of the best panoramic views in the village. It is often overlooked by visitors focused on the main shrine.',
                'clue_text'      => 'Sad idi do same vode. Di Drava ljubi Dunav — jedno od najljepših mjesta istočne Hrvatske, a malo ko zna za njega.',
                'audio_url'      => null,
                'image_url'      => null,
                'is_final'       => false,
            ],
            [
                'order'          => 5,
                'name'           => 'Ušće Drave u Dunav',
                'dialect_name'   => 'Di se rieke ljube',
                'lat'            => 45.544253,
                'lng'            => 18.919165,
                'radius_meters'  => 50,
                'dialect_story'  => 'Tu di Drava ulazi u Dunav — to je nešto posebno. Dvije rijeke, dvije boje vode, a onda postanu jedna. Moj did je rekao: to je ko kad se dva čovjeka razumiju bez riči. Prosto se spoje i idu dalje.',
                'historical_note'=> 'The confluence of the Drava and Danube rivers near Aljmaš is one of the most geographically significant points in eastern Croatia. The area is part of the "European Amazon" — a vast floodplain wetland of international ecological importance.',
                'clue_text'      => 'Vrati se prema selu, do obale. Tamo di kruzeri pristaju i di ribari znaju više o životu nego većina knjiga.',
                'audio_url'      => null,
                'image_url'      => null,
                'is_final'       => false,
            ],
            [
                'order'          => 6,
                'name'           => 'Putničko pristanište Aljmaš',
                'dialect_name'   => 'Luka Aljmaš',
                'lat'            => 45.531337,
                'lng'            => 18.951628,
                'radius_meters'  => 35,
                'dialect_story'  => 'Ovdi pristaju veliki brodovi, kruzeri što plove iz Beča ili iz Budimpešte. Izađu stranci, pogledaju crkvu, slikaju se i odu. A mi ostanemo. Al dobro je i to — bar znaju da smo tu.',
                'historical_note'=> 'The passenger pier at Aljmaš is a stop on Danube river cruise routes connecting Vienna, Budapest and the Black Sea. The harbour offers views across the Danube into Serbia and is a popular fishing and sunset spot for locals.',
                'clue_text'      => 'Za kraj — idi prema planini iznad sela. Vinograd, šuma, vidikovac. Tamo gdje Aljmaš gleda sam sebe odozgo.',
                'audio_url'      => null,
                'image_url'      => null,
                'is_final'       => false,
            ],
            [
            'order'          => 7,
            'name'           => 'Restoran Vikend',
            'dialect_name'   => 'Na Vikendu',
            'lat'            => 45.529215,
            'lng'            => 18.949960,
            'radius_meters'  => 50,

            'dialect_story'  => 'E ovdi su naši uvik dolazili kad se tila glava odmort. Posli vinograda, posli posla, posli svega. Sidiš, gledaš Dunav i šutíš malo. Kažu stari da se odavde vidi pola svijeta — Aljmaš, Drava, Srbija preko vode. A kad sunce zalazi... e onda svi umuknu.',

            'historical_note'=> 'Restaurant Vikend sits on the slopes above Aljmaš, along the Aljmaš highlands known for vineyards and panoramic viewpoints. From here visitors can see the confluence landscape of the Danube and Drava rivers, surrounding plains and neighbouring Serbia. The area has long been connected with local wine culture, weekend houses and gathering places overlooking the village below.',

            'clue_text'      => 'Završio si. Prošo si Aljmaš od svetišta do rijeke, od molitve do planine. Onako kako prolaze hodočasnici, ribari i naši stari — svaki svojim korakom, svi istim putem.',

            'audio_url'      => null,
            'image_url'      => null,
            'is_final'       => true,
        ],
        ];

        foreach ($locations as $location) {
            AljmasLocation::create($location);
        }
    }
}