import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { Hs100Accessory } from './platformAccessory';


export class Hs100HomebridgePlatform implements DynamicPlatformPlugin {
    public readonly Service: typeof Service = this.api.hap.Service;
    public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

    // this is used to track restored cached accessories
    public readonly accessories: PlatformAccessory[] = [];

    constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
    ) {
        this.log.debug('Finished initializing platform:', this.config.name);

        this.api.on('didFinishLaunching', () => {
            log.debug('Executed didFinishLaunching callback');
            this.loadDevices();
        });
    }

    /**
    * This function is invoked when homebridge restores cached accessories from disk at startup.
    * It should be used to setup event handlers for characteristics and update respective values.
    */
    configureAccessory(accessory: PlatformAccessory) {
        // search in the config if the device still exists and get device information
        const foundDevice = this.config.devices.find(d => d.ip === accessory.context.device.ip);

        if (foundDevice) {
            this.log.info('Loading accessory from cache:', foundDevice.name);
            // update metainformation of the device
            accessory.context.device = foundDevice;
            accessory.displayName = foundDevice.name;
            // add the restored accessory to the accessories cache so we can track if it has already been registered
            this.accessories.push(accessory);
        } else {
            this.log.info('Unregistering accessory since it is no longer present in the config:', accessory.displayName);
            // unregister device if it is no longer in the config
            setTimeout(() => {
                this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
            }, 5000);
        }
    }

    loadDevices() {
        for (const device of this.config.devices) {
            const uuid = this.api.hap.uuid.generate(device.ip);

            const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
            if (existingAccessory) {
                this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
                new Hs100Accessory(this, existingAccessory);
            } else {
                this.log.info('Adding new accessory:', device.name);

                const accessory = new this.api.platformAccessory(device.name, uuid);

                // store a copy of the device object in the `accessory.context`
                // the `context` property can be used to store any data about the accessory you may need
                accessory.context.device = device;

                new Hs100Accessory(this, accessory);
                this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
            }
        }
    }
}
