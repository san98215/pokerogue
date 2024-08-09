import {afterEach, beforeAll, beforeEach, describe, expect, it, vi} from "vitest";
import Phaser from "phaser";
import GameManager from "#app/test/utils/gameManager";
import overrides from "#app/overrides";
import { TurnInitPhase } from "#app/phases";
import { getMovePosition } from "#app/test/utils/gameManagerUtils";
import { Stat } from "#app/data/pokemon-stat";
import { Abilities } from "#enums/abilities";
import { Moves } from "#enums/moves";
import { Species } from "#enums/species";
import { SpeedSwappedTag } from "#app/data/battler-tags.js";

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

      vi.spyOn(overrides, "BATTLE_TYPE_OVERRIDE", "get").mockReturnValue("single");

      vi.spyOn(overrides, "OPP_SPECIES_OVERRIDE", "get").mockReturnValue(Species.RATTATA);
      vi.spyOn(overrides, "OPP_MOVESET_OVERRIDE", "get").mockReturnValue([Moves.SPLASH, Moves.SPLASH, Moves.SPLASH, Moves.SPLASH]);
      vi.spyOn(overrides, "OPP_ABILITY_OVERRIDE", "get").mockReturnValue(Abilities.NONE);

      vi.spyOn(overrides, "STARTING_LEVEL_OVERRIDE", "get").mockReturnValue(100);
      vi.spyOn(overrides, "MOVESET_OVERRIDE", "get").mockReturnValue([Moves.SPEED_SWAP, Moves.SPLASH]);
      vi.spyOn(overrides, "ABILITY_OVERRIDE", "get").mockReturnValue(Abilities.NONE);
    });

    it("Speed stats of player pokemon and enemy pokemon should be swapped when used once", { timeout: 10000 }, async () => {
      await game.startBattle([Species.ALOLA_RAICHU]);

      const user = game.scene.getPlayerPokemon();
      const enemy = game.scene.getEnemyPokemon();
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

      const user = game.scene.getPlayerPokemon();
      const enemy = game.scene.getEnemyPokemon();
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

      const user = game.scene.getPlayerPokemon();
      const enemy = game.scene.getEnemyPokemon();
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

      const user = game.scene.getPlayerPokemon();
      const enemy = game.scene.getEnemyPokemon();
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
