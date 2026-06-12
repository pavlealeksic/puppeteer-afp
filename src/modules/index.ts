import type { ProtectionModule } from '../core/module';
import { webdriverModule } from './webdriver';
import { navigatorModule } from './navigator';
import { hardwareModule } from './hardware';
import { languagesModule, timezoneModule } from './locale';
import { screenModule } from './screen';
import { canvasModule } from './canvas';
import { webglModule } from './webgl';
import { audioModule } from './audio';
import { webrtcModule } from './webrtc';
import { fontsModule } from './fonts';
import { clientRectsModule } from './clientrects';
import { mediaCodecsModule } from './codecs';
import { workerModule } from './worker';
import {
  batteryModule,
  connectionModule,
  mediaDevicesModule,
  permissionsModule,
  pluginsModule,
  speechModule,
  touchModule,
} from './misc';

/**
 * Module execution order. Identity-defining modules (webdriver, navigator,
 * hardware) run first so later modules can rely on the spoofed values; noise
 * injectors and ancillary surfaces follow.
 */
export const ALL_MODULES: ProtectionModule[] = [
  webdriverModule,
  navigatorModule,
  hardwareModule,
  languagesModule,
  timezoneModule,
  screenModule,
  pluginsModule,
  connectionModule,
  batteryModule,
  mediaDevicesModule,
  permissionsModule,
  speechModule,
  touchModule,
  canvasModule,
  webglModule,
  audioModule,
  webrtcModule,
  fontsModule,
  clientRectsModule,
  mediaCodecsModule,
  workerModule,
];
