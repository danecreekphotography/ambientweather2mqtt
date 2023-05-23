/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Neil Enns. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import express from "express";
import * as mqttManager from "../mqttManager";
import * as entityManager from "../entityManager";
import * as log from "../log";
import EntityNames from "../entityNames";
import EntityDataPayload from "../entityDataPayload";

/**
 * Converts an Ambient Weather "ok" or "not ok" battery value into a 100 or 0 percent value for Home Assistant.
 * @param The raw battery value, either 0 or 1.
 * @returns The converted battery value, either 0 or 100.
 */
function convertBatteryValue(value: string): number {
  // This data isn't provided in the Weather Underground API format and many of the Ambient Weather battery sensors
  // don't report data unless there are external devices attached so there's an initial check for undefined to ensure
  // no value gets set for these entities when there is no data provided.
  if (value === undefined) {
    return undefined;
  }

  return +value ? 100 : 0;
}

/**
 * Converts an Ambient Weather relay state into a Home Assistant switch state.
 * @param value The raw relay value, either 0 or 1.
 * @returns The converted relay value, either "OFF" or "ON".
 */
function convertRelayValue(value: string): string {
  // This data isn't provided in the Weather Underground API format and many of the Ambient Weather battery sensors
  // don't report data unless there are external devices attached so there's an initial check for undefined to ensure
  // no value gets set for these entities when there is no data provided.
  if (value === undefined) {
    return undefined;
  }

  return +value ? "ON" : "OFF";
}

/**
 * Takes a string representation of a UTC date and converts it to a Date object with the UTC timezone.
 * @param value The UTC date as a string
 * @returns A Date object with the UTC date
 */
function convertUtcValue(value: string): Date {
  // This is absolute nonsense. If you just make a new Date with the incoming string it gets assigned the local machine's timezone.
  // There is no way to make a new Date object directly and tell it "this time is in UTC". So you have to do all this crazy
  // date creation stuff, found at https://stackoverflow.com/questions/439630/create-a-date-with-a-set-timezone-without-using-a-string-representation.
  const incomingDate = new Date(value);
  return new Date(
    Date.UTC(
      incomingDate.getFullYear(),
      incomingDate.getMonth(),
      incomingDate.getDate(),
      incomingDate.getHours(),
      incomingDate.getMinutes(),
      incomingDate.getSeconds(),
    ),
  );
}

/**
 * Sets the data payload on a sensor
 * @param key The sensor to set the data on
 * @param value The data to set
 */
function setDataPayload(key: string, value: EntityDataPayload) {
  // Don't set the payload if nothing was provided for the value. This ensures
  // entities that aren't supported by a device don't ever get published to MQTT.
  if (value === undefined) {
    return;
  }

  // Don't set the payload if it's not really a number
  if (typeof value === "number" && isNaN(value)) {
    return;
  }

  entityManager.entities.get(key).value = value;
}

// Sample Ambient Weather call:
// /data/?stationtype=AMBWeatherV4.2.9&PASSKEY=40:F5:20:3A:40:FF&dateutc=2021-07-01+20:34:06&tempinf=73.0&humidityin=56&baromrelin=29.900&
// baromabsin=29.513&tempf=68.2&battout=1&humidity=66&winddir=358&windspeedmph=0.0&windgustmph=0.0&maxdailygust=3.4&hourlyrainin=0.000&
// eventrainin=0.000&dailyrainin=0.000&weeklyrainin=0.000&monthlyrainin=0.000&totalrainin=0.000&solarradiation=93.58&uv=0&batt_co2=1

// Documentation for the APIs:
// Ambient Weather: https://github.com/ambient-weather/api-docs/wiki/Device-Data-Specs
// Weather Underground: https://support.weather.com/s/article/PWS-Upload-Protocol?language=en_US
export function processWeatherData(req: express.Request, res: express.Response): void {
  if (!req.query) {
    log.warn("Weather handler", "No data received, skipping processing the request.");
    return;
  }

  log.verbose("Weather handler", req.url);
  log.verbose("Weather handler", JSON.stringify(req.query, null, 2));

  setDataPayload(EntityNames.BAROMETRICPRESSUREABSOLUTE, +(req.query.baromabsin ?? req.query.absbaromin));
  setDataPayload(EntityNames.BAROMETRICPRESSURERELATIVE, +(req.query.baromrelin ?? req.query.baromin));
  setDataPayload(EntityNames.BATTERY1, convertBatteryValue(req.query.batt1 as string));
  setDataPayload(EntityNames.BATTERY10, convertBatteryValue(req.query.batt10 as string));
  setDataPayload(EntityNames.BATTERY2, convertBatteryValue(req.query.batt2 as string));
  setDataPayload(EntityNames.BATTERY3, convertBatteryValue(req.query.batt3 as string));
  setDataPayload(EntityNames.BATTERY4, convertBatteryValue(req.query.batt4 as string));
  setDataPayload(EntityNames.BATTERY5, convertBatteryValue(req.query.batt5 as string));
  setDataPayload(EntityNames.BATTERY6, convertBatteryValue(req.query.batt6 as string));
  setDataPayload(EntityNames.BATTERY7, convertBatteryValue(req.query.batt7 as string));
  setDataPayload(EntityNames.BATTERY8, convertBatteryValue(req.query.batt8 as string));
  setDataPayload(EntityNames.BATTERY9, convertBatteryValue(req.query.batt9 as string));
  setDataPayload(EntityNames.BATTERYCO2OK, convertBatteryValue(req.query.batt_co2 as string));
  setDataPayload(EntityNames.BATTERYOK, convertBatteryValue(req.query.battout as string));
  setDataPayload(EntityNames.BATTERYPM25OK, convertBatteryValue(req.query.batt_25 as string));
  setDataPayload(EntityNames.CO2, +req.query.co2);
  setDataPayload(EntityNames.DEWPOINT, +req.query.dewptf); // Only available in Weather Underground updates
  setDataPayload(EntityNames.EVENTDATE, convertUtcValue(req.query.dateutc?.toString()).toISOString());
  setDataPayload(EntityNames.HUMIDITY1, +req.query.humidity1);
  setDataPayload(EntityNames.HUMIDITY10, +req.query.humidity10);
  setDataPayload(EntityNames.HUMIDITY2, +req.query.humidity2);
  setDataPayload(EntityNames.HUMIDITY3, +req.query.humidity3);
  setDataPayload(EntityNames.HUMIDITY4, +req.query.humidity4);
  setDataPayload(EntityNames.HUMIDITY5, +req.query.humidity5);
  setDataPayload(EntityNames.HUMIDITY6, +req.query.humidity6);
  setDataPayload(EntityNames.HUMIDITY7, +req.query.humidity7);
  setDataPayload(EntityNames.HUMIDITY8, +req.query.humidity8);
  setDataPayload(EntityNames.HUMIDITY9, +req.query.humidity9);
  setDataPayload(EntityNames.HUMIDITYINDOOR, +(req.query.humidityin ?? req.query.indoorhumidity));
  setDataPayload(EntityNames.HUMIDITYOUTDOOR, +req.query.humidity);
  setDataPayload(EntityNames.PM25, +req.query.pm25);
  setDataPayload(EntityNames.PM25_24HOUR, +req.query.pm25_24h);
  setDataPayload(EntityNames.PM25INDOOR, +req.query.pm25_in);
  setDataPayload(EntityNames.PM25INDOOR_24HOUR, +req.query.pm25_in_24h);
  setDataPayload(EntityNames.RAIN24HOUR, +req.query["24hourrainin"]);
  setDataPayload(EntityNames.RAINDAILY, +(req.query.dailyrainin ?? req.query.rainin));
  setDataPayload(EntityNames.RAINEVENT, +req.query.eventrainin);
  setDataPayload(EntityNames.RAINHOURLY, +req.query.hourlyrainin);
  setDataPayload(EntityNames.RAINMONTHLY, +req.query.monthlyrainin);
  setDataPayload(EntityNames.RAINTOTAL, +req.query.totalrainin);
  setDataPayload(EntityNames.RAINWEEKLY, +req.query.weeklyrainin);
  setDataPayload(EntityNames.RELAY1, convertRelayValue(req.query.relay1 as string));
  setDataPayload(EntityNames.RELAY10, convertRelayValue(req.query.relay10 as string));
  setDataPayload(EntityNames.RELAY2, convertRelayValue(req.query.relay2 as string));
  setDataPayload(EntityNames.RELAY3, convertRelayValue(req.query.relay3 as string));
  setDataPayload(EntityNames.RELAY4, convertRelayValue(req.query.relay4 as string));
  setDataPayload(EntityNames.RELAY5, convertRelayValue(req.query.relay5 as string));
  setDataPayload(EntityNames.RELAY6, convertRelayValue(req.query.relay6 as string));
  setDataPayload(EntityNames.RELAY7, convertRelayValue(req.query.relay7 as string));
  setDataPayload(EntityNames.RELAY8, convertRelayValue(req.query.relay8 as string));
  setDataPayload(EntityNames.RELAY9, convertRelayValue(req.query.relay9 as string));
  setDataPayload(EntityNames.SOILHUMIDITY1, +req.query.soilhum1);
  setDataPayload(EntityNames.SOILHUMIDITY10, +req.query.soilhum10);
  setDataPayload(EntityNames.SOILHUMIDITY2, +req.query.soilhum2);
  setDataPayload(EntityNames.SOILHUMIDITY3, +req.query.soilhum3);
  setDataPayload(EntityNames.SOILHUMIDITY4, +req.query.soilhum4);
  setDataPayload(EntityNames.SOILHUMIDITY5, +req.query.soilhum5);
  setDataPayload(EntityNames.SOILHUMIDITY6, +req.query.soilhum6);
  setDataPayload(EntityNames.SOILHUMIDITY7, +req.query.soilhum7);
  setDataPayload(EntityNames.SOILHUMIDITY8, +req.query.soilhum8);
  setDataPayload(EntityNames.SOILHUMIDITY9, +req.query.soilhum9);
  setDataPayload(EntityNames.SOILTEMPERATURE1, +req.query.soiltemp1f);
  setDataPayload(EntityNames.SOILTEMPERATURE10, +req.query.soiltemp10f);
  setDataPayload(EntityNames.SOILTEMPERATURE2, +req.query.soiltemp2f);
  setDataPayload(EntityNames.SOILTEMPERATURE3, +req.query.soiltemp3f);
  setDataPayload(EntityNames.SOILTEMPERATURE4, +req.query.soiltemp4f);
  setDataPayload(EntityNames.SOILTEMPERATURE5, +req.query.soiltemp5f);
  setDataPayload(EntityNames.SOILTEMPERATURE6, +req.query.soiltemp6f);
  setDataPayload(EntityNames.SOILTEMPERATURE7, +req.query.soiltemp7f);
  setDataPayload(EntityNames.SOILTEMPERATURE8, +req.query.soiltemp8f);
  setDataPayload(EntityNames.SOILTEMPERATURE9, +req.query.soiltemp9f);
  setDataPayload(EntityNames.SOLARRADIATION, +req.query.solarradiation);
  setDataPayload(EntityNames.TEMPERATURE1, +req.query.temp1f);
  setDataPayload(EntityNames.TEMPERATURE2, +req.query.temp2f);
  setDataPayload(EntityNames.TEMPERATURE3, +req.query.temp3f);
  setDataPayload(EntityNames.TEMPERATURE4, +req.query.temp4f);
  setDataPayload(EntityNames.TEMPERATURE5, +req.query.temp5f);
  setDataPayload(EntityNames.TEMPERATURE6, +req.query.temp6f);
  setDataPayload(EntityNames.TEMPERATURE7, +req.query.temp7f);
  setDataPayload(EntityNames.TEMPERATURE8, +req.query.temp8f);
  setDataPayload(EntityNames.TEMPERATURE9, +req.query.temp9f);
  setDataPayload(EntityNames.TEMPERATURE10, +req.query.temp10f);
  setDataPayload(EntityNames.TEMPERATUREINDOOR, +(req.query.tempinf ?? req.query.indoortempf));
  setDataPayload(EntityNames.TEMPERATUREOUTDOOR, +req.query.tempf);
  setDataPayload(EntityNames.UV, +req.query.uv);
  setDataPayload(EntityNames.WINDCHILL, +req.query.windchillf); // Only available in Weather Underground updates
  setDataPayload(EntityNames.WINDDIRECTION, +req.query.winddir);
  setDataPayload(EntityNames.WINDGUST, +req.query.windgustmph);
  setDataPayload(EntityNames.WINDMAXDAILYGUST, +req.query.maxdailygust);
  setDataPayload(EntityNames.WINDSPEED, +req.query.windspeedmph);

  entityManager.publishAll();
  mqttManager.publishOnline();

  res.status(200).send("Ok");
}
