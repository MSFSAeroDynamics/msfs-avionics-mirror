import { CASConfig, DefaultConfigFactory } from '@microsoft/msfs-wtg3000-common';

import { AirspeedIndicatorConfig } from '../Components/Airspeed/AirspeedIndicatorConfig';
import { AltimeterConfig } from '../Components/Altimeter/AltimeterConfig';
import { AoaIndicatorConfig } from '../Components/Aoa/AoaIndicatorConfig';
import { NavStatusBoxConfig } from '../Components/NavStatusBox/NavStatusBoxConfig';
import { VsiConfig } from '../Components/VSI/VsiConfig';
import { PfdLayoutConfig } from './PfdLayoutConfig';

/**
 * A configuration object which defines options for the G3000 PFD.
 */
export class PfdConfig {
  private readonly factory = new DefaultConfigFactory();

  /** A config which defines layout options. */
  public readonly layout: PfdLayoutConfig;

  /** The index of the IAU used by the PFD. */
  public readonly iauIndex: number;

  /** A config which defines options for the airspeed indicator. */
  public readonly airspeedIndicator: AirspeedIndicatorConfig;

  /** A config which defines options for the altimeter. */
  public readonly altimeter: AltimeterConfig;

  /** A config which defines options for the vertical speed indicator. */
  public readonly vsi: VsiConfig;

  /** A config which defines options for the angle of attack indicator. */
  public readonly aoaIndicator: AoaIndicatorConfig;

  /** A config which defines options for the navigation status box. */
  public readonly navStatusBox: NavStatusBoxConfig;

  /** A config which defines options for the CAS display. */
  public readonly cas: CASConfig;

  /**
   * Creates a PfdConfig from an XML configuration document.
   * @param xmlConfig An XML configuration document.
   * @param instrumentConfig The root element of the configuration document's section pertaining to the config's
   * instrument.
   */
  constructor(xmlConfig: Document, instrumentConfig: Element | undefined) {
    const root = xmlConfig.getElementsByTagName('PlaneHTMLConfig')[0];

    this.layout = this.parseLayout(instrumentConfig);
    this.iauIndex = this.parseIauIndex(instrumentConfig);
    this.airspeedIndicator = this.parseAirspeedIndicatorConfig(root, instrumentConfig);
    this.altimeter = this.parseAltimeterConfig(root, instrumentConfig);
    this.vsi = this.parseVsiConfig(root, instrumentConfig);
    this.aoaIndicator = this.parseAoaIndicatorConfig(root, instrumentConfig);
    this.navStatusBox = this.parseNavStatusBoxConfig(root, instrumentConfig);
    this.cas = this.parseCasConfig(root, instrumentConfig);
  }

  /**
   * Parses a layout configuration object from a configuration document.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns The layout configuration object defined by the configuration document for this config's instrument.
   */
  private parseLayout(instrumentConfig: Element | undefined): PfdLayoutConfig {
    return new PfdLayoutConfig(instrumentConfig?.querySelector(':scope>PfdLayout') ?? undefined);
  }

  /**
   * Parses the side on which to place the PFD's instrument pane in split mode from a configuration document.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns The side on which to place the PFD's instrument pane in split mode, as defined by the configuration
   * document for this config's instrument.
   */
  private parseSplitPaneSide(instrumentConfig: Element | undefined): 'left' | 'right' | undefined {
    if (instrumentConfig !== undefined) {
      const splitModeInstruments = instrumentConfig.querySelector(':scope>SplitModeInstruments');

      if (splitModeInstruments !== null) {
        switch (splitModeInstruments.textContent?.toLowerCase()) {
          case 'left':
            return 'left';
          case 'right':
            return 'right';
          default:
            console.warn(`Invalid SplitModeInstruments definition: expected 'left' or 'right' but instead got '${splitModeInstruments.textContent}'`);
        }
      }
    }

    return undefined;
  }

  /**
   * Parses an IAU index from a configuration document.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns The IAU index defined by the configuration document for this config's instrument.
   */
  private parseIauIndex(instrumentConfig: Element | undefined): number {
    if (instrumentConfig !== undefined) {
      const iauElement = instrumentConfig.querySelector(':scope>Iau');
      if (iauElement !== null) {
        const iauIndex = Number(iauElement.textContent ?? undefined);
        if (isNaN(iauIndex) || iauIndex < 1 || Math.trunc(iauIndex) !== iauIndex) {
          console.warn('Invalid PfdConfig definition: invalid IAU index (must be a positive integer). Defaulting to 1.');
        } else {
          return iauIndex;
        }
      }
    }

    return 1;
  }

  /**
   * Parses an airspeed indicator configuration object from a configuration document. This method looks in the
   * instrument-specific section first for a config definition. If none can be found or parsed without error, this
   * method will next look in the general section. If none can be found or parsed without error there either, this
   * method will return a default configuration object.
   * @param config The root of the configuration document.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns The airspeed indicator configuration defined by the configuration document, or a default version if the
   * document does not define a valid configuration.
   */
  private parseAirspeedIndicatorConfig(config: Element, instrumentConfig: Element | undefined): AirspeedIndicatorConfig {
    if (instrumentConfig !== undefined) {
      try {
        const airspeedIndicator = instrumentConfig.querySelector(':scope>AirspeedIndicator');
        if (airspeedIndicator !== null) {
          return new AirspeedIndicatorConfig(airspeedIndicator, this.factory);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    try {
      const airspeedIndicator = config.querySelector(':scope>AirspeedIndicator');
      if (airspeedIndicator !== null) {
        return new AirspeedIndicatorConfig(airspeedIndicator, this.factory);
      }
    } catch (e) {
      console.warn(e);
    }

    return new AirspeedIndicatorConfig(undefined, this.factory);
  }

  /**
   * Parses an altimeter configuration object from a configuration document. This method looks in the
   * instrument-specific section first for a config definition. If none can be found or parsed without error, this
   * method will next look in the general section. If none can be found or parsed without error there either, this
   * method will return a default configuration object.
   * @param config The root of the configuration document.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns The altimeter configuration defined by the configuration document, or a default version if the document
   * does not define a valid configuration.
   */
  private parseAltimeterConfig(config: Element, instrumentConfig: Element | undefined): AltimeterConfig {
    if (instrumentConfig !== undefined) {
      try {
        const altimeter = instrumentConfig.querySelector(':scope>Altimeter');
        if (altimeter !== null) {
          return new AltimeterConfig(altimeter, this.factory);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    try {
      const altimeter = config.querySelector(':scope>Altimeter');
      if (altimeter !== null) {
        return new AltimeterConfig(altimeter, this.factory);
      }
    } catch (e) {
      console.warn(e);
    }

    return new AltimeterConfig(undefined, this.factory);
  }

  /**
   * Parses a vertical speed indicator configuration object from a configuration document. This method looks in the
   * instrument-specific section first for a config definition. If none can be found or parsed without error, this
   * method will next look in the general section. If none can be found or parsed without error there either, this
   * method will return a default configuration object.
   * @param config The root of the configuration document.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns The vertical speed indicator configuration defined by the configuration document, or a default version
   * if the document does not define a valid configuration.
   */
  private parseVsiConfig(config: Element, instrumentConfig: Element | undefined): VsiConfig {
    if (instrumentConfig !== undefined) {
      try {
        const vsi = instrumentConfig.querySelector(':scope>Vsi');
        if (vsi !== null) {
          return new VsiConfig(vsi, this.factory);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    try {
      const vsi = config.querySelector(':scope>Vsi');
      if (vsi !== null) {
        return new VsiConfig(vsi, this.factory);
      }
    } catch (e) {
      console.warn(e);
    }

    return new VsiConfig(undefined, this.factory);
  }

  /**
   * Parses an angle of attack indicator configuration object from a configuration document. This method looks in the
   * instrument-specific section first for a config definition. If none can be found or parsed without error, this
   * method will next look in the general section. If none can be found or parsed without error there either, this
   * method will return a default configuration object.
   * @param config The root of the configuration document.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns The angle of attack indicator configuration defined by the configuration document, or a default version
   * if the document does not define a valid configuration.
   */
  private parseAoaIndicatorConfig(config: Element, instrumentConfig: Element | undefined): AoaIndicatorConfig {
    if (instrumentConfig !== undefined) {
      try {
        const navStatusBox = instrumentConfig.querySelector(':scope>AoaIndicator');
        if (navStatusBox !== null) {
          return new AoaIndicatorConfig(navStatusBox, this.factory);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    try {
      const navStatusBox = config.querySelector(':scope>AoaIndicator');
      if (navStatusBox !== null) {
        return new AoaIndicatorConfig(navStatusBox, this.factory);
      }
    } catch (e) {
      console.warn(e);
    }

    return new AoaIndicatorConfig(undefined, this.factory);
  }

  /**
   * Parses a navigation status box configuration object from a configuration document. This method looks in the
   * instrument-specific section first for a config definition. If none can be found or parsed without error, this
   * method will next look in the general section. If none can be found or parsed without error there either, this
   * method will return a default configuration object.
   * @param config The root of the configuration document.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns The navigation status box configuration defined by the configuration document, or a default version
   * if the document does not define a valid configuration.
   */
  private parseNavStatusBoxConfig(config: Element, instrumentConfig: Element | undefined): NavStatusBoxConfig {
    if (instrumentConfig !== undefined) {
      try {
        const navStatusBox = instrumentConfig.querySelector(':scope>NavStatusBox');
        if (navStatusBox !== null) {
          return new NavStatusBoxConfig(navStatusBox, this.factory);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    try {
      const navStatusBox = config.querySelector(':scope>NavStatusBox');
      if (navStatusBox !== null) {
        return new NavStatusBoxConfig(navStatusBox, this.factory);
      }
    } catch (e) {
      console.warn(e);
    }

    return new NavStatusBoxConfig(undefined, this.factory);
  }

  /**
   * Parses a CAS display configuration object from a configuration document. This method looks in the
   * instrument-specific section first for a config definition. If none can be found or parsed without error, this
   * method will next look in the general section. If none can be found or parsed without error there either, this
   * method will return a default configuration object.
   * @param config The root of the configuration document.
   * @param instrumentConfig The root element of the configuration document's section pertaining to this config's
   * instrument.
   * @returns The CAR display configuration defined by the configuration document, or a default version if the
   * document does not define a valid configuration.
   */
  private parseCasConfig(config: Element, instrumentConfig: Element | undefined): CASConfig {
    if (instrumentConfig !== undefined) {
      try {
        const cas = instrumentConfig.querySelector(':scope>CAS');
        if (cas !== null) {
          return new CASConfig(cas, this.factory);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    try {
      const cas = config.querySelector(':scope>CAS');
      if (cas !== null) {
        return new CASConfig(cas, this.factory);
      }
    } catch (e) {
      console.warn(e);
    }

    return new CASConfig(undefined, this.factory);
  }
}