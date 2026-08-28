import type { NewSchoolRow } from '../schema';

/**
 * Starter data: 15 schools spread across Poland.
 *
 * Names and addresses are realistic (they match existing institutions) and the
 * coordinates are approximate — accurate enough to drop the pin on the right
 * street. `rating` is entirely made up: the MVP has no source of ratings, see
 * the TODO section in README.
 */
export const SEED_SCHOOLS: NewSchoolRow[] = [
  {
    name: 'XIV Liceum Ogólnokształcące im. Stanisława Staszica',
    address: 'ul. Nowowiejska 37a, 00-665 Warszawa',
    latitude: 52.2205,
    longitude: 21.009,
    rating: '4.8',
  },
  {
    name: 'Szkoła Podstawowa nr 12 im. Powstańców Śląskich',
    address: 'ul. Górczewska 15, 01-186 Warszawa',
    latitude: 52.2412,
    longitude: 20.966,
    rating: '4.1',
  },
  {
    name: 'V Liceum Ogólnokształcące im. Augusta Witkowskiego',
    address: 'ul. Studencka 12, 31-116 Kraków',
    latitude: 50.0625,
    longitude: 19.9291,
    rating: '4.7',
  },
  {
    name: 'Szkoła Podstawowa nr 26 im. Andrzeja Struga',
    address: 'ul. Krasickiego 34, 30-503 Kraków',
    latitude: 50.0396,
    longitude: 19.9403,
    rating: '4.0',
  },
  {
    name: 'I Liceum Ogólnokształcące im. Mikołaja Kopernika',
    address: 'ul. Więckowskiego 41, 90-734 Łódź',
    latitude: 51.7727,
    longitude: 19.4479,
    rating: '4.3',
  },
  {
    name: 'Liceum Ogólnokształcące nr III im. Adama Mickiewicza',
    address: 'ul. Składowa 5, 50-209 Wrocław',
    latitude: 51.1215,
    longitude: 17.0399,
    rating: '4.9',
  },
  {
    name: 'VIII Liceum Ogólnokształcące im. Adama Mickiewicza',
    address: 'ul. Głogowska 92, 60-262 Poznań',
    latitude: 52.3921,
    longitude: 16.9017,
    rating: '4.6',
  },
  {
    name: 'III Liceum Ogólnokształcące im. Bohaterów Westerplatte',
    address: 'ul. Topolowa 7, 80-255 Gdańsk',
    latitude: 54.3762,
    longitude: 18.6032,
    rating: '4.5',
  },
  {
    name: 'III Liceum Ogólnokształcące im. Marynarki Wojennej RP',
    address: 'ul. Legionów 27, 81-405 Gdynia',
    latitude: 54.5065,
    longitude: 18.5348,
    rating: '4.2',
  },
  {
    name: 'XIII Liceum Ogólnokształcące',
    address: 'ul. Unisławy 26, 71-402 Szczecin',
    latitude: 53.4404,
    longitude: 14.549,
    rating: '3.9',
  },
  {
    name: 'VI Liceum Ogólnokształcące im. Jana i Jędrzeja Śniadeckich',
    address: 'ul. Staszica 4, 85-011 Bydgoszcz',
    latitude: 53.129,
    longitude: 18.0058,
    rating: '4.0',
  },
  {
    name: 'I Liceum Ogólnokształcące im. Stanisława Staszica',
    address: 'Al. Racławickie 26, 20-043 Lublin',
    latitude: 51.2482,
    longitude: 22.5372,
    rating: '4.4',
  },
  {
    name: 'VI Liceum Ogólnokształcące im. Króla Zygmunta Augusta',
    address: 'ul. Warszawska 8, 15-063 Białystok',
    latitude: 53.132,
    longitude: 23.156,
    rating: '4.5',
  },
  {
    name: 'III Liceum Ogólnokształcące im. Adama Mickiewicza',
    address: 'ul. Mickiewicza 11, 40-092 Katowice',
    latitude: 50.261,
    longitude: 19.0187,
    rating: '4.6',
  },
  {
    name: 'I Liceum Ogólnokształcące im. ks. Stanisława Konarskiego',
    address: 'ul. 3 Maja 15, 35-030 Rzeszów',
    latitude: 50.0364,
    longitude: 22.0043,
    rating: '4.3',
  },
];
