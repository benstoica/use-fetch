import useFetch from "./use-fetch";

export type Pokemon = {
  abilities: Ability[];
  cries: Cries;
  id: number;
  name: string;
  sprites: Sprites;
  stats: Stat[];
  weight: number;
  height: number;
};

export type Ability = {
  ability: Species;
  is_hidden: boolean;
  slot: number;
};

export type Species = {
  name: string;
  url: string;
};

export type Cries = {
  latest: string;
  legacy: string;
};

export type Sprites = {
  back_default: string;
  back_female: string;
  back_shiny: string;
  back_shiny_female: null | string;
  front_default: string;
  front_female: string;
  front_shiny: string;
  front_shiny_female: string;
};

export type Stat = {
  base_stat: number;
  effort: number;
  stat: Species;
};

const pikachuURL = "https://pokeapi.co/api/v2/pokemon/pikachu";
const charizardURL = "https://pokeapi.co/api/v2/pokemon/charizard";

const UseFetchExample = () => {
  const { loading, data, error, url, updateUrl } = useFetch<Pokemon>(
    pikachuURL,
    {
      headers: {
        Accept: "application/json",
      },
    },
    { immediate: true }
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (url === pikachuURL) {
            updateUrl(charizardURL);
          } else {
            updateUrl(pikachuURL);
          }
        }}
      >
        Switch Pokemon
      </button>
      {loading && <progress />}
      {error && <h1>{error}</h1>}

      {data && (
        <article>
          <header style={{ textTransform: "capitalize" }}>
            #{data.id} - {data.name}
          </header>
          <div>
            <img src={data.sprites.front_default} alt={data.name} />
            <img src={data.sprites.back_default} alt={data.name} />
          </div>
          <hr />
          <dl>
            <dt>Height</dt>
            <dd>{data.weight / 10} kg</dd>
          </dl>
          <dl>
            <dt>Abilities</dt>
            <dd>
              {data.abilities.map((ability) => ability.ability.name).join(", ")}
            </dd>
          </dl>
          <dl>
            <dt>Cry</dt>
            <dd>
              <audio src={data.cries.latest} controls />
            </dd>
          </dl>
          <hr />

          <table className="stried">
            <thead>
              <tr>
                <th scope="col">Stat</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.stats.map((stat) => (
                <tr key={stat.stat.name}>
                  <th scope="row">{stat.stat.name}</th>
                  <td>{stat.base_stat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}
    </>
  );
};

export default UseFetchExample;
