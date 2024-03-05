# Nopeustesti24

This is a simple web-based implementation of the game [Nopeustesti](https://www.youtube.com/watch?v=mfqy1jFEH2w), in which a player presses buttons in the same order that they light up.

This was largely an exercise in learning the basics of React and StyledComponents. I really don't recommend using React for this kind of a browser-based game. React seems to be very much designed for UI that updates infrequently, not a game that needs to update every frame.

A demo is hosted online at:
https://files.pineapplemachine.com/public/web/nopeustesti24/

# Things left undone

Possible areas for improvement:

- Interaction via keyboard, not just mouse
- Better layout for smaller screens
- Clearer UI indication of a loss due to falling too far behind
- Disregard vite recommended eslint settings and set up something more reasonable
- Add type definitions for xorshift dependency
- Toggleable sound effects
- Toggleable music or background ambiance
- Choose from a set of visual themes
- Submit and track high scores using a simple server
- Automated tests
- Optimize the logic for determining what button to light up at what time

# Build instructions

To run the app locally, clone this repository and run these commands in the root directory:

```
npm i
npx vite
```

To build the app and produce static files, run:

```
npx vite build --base="[base url]"

# For example:
npx vite build --base="https://files.pineapplemachine.com/public/web/nopeustesti24/"
```

# Screenshot

![Screenshot of web app](https://raw.githubusercontent.com/pineapplemachine/nopeustesti24/master/screenshot.png)
