# Calibration Ritual Spec

The ritual is a local-only camera interaction that calibrates gaze span, approximate anatomy, hand poses, and presence baseline without transmitting frames.

## Sequence

1. Black screen with white dot in the upper-left: "Look at this dot" for 3 seconds.
2. Dot moves upper-right for 3 seconds.
3. Dot moves lower-right for 3 seconds.
4. Dot moves lower-left for 3 seconds.
5. Prompt: "Show your open palm" for 3 seconds.
6. Prompt: "Make a fist" for 3 seconds.
7. Prompt: "Point at the screen" for 3 seconds.
8. Welcome state shows the presence hash, measurements, and the privacy footer.

Every duration is configurable through `RitualSequencer` steps. The state machine is linear and explicit: no hidden transitions, no network calls, and no implicit storage.

## Output

- Gaze span and normalized screen mapping.
- Estimated interpupillary distance, head width, and viewing distance.
- Hand pose confidence for open palm, fist, and point.
- Resting heart-rate baseline when PPG confidence is high enough.
- Blink rhythm baseline.

## Required Footer

"Your camera frames never left this browser tab."
