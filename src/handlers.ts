import { FastifyRequest, FastifyReply } from "fastify";
import { PokemonWithStats } from "models/PokemonWithStats";
import { formatWithOptions } from "util";
const https = require("https");

export async function getPokemonByName(
  request: FastifyRequest,
  reply: FastifyReply
) {
  var name: string = request.params["name"];

  reply.headers["Accept"] = "application/json";

  const DOMAIN = "pokeapi.co";
  var urlApiPokeman = `/api/v2/pokemon/`;

  // in case name isn't in the url return bad request error
  if (name?.trim() === "")
    reply.code(400).send({ message: "a valid name url parameter is required" });

  urlApiPokeman += `${name}/?offset=20&limit=20`;

  const keepAliveAgent = new https.Agent({ keepAlive: true });

  var options = {
    hostname: DOMAIN,
    port: 443,
    path: urlApiPokeman,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    agent: keepAliveAgent,
  };

  let response;

  try {
    await https
      .get(options, (res) => {
        let data: string = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode != 200)
            return reply.code(res.statusCode).send({ message: data });

          response = JSON.parse(data);
          computeResponse(response, reply);
        });
      })
      .on("error", (e) => {
        throw e;
      });
  } catch (error) {
    return reply
      .code(error.code ?? 500)
      .send({ message: error?.message ?? "error while sending to poke api" });
  }
}

interface ResponsePokemon {
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: { name: string; url: string };
    averageStat?: number;
  }>;
  types: Array<{ slot: number; type: { name: string; url: string } }>;
}

export const computeResponse = async (
  response: ResponsePokemon, //TODO: fix the type
  reply: FastifyReply
) => {
  try {
    const resp = response;

    let types = resp?.types?.map((type) => type?.type).map((type) => type?.url);

    let pokemonTypesPromises = types.map(async (typeUrl) => {
      return new Promise((resolve, _reject) =>
        https.get(typeUrl, (res) => {
          let data: string = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            if (res.statusCode != 200)
              return reply.code(res.statusCode).send({ message: data });

            resolve(JSON.parse(data));
          });
        })
      );
    });

    await Promise.all(pokemonTypesPromises)
      .then((pokemonTypes: any) => {
        const statsResponse = response?.stats;

        const baseStatList = statsResponse.map((stat) => stat.base_stat);
        const averageBaseStat = baseStatList.reduce((a, b) => a + b);

        return reply
          .status(200)
          .send({ data: response, pokemonTypes, averageBaseStat });
      })
      .catch((error) => {
        throw error;
      });
  } catch (error) {
    return reply.code(error?.code ?? 500).send({
      message: error?.message ?? "error while getting pokemonTypes from api",
    });
  }
};
