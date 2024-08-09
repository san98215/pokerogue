import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import Phaser from "phaser";
import GameManager from "#app/test/utils/gameManager";
import { TurnInitPhase } from "#app/phases";
import { getMovePosition } from "#app/test/utils/gameManagerUtils";
import { Stat } from "#app/data/pokemon-stat";
import { Abilities } from "#enums/abilities";
import { Moves } from "#enums/moves";
import { Species } from "#enums/species";
import { SpeedSwappedTag } from "#app/data/battler-tags.js";
import { SPLASH_ONLY } from "#test/utils/testUtils";

describe("Moves - Speed Swap", () => {
  describe("integration tests", () => {
    let phaserGame: Phaser.Game;
    let game: GameManager;

    beforeAll(() => {
      phaserGame = new Phaser.Game({ type: Phaser.HEADLESS });
    });

    afterEach(() => {
      game.phaseInterceptor.restoreOg();
    });

    beforeEach(() => {
      game = new GameManager(phaserGame);

      game.override.battleType("single");

      game.override.enemySpecies(Species.RATTATA);
      game.override.enemyLevel(100);
      game.override.enemyMoveset(SPLASH_ONLY);
      game.override.enemyAbility(Abilities.NONE);

      game.override.startingLevel(100);
      game.override.moveset([Moves.SPEED_SWAP, Moves.SPLASH]);
      game.override.ability(Abilities.NONE);
    });

    it("Speed stats of player pokemon and enemy pokemon should be swapped when used once", { timeout: 10000 }, async () => {
      await game.startBattle([Species.ALOLA_RAICHU]);

      const user = game.scene.getPlayerPokemon()!;
      const enemy = game.scene.getEnemyPokemon()!;
      const origUserSpd = user.getStat(Stat.SPD);
      const origEnemySpd = enemy.getStat(Stat.SPD);


      expect(user.getTag(SpeedSwappedTag)).toBeUndefined();
      expect(enemy.getTag(SpeedSwappedTag)).toBeUndefined();

      game.doAttack(getMovePosition(game.scene, 0, Moves.SPEED_SWAP));
      await game.phaseInterceptor.to(TurnInitPhase);

      expect(user.getTag(SpeedSwappedTag)).toBeDefined();
      expect(enemy.getTag(SpeedSwappedTag)).toBeDefined();
      expect(user.getStat(Stat.SPD)).toBe(origEnemySpd);
      expect(enemy.getStat(Stat.SPD)).toBe(origUserSpd);
    });

    it("Speed swap can be used multiple times", { timeout: 10000 }, async () => {
      await game.startBattle([Species.ALOLA_RAICHU]);

      const user = game.scene.getPlayerPokemon()!;
      const enemy = game.scene.getEnemyPokemon()!;
      const origUserSpd = user.getStat(Stat.SPD);
      const origEnemySpd = enemy.getStat(Stat.SPD);


      expect(user.getTag(SpeedSwappedTag)).toBeUndefined();
      expect(enemy.getTag(SpeedSwappedTag)).toBeUndefined();

      game.doAttack(getMovePosition(game.scene, 0, Moves.SPEED_SWAP));
      await game.phaseInterceptor.to(TurnInitPhase);
      game.doAttack(getMovePosition(game.scene, 0, Moves.SPEED_SWAP));
      await game.phaseInterceptor.to(TurnInitPhase);

      expect(user.getTag(SpeedSwappedTag)).toBeDefined();
      expect(enemy.getTag(SpeedSwappedTag)).toBeDefined();
      expect(user.getStat(Stat.SPD)).toBe(origUserSpd);
      expect(enemy.getStat(Stat.SPD)).toBe(origEnemySpd);
    });

    it("SpeedSwapped battler tag should lapse on battle end", { timeout: 10000 }, async () => {
      await game.startBattle([Species.ALOLA_RAICHU]);

      const user = game.scene.getPlayerPokemon()!;
      const enemy = game.scene.getEnemyPokemon()!;
      const origUserSpd = user.getStat(Stat.SPD);

      expect(user.getTag(SpeedSwappedTag)).toBeUndefined();
      expect(enemy.getTag(SpeedSwappedTag)).toBeUndefined();

      game.doAttack(getMovePosition(game.scene, 0, Moves.SPEED_SWAP));
      await game.doKillOpponents();
      await game.toNextWave();

      expect(user.getTag(SpeedSwappedTag)).toBeUndefined();
      expect(user.getStat(Stat.SPD)).toBe(origUserSpd);
    });

    it("SpeedSwapped battler tag should store the pokemon's original speed stat", { timeout: 10000 }, async () => {
      await game.startBattle([Species.ALOLA_RAICHU]);

      const user = game.scene.getPlayerPokemon()!;
      const enemy = game.scene.getEnemyPokemon()!;
      const origUserSpd = user.getStat(Stat.SPD);
      const origEnemySpd = enemy.getStat(Stat.SPD);

      game.doAttack(getMovePosition(game.scene, 0, Moves.SPEED_SWAP));
      await game.phaseInterceptor.to(TurnInitPhase);

      expect(user.getTag(SpeedSwappedTag)).toBeDefined();
      expect(enemy.getTag(SpeedSwappedTag)).toBeDefined();
      expect( (user.getTag(SpeedSwappedTag) as SpeedSwappedTag).origSpd ).toBe(origUserSpd);
      expect( (enemy.getTag(SpeedSwappedTag) as SpeedSwappedTag).origSpd ).toBe(origEnemySpd);
    });
  });
});
