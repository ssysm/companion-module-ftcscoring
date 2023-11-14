import { Regex, type SomeCompanionConfigField } from '@companion-module/base';
import type { InstanceBaseExt } from './util';

export const CLOUD_FMS_HOST = 'https://ftc-scoring.firstinspires.org/local';

export interface FMSConfig {
    host: string;
    port: string;
    eventID: string;
    cloudFMS: boolean;
    cloudFMSYear: string;
}

export function GetConfigFields(_self: InstanceBaseExt<FMSConfig>): SomeCompanionConfigField[] {
    return [
        {
            type: 'textinput',
            id: 'host',
            label: 'FMS IP',
            width: 8,
            default: "localhost",
            tooltip: 'If using Cloud FMS, leave this blank.'
        },
        {
            type: 'textinput',
            id: 'port',
            default: '8080',
            label: 'FMS Port',
            width: 4,
            regex: Regex.PORT,
            tooltip: 'If using Cloud FMS, leave this blank.'
        },
        {
            type: 'checkbox',
            id: 'cloudFMS',
            label: 'Cloud FMS',
            width: 4,
            default: false,
        },
        {
            type: 'textinput',
            id: 'cloudFMSYear',
            label: 'Cloud FMS Year',
            width: 4,
            regex: Regex.NUMBER,
            default: '2024',
            tooltip: 'The year of the event you are connecting to. This is used to determine the correct URL for the Cloud FMS.'
        },
        {
            type: 'textinput',
            id: 'eventID',
            label: 'Event ID',
            width: 6
        }
    ]
}