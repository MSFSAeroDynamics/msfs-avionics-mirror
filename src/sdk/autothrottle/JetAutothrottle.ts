import { EventBus } from '../data/EventBus';
import { SimVarValueType } from '../data/SimVars';
import { ThrottleLeverManager } from '../fadec/ThrottleLeverManager';
import { Subscribable } from '../sub/Subscribable';
import { AbstractAutothrottle, AutothrottleThrottle, AutothrottleThrottleInfo } from './AbstractAutothrottle';

/**
 * An autothrottle system for turbine jet engines.
 */
export class JetAutothrottle extends AbstractAutothrottle {
  /** @inheritdoc */
  protected createThrottle(
    bus: EventBus,
    info: AutothrottleThrottleInfo,
    servoSpeed: number,
    powerSmoothingConstant: number,
    powerLookahead: Subscribable<number>,
    throttleLeverManager: ThrottleLeverManager | undefined
  ): AutothrottleThrottle {
    return new JetAutothrottleThrottle(bus, info, servoSpeed, powerSmoothingConstant, powerLookahead, throttleLeverManager);
  }
}

/**
 * An autothrottle throttle for turbine jet engines.
 */
class JetAutothrottleThrottle extends AutothrottleThrottle {
  private readonly commandedN1SimVar: string;

  /** @inheritdoc */
  public constructor(
    bus: EventBus,
    info: AutothrottleThrottleInfo,
    servoSpeed: number,
    powerSmoothingConstant: number,
    powerLookahead: Subscribable<number>,
    throttleLeverManager?: ThrottleLeverManager
  ) {
    super(bus, info, servoSpeed, powerSmoothingConstant, powerLookahead, throttleLeverManager);

    this.commandedN1SimVar = `TURB ENG THROTTLE COMMANDED N1:${this.index}`;
  }

  /** @inheritdoc */
  protected getPower(): number {
    return SimVar.GetSimVarValue(this.commandedN1SimVar, SimVarValueType.Percent);
  }
}