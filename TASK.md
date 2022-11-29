# I assumed that the endpoint need to return the following data from the endpoint

- response which come back from /api/v2/pokemon/:pokemon_name
- pokemonTypes array of the pokemon
- average of the base_stat of the pokemon

# Error handling

- I return 500 status code if https failed to reach the pokemon api , this should be changed to be more realistic but I don't have enough details/requirements about the endpoint
- I return 400 status code BAD_REQUEST if user called my endpoint without putting a pokemon name in the param
- I return 404 status code if the user entered a pokemon name which isn't found in poke.io api

# Test my endpoint

## Success test with data returned

`GET REQUEST http://localhost:3000/poke/fearow`
`GET REQUEST http://localhost:3000/poke/gengar`

## 400 BAD REQUEST test

`GET REQUEST http://localhost:3000/poke/`

## 404 BAD REQUEST test

`GET REQUEST http://localhost:3000/poke/anyrandomnamewhichisntpokemon`
