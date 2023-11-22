const cache = new Map<string, boolean>();

function isWordInCache(word: string): boolean {
  const cached = cache.get(word);

  if (!cached) {
    return false;
  }

  return true;
}

function setWordInCache(word: string, result: boolean) {
  cache.set(word, result);
}

export const getResultFromNewWiktionaryAPI = async (
  word: string,
): Promise<boolean> => {
  const url = `https://en.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(
    word,
  )}&format=json`;

  const response = await fetch(url)
    .then((r) => r.json())
    .catch((e) => {
      console.error(e);
      return null;
    });

  if (!response) {
    return false;
  }

  try {
    const result: NewWiktionaryAPIResponse = response;

    if (!result || !result.query || !result.query.pages) {
      return false;
    }

    const isMissing = result.query.pages["-1"];

    if (!isMissing) {
      const pageId = parseInt(Object.keys(result.query.pages)[0]);

      if (!isNaN(pageId) && pageId > 0) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(error);
  }

  return false;
};

export async function checkSpell(word: string): Promise<boolean> {
  word = word.toLowerCase();

  if (isWordInCache(word) === true) {
    return true;
  }

  if ((await getResultFromNewWiktionaryAPI(word)) === true) {
    return true;
  }

  const result = await getResultFromOldWiktionaryAPI(word);

  return result;
}

async function getResultFromOldWiktionaryAPI(word: string): Promise<boolean> {
  const url = `https://en.wiktionary.org/w/api.php?action=opensearch&format=json&formatversion=2&search=${encodeURIComponent(
    word.toLowerCase(),
  )}&namespace=0&limit=2`;

  const response = await fetch(url)
    .then((r) => r.json())
    .catch((e) => {
      console.error(e);
      return null;
    });

  if (!response) {
    return false;
  }

  try {
    const results: WiktionaryAPIResponse = response;

    const foundWords = results[1];

    if (
      foundWords instanceof Array &&
      foundWords
        .filter((w) => typeof w === "string")
        .map((w) => w.toLowerCase())
        .includes(word.toLowerCase())
    ) {
      setWordInCache(word, true);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
  }

  return false;
}

type WiktionaryAPIResponse = [string, [string, string] | []];

interface NewWiktionaryAPIResponse {
  batchcomplete?: string;
  query?: Query;
}

interface Query {
  pages?: Pages;
}

type Pages =
  | { "-1": MissingPage }
  | {
      [key: string]: Page;
    };

interface Page {
  pageid?: number;
  ns?: number;
  title?: string;
}

interface MissingPage {
  ns?: number;
  title?: string;
  missing?: string;
}
