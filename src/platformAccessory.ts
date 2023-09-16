import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { Hs100HomebridgePlatform } from './platform';

export class Hs100Accessory {
    private service: Service;

    private on = false;

    constructor(
        private readonly platform: Hs100HomebridgePlatform,
        private readonly accessory: PlatformAccessory,
    ) {
        this.accessory.getService(this.platform.Service.AccessoryInformation)!
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'TP-Link')
            .setCharacteristic(this.platform.Characteristic.Model, 'HS100')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

        this.service = this.accessory.getService(this.platform.Service.Outlet) || this.accessory.addService(this.platform.Service.Outlet);
        this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.displayName);

        // register handlers for the On/Off Characteristic
        this.service.getCharacteristic(this.platform.Characteristic.On)
            .onSet(this.setOn.bind(this))
            .onGet(this.getOn.bind(this));
    }

    async setOn(value: CharacteristicValue) {
        // implement your own code to turn your device on/off
        this.on = value as boolean;
        this.platform.log.debug('Set Characteristic On ->', value);
    }

    async getOn(): Promise<CharacteristicValue> {
        this.platform.log.debug('Get Characteristic On ->', this.on);
        return this.on;
    }
}
