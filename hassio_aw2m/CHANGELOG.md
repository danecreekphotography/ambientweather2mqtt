# Version

## 4.0.2

* Change the sensor measurement unit for `EventDate` from `timestamp` to `None` in an attempt to fix an issue with Home Assistant version 2023.5.0.

## 4.0.1

* Change the sensor class for EventDate from `unknown` to `timestamp` in an attempt to fix an issue with Home Assistant version 2023.5.0.

## 4.0.0

* Rename the temperature unit from `˚F` to `°F` for compatibility with Home Assistant. Since the name of the
unit changed this is a breaking change.

## 3.0.4

* Update a dependency. No functional changes.

## 3.0.3

* Add support for tracking long-term statistics

## 3.0.2

* Add missing temperature values for stations with more than one temperature sensor

## 3.0.1

* Update dependencies

## 3.0.0

* Hourly Rain unit of measurement corrected. This was a breaking change, it is now reported in `in/h` instead of `inches`.

## 2.1.0

* HomeAssistant add-on support

## 2.0.0

* The `dateUtc` topic is renamed to `entityDate`. This wasa  breaking change. Any automation that used the `dateUtc` topic will need to point to the new `entityDate` topic instead.

## 1.0.0

Initial release of HA addon
