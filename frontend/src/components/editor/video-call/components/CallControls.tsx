import {
  DisconnectButton,
  TrackToggle,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { PhoneOff } from "lucide-react";
import { CONTROL_BTN_CLASS, DISCONNECT_BTN_CLASS } from "../constants";

interface CallControlsProps {
  controlBtnClass?: string;
}

/** Mic / camera / screenshare toggles + hang up. Shared by floating + fullscreen layouts. */
export function CallControls({ controlBtnClass = CONTROL_BTN_CLASS }: CallControlsProps) {
  return (
    <>
      <TrackToggle
        source={Track.Source.Microphone}
        showIcon
        className={controlBtnClass}
      />
      <TrackToggle
        source={Track.Source.Camera}
        showIcon
        className={controlBtnClass}
      />
      <TrackToggle
        source={Track.Source.ScreenShare}
        showIcon
        className={controlBtnClass}
      />
      <DisconnectButton className={DISCONNECT_BTN_CLASS}>
        <PhoneOff />
      </DisconnectButton>
    </>
  );
}
