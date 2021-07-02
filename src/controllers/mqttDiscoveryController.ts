/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as log from "../log";
import * as sensors from "../entities";
import express from "express";

/**
 * Publishes the discovery event for a specific entity or all entities.
 * @param req Express request
 * @param res Express resposne
 */
export async function discover(req: express.Request, res: express.Response): Promise<void> {
  if (req.params?.entityName) {
    const entity = sensors.entities.get(req.params.entityName);

    if (!entity) {
      log.warn("Discovery", `Unable to publish discovery event for ${req.params.entityName}: entity not found.`);
      res.status(400).send(`Entity not found.`);
      return;
    }

    log.verbose("Discovery", `Triggering MQTT discover event for ${req.params.entityName}`);
    entity.publishDiscovery();
  } else {
    log.verbose("Discovery", "Triggering MQTT discover events for all known sensors.");
    await sensors.discoverAll();
  }
  res.status(200).send("Ok");
}