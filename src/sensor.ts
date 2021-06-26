/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import SensorPayload from "./sensorPayload";

export class Sensor {
  stateTopic: string;
  attributeTopic: string;
  discoveryTopic: string;
  payload: SensorPayload;
}
