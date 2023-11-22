import { checkSpell, getResultFromNewWiktionaryAPI } from "./wiktionary";

const main = async () => {
  console.log(await getResultFromNewWiktionaryAPI("Test"));
  console.log(await getResultFromNewWiktionaryAPI("TestWRONGWORD"));

  console.log(await checkSpell("Test"));
  console.log(await checkSpell("TestWRONGWORD"));

  console.log(await checkSpell("limb"));
};

main()
  .then(() => {
    if (typeof process !== "undefined") {
      process.exit(0);
    }
  })
  .catch((e) => {
    console.error(e);
  });
