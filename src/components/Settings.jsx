import React from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { Popover, Slider } from 'antd';
import useStore from '../store/useStore';

const SPEED_OPTIONS = {
    0: { label: 'Fast', value: 350 },
    1: { label: 'Normal', value: 700 },
    2: { label: 'Slow', value: 1200 },
};

const getSpeedPosition = (speed) => {
    const entry = Object.entries(SPEED_OPTIONS).find(([, option]) => option.value === speed);
    return Number(entry?.[0] ?? 1);
};

const Settings = () => {
    const autoRunSpeed = useStore((state) => state.autoRunSpeed);
    const setAutoRunSpeed = useStore((state) => state.setAutoRunSpeed);
    const speedPosition = getSpeedPosition(autoRunSpeed);
    const speedLabel = SPEED_OPTIONS[speedPosition].label;

    const settingsContent = (
        <div className="settings-panel">
            <div className="settings-row">
                <span>Timeline Speed</span>
                <strong>{speedLabel}</strong>
            </div>
            <Slider
                min={0}
                max={2}
                step={1}
                value={speedPosition}
                onChange={(position) => setAutoRunSpeed(SPEED_OPTIONS[position].value)}
                marks={{
                    0: 'Fast',
                    1: 'Normal',
                    2: 'Slow',
                }}
                tooltip={{ formatter: null }}
            />
        </div>
    );

    return (
        <Popover content={settingsContent} title="Settings" trigger="click" placement="topRight">
            <button
                className="settings-floating-button"
                type="button"
                aria-label="Open settings"
                title="Settings"
            >
                <SettingOutlined />
            </button>
        </Popover>
    );
};

export default Settings;
